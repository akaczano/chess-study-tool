package io.kaczanowski.chessapp.repository;

import io.kaczanowski.chessapp.model.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import javax.transaction.Transactional;
import java.util.List;

public interface GameRepository extends JpaRepository<Game, Integer> {
    @Transactional
    @Query(value = "select g from Game g where g.parentId = :parentId")
    List<Game> findByParent(@Param("parentId") int parentId);

    @Transactional
    @Query(value = "select g from Game g where g.parentId is null")
    List<Game> findByRootParent();
}
