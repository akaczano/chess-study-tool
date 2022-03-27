package io.kaczanowski.chessapp.repository;

import io.kaczanowski.chessapp.model.GameDirectory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import javax.transaction.Transactional;
import java.util.List;

public interface DirectoryRepository extends JpaRepository<GameDirectory, Integer> {
    @Transactional
    @Query(value = "select gd from GameDirectory gd where gd.parentId = :parentId")
    List<GameDirectory> findByParent(@Param("parentId") int parentId);

    @Transactional
    @Query(value = "select gd from GameDirectory gd where gd.parentId is null")
    List<GameDirectory> findByRootParent();
}
