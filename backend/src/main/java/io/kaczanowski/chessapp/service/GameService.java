package io.kaczanowski.chessapp.service;

import io.kaczanowski.chessapp.model.Game;

import java.util.List;

public interface GameService {
    List<Game> listChildren(int parentId);
    List<Game> listRootChildren();
    int upsertGame(Game game);
    Game getGame(int id);
    void deleteGame(int id);
    void moveGame(int id, Integer newParent);
}
