package io.kaczanowski.chessapp.controller;


import io.kaczanowski.chessapp.model.Game;
import io.kaczanowski.chessapp.service.GameService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
public class GameController {

    private final GameService service;

    public GameController(GameService service) {
        this.service = service;
    }

    @GetMapping("/game/{id}")
    public Game getGame(@PathVariable int id) {
        return service.getGame(id);
    }

    @PostMapping("/game/upsert")
    public int postGame(@RequestBody Game game) {
        return service.upsertGame(game);
    }

    @DeleteMapping("/game/{id}")
    public void deleteGame(@PathVariable Integer id) {
        service.deleteGame(id);
    }

    @PostMapping("/game/download")
    public List<Game> downloadGames(@RequestBody List<Integer> list) {
        return list.stream().map(service::getGame).collect(Collectors.toList());
    }
}
