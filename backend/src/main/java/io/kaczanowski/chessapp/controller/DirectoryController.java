package io.kaczanowski.chessapp.controller;

import io.kaczanowski.chessapp.model.Game;
import io.kaczanowski.chessapp.model.request.DirectoryList;
import io.kaczanowski.chessapp.model.GameDirectory;
import io.kaczanowski.chessapp.model.request.IEntry;
import io.kaczanowski.chessapp.service.DirectoryService;
import io.kaczanowski.chessapp.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Stack;
import java.util.stream.Collectors;

@RestController
public class DirectoryController {

    private final DirectoryService directoryService;
    private final GameService gameService;

    @Autowired
    public DirectoryController(DirectoryService directoryService, GameService gameService) {
        this.directoryService = directoryService;
        this.gameService = gameService;
    }

    @PostMapping("/game/directory")
    public int postDirectory(@RequestBody GameDirectory directory) {
        return this.directoryService.upsertDirectory(directory);
    }

    @GetMapping("/game/list")
    public DirectoryList listRoot() {
        List<IEntry> entries = new ArrayList<>();
        entries.addAll(directoryService.listRootChildren());
        entries.addAll(gameService.listRootChildren());
        return new DirectoryList(entries.stream().map(IEntry::wrap).collect(Collectors.toList()),
                new ArrayList<>());
    }

    @GetMapping("/game/list/{parent_id}")
    public DirectoryList directoryContents(@PathVariable(value = "parent_id") int parentId) {
        List<IEntry> entries = new ArrayList<>();
        entries.addAll(directoryService.listChildren(parentId));
        entries.addAll(gameService.listChildren(parentId));
        List<GameDirectory> path = new ArrayList<>();

        Integer parent = parentId;
        while (parent != null) {
            GameDirectory gd = directoryService.getDirectory(parent).orElse(null);
            if (gd == null) throw new RuntimeException("Failure looking up directory with id: " + parent);
            path.add(0, gd);
            parent = gd.getParentId();
        }

        return new DirectoryList(
                entries.stream().map(IEntry::wrap).collect(Collectors.toList()),
                path);
    }


    @DeleteMapping("/game/directory/{id}")
    public void deleteDirectory(@PathVariable Integer id) {
        this.directoryService.removeDirectory(id);
    }

    @PostMapping("/game/move")
    public void moveGame(@RequestParam int id, @RequestParam(value = "parent_id") int parentId) {
        this.gameService.moveGame(id, parentId == -1 ? null : parentId);
    }

    @PostMapping("/game/directory/move")
    public void moveDirectory(@RequestParam int id, @RequestParam(value = "parent_id") int parentId) {
        this.directoryService.moveDirectory(id, parentId == -1 ? null : parentId);
    }

}
