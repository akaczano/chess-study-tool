package io.kaczanowski.chessapp.model.request;

import io.kaczanowski.chessapp.model.GameDirectory;

import java.util.List;

public class DirectoryList {

    private final List<Entry> list;
    private final List<GameDirectory> path;

    public DirectoryList(List<Entry> list, List<GameDirectory> path) {
        this.list = list;
        this.path = path;
    }

    public List<Entry> getList() {
        return list;
    }



    public List<GameDirectory> getPath() {
        return this.path;
    }
}
