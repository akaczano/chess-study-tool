package io.kaczanowski.chessapp.controller;

import io.kaczanowski.chessapp.analysis.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.io.InterruptedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@RestController
public class EngineController {

    public static final long MAX_RUNTIME = 20000;
    public static final long MAX_LIFE = 3600000;
    public static final long CHECK_PERIOD = 10000;

    private final Map<String, EngineThread> engines;

    public EngineController() {
        engines = new HashMap<>();
        ScheduledExecutorService service = Executors.newScheduledThreadPool(1);
        service.scheduleAtFixedRate(this::pruneEngines, CHECK_PERIOD, CHECK_PERIOD, TimeUnit.MILLISECONDS);
    }

    private void pruneEngines() {
        for (String key : engines.keySet()) {
            EngineThread engine = engines.get(key);
            long diff = System.currentTimeMillis() - engine.getLastQuery();
            if (diff > MAX_LIFE) {
                engine.kill();
                engines.remove(key);
            }
            else if (engine.getStatus() == EngineStatus.RUNNING && diff > MAX_RUNTIME) {
                engine.stop();
            }

        }
    }

    @ExceptionHandler({ EngineException.class })
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handleError(EngineException e) {
        return e.getMessage();
    }

    @GetMapping("/engine/list")
    public List<String> engineList() throws IOException {
        return Files.list(new File(EngineThread.ENGINE_DIR).toPath())
                .map(f -> f.getFileName().toString())
                .collect(Collectors.toList());
    }

    @GetMapping("/engine/{name}/load")
    public EngineEntry loadEngine(@PathVariable String name) throws EngineException {
        String key = UUID.randomUUID().toString();
        try {
            EngineThread engine = new EngineThread(name);
            long startTime = System.currentTimeMillis();
            int timeout = 2000;
            while (engine.getStatus() != EngineStatus.READY) {
                Thread.yield();
                if (System.currentTimeMillis() - startTime > timeout) {
                    throw new EngineException("Timed out while waiting for engine");
                }
            }
            engines.put(key, engine);
            return new EngineEntry(key, engine.getOptions());
        }
        catch(IOException e) {
            throw new EngineException("Engine not found");
        }
    }

    @PostMapping("/engine/start")
    public void startEngine(@RequestBody EngineInit init) throws EngineException {
        if (!engines.containsKey(init.getKey())) throw new EngineException("Engine not loaded");
        engines.get(init.getKey()).start(init);
    }

    @PostMapping("/engine/stop")
    public void stopEngine(@RequestParam String key) throws EngineException {
        if (!engines.containsKey(key)) throw new EngineException("Engine not loaded");
        engines.get(key).stop();
    }

    @PostMapping("/engine/restart")
    public void restartEngine(@RequestBody EngineInit body) throws EngineException {
        if (!engines.containsKey(body.getKey())) throw new EngineException("Engine not loaded");
        engines.get(body.getKey()).restart(body.getPosition());
    }

    @GetMapping("/engine/query")
    public EngineState[] queryEngine(@RequestParam String key) throws EngineException {
        if (!engines.containsKey(key)) throw new EngineException("Engine not loaded");
        return engines.get(key).getState();
    }

    @PostMapping("/engine/close")
    public void closeEngine(@RequestParam String key) {
        if (engines.containsKey(key)) {
            EngineThread e = engines.get(key);
            e.kill();
            engines.remove(key);
        }
    }

    static class EngineException extends Exception {
        public EngineException(String message) {
            super(message);
        }
    }

}
