package io.kaczanowski.chessapp.service;

import io.kaczanowski.chessapp.model.Game;
import io.kaczanowski.chessapp.repository.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GameServiceImpl implements GameService {

    private final GameRepository repository;

    @Autowired
    public GameServiceImpl(GameRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Game> listChildren(int parentId) {
        return repository.findByParent(parentId);
    }

    @Override
    public List<Game> listRootChildren() {
        return repository.findByRootParent();
    }

    @Override
    public int upsertGame(Game game) {
        if (game.getId() != null && repository.existsById(game.getId())) {
            Game g = repository.getById(game.getId());
            g.copyFrom(game);
            repository.save(g);
            return g.getId();
        }
        else {
            repository.save(game);
            return game.getId();
        }
    }

    @Override
    public Game getGame(int id) {
        return repository.findById(id).get();
    }

    @Override
    public void deleteGame(int id) {
        repository.deleteById(id);
    }

    @Override
    public void moveGame(int id, Integer newParent) {
        if (repository.existsById(id)) {
            Game game = repository.getById(id);
            game.setParentId(newParent);
            repository.save(game);
        }
    }
}
