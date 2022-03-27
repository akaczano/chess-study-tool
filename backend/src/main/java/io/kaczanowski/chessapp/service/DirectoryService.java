package io.kaczanowski.chessapp.service;

import io.kaczanowski.chessapp.model.GameDirectory;

import java.util.List;
import java.util.Optional;

public interface DirectoryService {
    int upsertDirectory(GameDirectory directory);
    void removeDirectory(int id);
    Optional<GameDirectory> getDirectory(int id);
    List<GameDirectory> listChildren(int parentId);
    List<GameDirectory> listRootChildren();
    void moveDirectory(int id, Integer newParent);
}
