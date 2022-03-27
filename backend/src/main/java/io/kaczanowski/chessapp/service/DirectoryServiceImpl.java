package io.kaczanowski.chessapp.service;

import io.kaczanowski.chessapp.model.GameDirectory;
import io.kaczanowski.chessapp.repository.DirectoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DirectoryServiceImpl implements DirectoryService {
    private final DirectoryRepository repository;

    @Autowired
    public DirectoryServiceImpl(DirectoryRepository repository) {
        this.repository = repository;
    }


    @Override
    public int upsertDirectory(GameDirectory directory) {
        if (directory.getId() != null && repository.existsById(directory.getId())) {
            GameDirectory dir = repository.getById(directory.getId());
            dir.setDescription(directory.getDescription());
            dir.setParentId(directory.getParentId());
            repository.save(dir);
            return dir.getId();
        }
        else {
            repository.save(directory);
            return directory.getId();
        }
    }

    @Override
    public void removeDirectory(int id) {
        repository.deleteById(id);
    }

    @Override
    public List<GameDirectory> listChildren(int parentId) {
        return repository.findByParent(parentId);
    }

    @Override
    public List<GameDirectory> listRootChildren() {
        return repository.findByRootParent();
    }

    @Override
    public Optional<GameDirectory> getDirectory(int id) {
        return repository.findById(id);
    }

    @Override
    public void moveDirectory(int id, Integer newParent) {
        if (repository.existsById(id)) {
            GameDirectory dir = repository.getById(id);
            dir.setParentId(newParent);
            repository.save(dir);
        }
    }
}
