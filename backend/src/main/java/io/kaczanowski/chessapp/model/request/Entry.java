package io.kaczanowski.chessapp.model.request;

public class Entry {
    private boolean directory;
    private Object data;

    public Entry(boolean directory, Object data) {
        this.directory = directory;
        this.data = data;
    }

    public boolean isDirectory() {
        return directory;
    }

    public void setDirectory(boolean directory) {
        this.directory = directory;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }
}
