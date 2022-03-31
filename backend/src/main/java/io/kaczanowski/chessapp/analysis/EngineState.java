package io.kaczanowski.chessapp.analysis;

import java.util.ArrayList;
import java.util.List;

public class EngineState {

    private boolean running;
    private int score;
    private EvalType scoreType;
    private List<String> principleVariation;
    private int depth;
    private long time;
    private int tbhits;
    private int nps;
    private int nodes;

    public EngineState() {
        this.principleVariation = new ArrayList<>();
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public EvalType getScoreType() {
        return scoreType;
    }

    public void setScoreType(EvalType scoreType) {
        this.scoreType = scoreType;
    }

    public List<String> getPrincipleVariation() {
        return principleVariation;
    }

    public void setPrincipleVariation(List<String> principleVariations) {
        this.principleVariation = principleVariations;
    }

    public int getDepth() {
        return depth;
    }

    public void setDepth(int depth) {
        this.depth = depth;
    }

    public long getTime() {
        return time;
    }

    public void setTime(long time) {
        this.time = time;
    }

    public int getTbhits() {
        return tbhits;
    }

    public void setTbhits(int tbhits) {
        this.tbhits = tbhits;
    }

    public int getNps() {
        return nps;
    }

    public void setNps(int nps) {
        this.nps = nps;
    }

    public int getNodes() {
        return nodes;
    }

    public void setNodes(int nodes) {
        this.nodes = nodes;
    }

    public boolean isRunning() {
        return running;
    }

    public void setRunning(boolean running) {
        this.running = running;
    }

    enum EvalType {
        CENTIPAWN("cp"),
        MATE("mate");
        private String token;
        EvalType(String token) {
            this.token = token;
        }
    }
}


