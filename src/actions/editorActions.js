import client from '../api/client';

import { writeFEN } from '../chess/fen';

// Action types
export const GAME_LOADED = 'GAME_LOADED';
export const GO_TO_MOVE = 'GO_TO_MOVE';
export const GO_FORWARD = 'GO_FORWARD';
export const GO_BACKWARD = 'GO_BACKWARD';
export const GO_TO_START = 'GO_TO_START';
export const GO_TO_END = 'GO_TO_END';
export const DO_MOVE = 'DO_MOVE';
export const SET_MODAL = 'SET_MODAL';
export const UPDATE_DATA = 'UPDATE_DATA';
export const GAME_SAVING = 'GAME_SAVING';
export const SAVE_COMPLETE = 'SAVE_COMPLETE';
export const DELETE_MOVE = 'DELETE_MOVE';
export const PROMOTE_MOVE = 'PROMOTE_MOVE';
export const SET_ANNOTATION = 'SET_ANNOTATION';
export const SET_NAGS = 'SET_NAGS';
export const SET_START_POSITION = 'SET_START_POSITION';
export const SET_POSITION_MODAL = 'SET_POSITION_MODAL';
export const LOAD_ERROR = 'LOAD_ERROR';
export const SAVE_ERROR = 'SAVE_ERROR';
export const CLEAR_ERROR = 'CLEAR_ERROR';


export const loadGame = id => dispatch => {
    if (!id) {
        dispatch({type: GAME_LOADED})
        return;
    }
    client
        .get(`/game/${id}`)
        .then(response => {
            dispatch({type: GAME_LOADED, payload: response.data})
        })
        .catch(err => {
            dispatch({type: LOAD_ERROR, payload: err.message});
        });
};

export const goForward = () => {
    return {type: GO_FORWARD};
};

export const goBackward = () => {
    return {type: GO_BACKWARD};
};

export const goToStart = () => {
    return {type: GO_TO_START};
};

export const goToEnd = () => {
    return {type: GO_TO_END};
};

export const goToMove = key => {
    return {type: GO_TO_MOVE, payload: key};
};

export const doMove = (x1, y1, x2, y2, pp) => {
    return {type: DO_MOVE, payload: [x1, y1, x2, y2, pp]};
};

export const setModal = value => {
    return {type: SET_MODAL, payload: value};
};

export const updateData = data => {
    return {type: UPDATE_DATA, payload: data};
};

export const saveGame = parent => (dispatch, getState) => {
    dispatch({type: GAME_SAVING})
    const state = getState();
    
    client
        .post('/game/upsert', {
            ...state.editor.gameData,
            movetext: state.editor.game.writePGN(),
            start_position: writeFEN(state.editor.game.head.position),            
            parent_id: parent
        })
        .then(response => {            
            dispatch({type: SAVE_COMPLETE, payload: response.data});
        })
        .catch(err => {
            dispatch({type: SAVE_ERROR, payload: err.message});
        });
};

export const deleteMove = () => {
    return {type: DELETE_MOVE}
};

export const promoteMove = () => {
    return {type: PROMOTE_MOVE};
};

export const setAnnotation = text => {
    return {type: SET_ANNOTATION, payload: text};
};

export const setNAGs = nags => {
    return {type: SET_NAGS, payload: nags};
};

export const setStartPosition = position => {
    return {type: SET_START_POSITION, payload: position};
};

export const setPositionModal = value => {
    return {type: SET_POSITION_MODAL, payload: value};
};

export const clearError = () => {
    return {type: CLEAR_ERROR};
}