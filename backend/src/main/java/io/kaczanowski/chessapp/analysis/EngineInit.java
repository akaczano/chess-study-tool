package io.kaczanowski.chessapp.analysis;

import java.util.List;

public class EngineInit {
    private String key;
    private String position;
    private List<InitOption> options;

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public List<InitOption> getOptions() {
        return options;
    }

    public void setOptions(List<InitOption> options) {
        this.options = options;
    }

    public static class InitOption {
        String name;
        String value;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getValue() {
            return value;
        }

        public void setValue(String value) {
            this.value = value;
        }
    }
}
