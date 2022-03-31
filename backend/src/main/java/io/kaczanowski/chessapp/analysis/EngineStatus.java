package io.kaczanowski.chessapp.analysis;

public enum EngineStatus {
    LOADED(0),
    READY(1),
    RUNNING(2),
    EXITED(3);
    final int status;
    int getStatus() { return this.status; }
    EngineStatus(int status) {
        this.status = status;
    }
}
