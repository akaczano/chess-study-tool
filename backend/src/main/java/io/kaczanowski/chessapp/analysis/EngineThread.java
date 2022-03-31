package io.kaczanowski.chessapp.analysis;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class EngineThread {

    public static final String ENGINE_DIR = "engines";

    private EngineState[] state;
    private Process process;
    private volatile EngineStatus status;
    private PrintWriter in;
    private Scanner out;
    private Thread outputThread;

    private Map<String, Option> options;

    private long lastQuery;

    private final Object commandLock = new Object();

    public void sendCommand(String command) {
        in.println(command);
        in.flush();
        lastQuery = System.currentTimeMillis();
    }

    public void kill() {
        this.process.destroy();
        this.outputThread.interrupt();
    }

    public EngineStatus getStatus() {
        return this.status;
    }

    public long getLastQuery() {
        return this.lastQuery;
    }

    public boolean isChessMove(String token) {
        if (token.length() < 4 || token.length() > 5) return false;
        for (int i = 0; i < 4; i++) {
            char c = token.charAt(i);
            if (i % 2 == 0 && (c < 'a' || c > 'h')) return false;
            if (i % 2 != 0 && (c < '0' || c > '9')) return false;
        }
        if (token.length() > 4) {
            char p = token.charAt(4);
            return p == 'r' || p == 'n' || p == 'b' || p == 'q';
        }
        return true;
    }

    public void handleOut() {
        while (out.hasNextLine()) {
            String line = out.nextLine();
            String[] tokens = line.split(" ");
            if (tokens.length < 1) continue;
            synchronized (commandLock) {
                if (tokens[0].equalsIgnoreCase("option")) {
                    Option opt = new Option();
                    StringBuilder name = null;
                    for (int i = 1; i < tokens.length; i++) {
                        if (tokens[i].equalsIgnoreCase("name") && name == null) {
                            name = new StringBuilder();
                        } else if (tokens[i].equalsIgnoreCase("type")) {
                            if (tokens.length > i + 1) {
                                for (Option.Type t : Option.Type.values()) {
                                    if (t.getToken().equalsIgnoreCase(tokens[i + 1])) {
                                        opt.setType(t);
                                    }
                                }
                                i++;
                            }
                        } else if (tokens[i].equalsIgnoreCase("default")) {
                            if (tokens.length > i + 1) {
                                opt.setDefaultValue(tokens[++i]);
                            }
                        } else if (tokens[i].equalsIgnoreCase("min")) {
                            if (tokens.length > i + 1) {
                                opt.setMin(Integer.parseInt(tokens[++i]));
                            }
                        } else if (tokens[i].equalsIgnoreCase("max")) {
                            if (tokens.length > i + 1) {
                                opt.setMax(Integer.parseInt(tokens[++i]));
                            }
                        } else if (name != null) {
                            if (name.length() > 0) name.append(" ");
                            name.append(tokens[i]);
                        }
                    }
                    if (name != null) opt.setName(name.toString());
                    if (opt.isValid()) options.put(opt.getName(), opt);
                } else if (tokens[0].equalsIgnoreCase("info")) {
                    if (state == null) continue;
                    EngineState es = state[0];
                    List<String> pv = null;
                    for (int i = 1; i < tokens.length; i++) {
                        if (tokens[i].equalsIgnoreCase("depth")) {
                            es.setDepth(Integer.parseInt(tokens[++i]));
                        } else if (tokens[i].equalsIgnoreCase("time")) {
                            es.setTime(Long.parseLong(tokens[++i]));
                        } else if (tokens[i].equalsIgnoreCase("nodes")) {
                            es.setNodes(Integer.parseInt(tokens[++i]));
                        } else if (tokens[i].equalsIgnoreCase("multipv")) {
                            int pvi = Integer.parseInt(tokens[++i]) - 1;
                            if (pvi < this.state.length) {
                                es = state[pvi];
                            }
                        } else if (tokens[i].equalsIgnoreCase("score")) {
                            es.setScoreType(tokens[++i].equalsIgnoreCase("cp") ?
                                    EngineState.EvalType.CENTIPAWN : EngineState.EvalType.MATE);
                            es.setScore(Integer.parseInt(tokens[++i]));
                        } else if (tokens[i].equalsIgnoreCase("pv")) {
                            pv = new ArrayList<>();
                        } else if (tokens[i].equalsIgnoreCase("tbhits")) {
                            es.setTbhits(Integer.parseInt(tokens[++i]));
                        } else if (tokens[i].equalsIgnoreCase("nps")) {
                            es.setNps(Integer.parseInt(tokens[++i]));
                        } else if (pv != null && isChessMove(tokens[i])) {
                            pv.add(tokens[i]);
                        }
                    }
                    if (pv != null) es.setPrincipleVariation(pv);
                } else if (tokens[0].equalsIgnoreCase("uciok")) {
                    this.status = EngineStatus.READY;
                }

                // Process command
            }
        }
    }

    public EngineThread(String engineName) throws IOException {
        String file = String.format("%s/%s", ENGINE_DIR, engineName);

        this.process = Runtime.getRuntime().exec(file);
        this.status = EngineStatus.LOADED;
        this.in = new PrintWriter(process.getOutputStream());
        this.out = new Scanner(process.getInputStream());

        this.options = new HashMap<>();
        this.outputThread = new Thread(this::handleOut);
        this.outputThread.start();
        sendCommand("uci");
    }

    public void start(EngineInit init) {
        synchronized (commandLock) {
            int multipv = 1;
            for (EngineInit.InitOption o : init.getOptions()) {
                if (options.containsKey(o.getName())) {
                    Option opt = options.get(o.getName());
                    in.print(String.format("setoption name %s", o.getName()));
                    if (opt.getType() != Option.Type.BUTTON) {
                        in.print(String.format(" value %s", o.getValue()));
                    }
                    in.print("\n");
                    in.flush();
                    if (opt.getName().equalsIgnoreCase("MultiPv")) {
                        multipv = Integer.parseInt(o.getValue());
                    }
                }
            }

            this.state = new EngineState[multipv];
            for (int i = 0; i < multipv; i++) {
                state[i] = new EngineState();
                state[i].setRunning(true);
            }
            sendCommand(String.format("position fen %s", init.getPosition()));
            sendCommand("go infinite");
            this.status = EngineStatus.RUNNING;
        }
    }

    public void restart(String position) {
        synchronized (commandLock) {
            for (int i = 0; i < state.length; i++) {
                state[i] = new EngineState();
                state[i].setRunning(true);
            }
            sendCommand("stop");
            sendCommand(String.format("position fen %s", position));
            sendCommand("go infinite");
        }
    }

    public void stop() {
        synchronized (commandLock) {
            sendCommand("stop");
            for (EngineState s : this.state) {
                s.setRunning(false);
            }
            this.status = EngineStatus.READY;
        }
    }


    public EngineState[] getState() {
        lastQuery = System.currentTimeMillis();
        return state;
    }

    public List<Option> getOptions() {
        return new ArrayList<>(this.options.values());
    }


    static class Option {
        private String name;
        private Type type;
        private Object defaultValue;
        private int min;
        private int max;


        enum Type {
            CHECK("check"),
            SPIN("spin"),
            COMBO("combo"),
            BUTTON("button"),
            STRING("string");
            final String token;

            String getToken() {
                return this.token;
            }

            Type(String token) {
                this.token = token;
            }
        }

        public boolean isValid() {
            return this.name != null && this.type != null;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Type getType() {
            return type;
        }

        public void setType(Type type) {
            this.type = type;
        }

        public Object getDefaultValue() {
            return defaultValue;
        }

        public boolean setDefaultValue(String defaultValue) {
            try {
                if (type == Type.COMBO) {
                    this.defaultValue = defaultValue;
                } else if (type == Type.CHECK) {
                    this.defaultValue = Boolean.parseBoolean(defaultValue);
                } else if (type == Type.SPIN) {
                    this.defaultValue = Integer.parseInt(defaultValue);
                } else if (type == Type.STRING) {
                    this.defaultValue = defaultValue;
                }
            } catch (Exception e) {
                return false;
            }
            return true;
        }

        public int getMin() {
            return min;
        }

        public void setMin(int min) {
            this.min = min;
        }

        public int getMax() {
            return max;
        }

        public void setMax(int max) {
            this.max = max;
        }
    }


}
