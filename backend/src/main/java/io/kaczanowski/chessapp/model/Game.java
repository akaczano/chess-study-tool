package io.kaczanowski.chessapp.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.kaczanowski.chessapp.model.request.Entry;
import io.kaczanowski.chessapp.model.request.IEntry;

import javax.persistence.*;
import java.sql.Date;

@Entity
@Table(name = "game")
public class Game implements IEntry {

    private Integer id;

    @Column(name = "parent_id")
    @JsonProperty("parent_id")
    private int parentId;

    @Column(name = "white_name")
    @JsonProperty("white_name")
    private String whiteName;

    @Column(name = "black_name")
    @JsonProperty("black_name")
    private String blackName;

    @Column(name = "white_rating")
    @JsonProperty("white_rating")
    private Integer whiteRating;

    @Column(name = "black_rating")
    @JsonProperty("black_rating")
    private Integer blackRating;

    private String event;
    private String site;
    private Date date;
    private String result;
    private String round;

    @Column(name = "start_position")
    @JsonProperty("start_position")
    private String startPosition;

    @Column(name = "moveText")
    @JsonProperty("movetext")
    private String moveText;

    public void copyFrom(Game g) {
        this.whiteName = g.whiteName;
        this.whiteRating = g.whiteRating;
        this.blackName = g.blackName;
        this.blackRating = g.blackRating;
        this.parentId = g.parentId;
        this.event = g.event;
        this.site = g.site;
        this.date = g.date;
        this.result = g.result;
        this.startPosition = g.startPosition;
        this.moveText = g.moveText;
    }

    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public int getParentId() {
        return parentId;
    }

    public void setParentId(int parentId) {
        this.parentId = parentId;
    }

    public String getWhiteName() {
        return whiteName;
    }

    public void setWhiteName(String whiteName) {
        this.whiteName = whiteName;
    }

    public String getBlackName() {
        return blackName;
    }

    public void setBlackName(String blackName) {
        this.blackName = blackName;
    }

    public Integer getWhiteRating() {
        return whiteRating;
    }

    public void setWhiteRating(Integer whiteRating) {
        this.whiteRating = whiteRating;
    }

    public Integer getBlackRating() {
        return blackRating;
    }

    public void setBlackRating(Integer blackRating) {
        this.blackRating = blackRating;
    }

    public String getEvent() {
        return event;
    }

    public void setEvent(String event) {
        this.event = event;
    }

    public String getSite() {
        return site;
    }

    public void setSite(String site) {
        this.site = site;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public String getStartPosition() {
        return startPosition;
    }

    public void setStartPosition(String startPosition) {
        this.startPosition = startPosition;
    }

    @Column(name="movetext")
    public String getMoveText() {
        return moveText;
    }

    @Column(name="movetext")
    public void setMoveText(String moveText) {
        this.moveText = moveText;
    }

    public String getRound() {
        return round;
    }

    public void setRound(String round) {
        this.round = round;
    }

    @Override
    public Entry wrap() {
        return new Entry(false, this);
    }
}
