package io.kaczanowski.chessapp.analysis;

import java.util.List;

public class EngineEntry {

    private final String key;
    private final List<EngineThread.Option> options;

    public EngineEntry(String key, List<EngineThread.Option> options) {
        this.key = key;
        this.options = options;
    }

    public String getKey() {
        return key;
    }

    public List<EngineThread.Option> getOptions() {
        return options;
    }
}
