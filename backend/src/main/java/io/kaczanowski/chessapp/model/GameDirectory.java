package io.kaczanowski.chessapp.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.kaczanowski.chessapp.model.request.Entry;
import io.kaczanowski.chessapp.model.request.IEntry;

import javax.persistence.*;

@Entity
@Table(name = "game_directory")
public class GameDirectory implements IEntry {
    private Integer id;
    private String description;

    @Column(name = "parent_id")
    @JsonProperty("parent_id")
    private Integer parentId;

    public GameDirectory() {}


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer getId() {
        return this.id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getDescription() {
        return this.description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


    public Integer getParentId() {
        return parentId;
    }

    public void setParentId(Integer parentId) {
        this.parentId = parentId;
    }

    @Override
    public Entry wrap() {
        return new Entry(true, this);
    }
}
