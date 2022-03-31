import client from '../api/client';
import { writeFEN } from '../chess/fen';

export const RESET_ENGINE = 'RESET_ENGINE';
export const OPEN_MODAL = 'OPEN_MODAL';
export const CLOSE_MODAL = 'CLOSE_MODAL';
export const SET_NAMES = 'SET_NAMES';
export const LOAD_ERROR = 'ENGINE_LOAD_ERROR';
export const ENGINE_LOADING = 'ENGINE_LOADING';
export const ENGINE_LOADED = 'ENGINE_LOADED';
export const SET_SELECTION = 'SET_SELECTION';
export const SET_OPTION = 'SET_OPTION';
export const ENGINE_STARTING = 'ENGINE_STARTING';
export const UPDATE_ENGINE_STATE = 'UPDATE_ENGINE_STATE';
export const CLOSE_ENGINE = 'CLOSE_ENGINE';
export const SET_ENGINE_POSITION = 'SET_ENGINE_POSITION';

export const loadList = () => async dispatch => {
    try {
        const resp = await client.get('/engine/list');        
        dispatch({ type: SET_NAMES, payload: resp.data });
    }
    catch(err) {
        console.log(err);
        dispatch({ type: LOAD_ERROR });
    }
};

export const loadEngine = name => async dispatch => {
    try {
        const resp = await client.get(`/engine/${name}/load`);
        dispatch({ type: ENGINE_LOADED, payload: resp.data});
    }
    catch(err) {
        console.log(err);
        dispatch({ type: LOAD_ERROR });
    }
}

const getBody = getState => {
    return {
        key: getState().engine.key,
        position: writeFEN(getState().editor.game.getCurrentPosition()),
        options: getState().engine.optionValues.filter(opt => opt.dirty) 
    };
}

export const startEngine = () => async (dispatch, getState) => {
    try {
        const body = getBody(getState);   
        console.log(body);  
        dispatch({ type: ENGINE_STARTING, payload: 0 });
        await client.post('/engine/start', body);
        dispatch({ type: ENGINE_STARTING, payload: 1 });
        queryEngine(dispatch, getState);
        dispatch({ type: SET_ENGINE_POSITION, payload: body.position });

    }
    catch(err) {
        dispatch({type: ENGINE_STARTING, payload: 2})
    }
}


export const restartIfNeeded = () => async (dispatch, getState) => {
    if (!getState().engine.started) return;
    const editorPos = writeFEN(getState().editor.game.getCurrentPosition());
    if (editorPos != getState().engine.currentPosition) {
        dispatch({type: ENGINE_STARTING, payload: 0});
        try {
            await client.post('/engine/restart', getBody(getState));
            dispatch({type: SET_ENGINE_POSITION, payload: editorPos});
            dispatch({type: ENGINE_STARTING, payload: 2});
        }
        catch(err) {            
            dispatch({type: CLOSE_ENGINE});
        }
    }    
}

const queryEngine = async (dispatch, getState) => {
    if (!getState().engine.started) return;    
    try {
        const resp = await client.get('/engine/query', {params: {key: getState().engine.key}})
        const newState = resp.data.map(s => {
            let pos = getState().editor.game.getCurrentPosition()                        
            let moves = [];
            for (const m of s.principleVariation) {
                const [x1, y1, x2, y2, pp] = pos.parseEngineNotation(m);
                let notation = pos.getNotation(x1, y1, x2, y2, pp);
                if (pos.isWhiteToMove()) {
                    notation = `${pos.getMoveNumber()}. ${notation}`; 
                }
                else if (moves.length < 1) {
                    notation = `${pos.getMoveNumber()}... ${notation}`;
                }
                moves.push(notation);
                pos = pos.makeMoveOnBoard(x1, y1, x2, y2, pp);
            }
            return {
                ...s,
                principleVariation: moves
            };
        })
        dispatch({ type: UPDATE_ENGINE_STATE, payload: newState});
    }
    catch(err) {
        console.log(err);
        dispatch({ type: CLOSE_ENGINE });
    }
    setTimeout(() => queryEngine(dispatch, getState), 500);
}

export const stopEngine = () => async (dispatch, getState) => {
    try {
        dispatch({ type: ENGINE_STARTING, payload: 0});
        await client.post('/engine/stop', {}, {params: {key: getState().engine.key}});
        dispatch({type: ENGINE_STARTING, payload: 3});
    }
    catch(err) {
        dispatch({type: ENGINE_STARTING, payload: 2});
    }
}

export const closeEngine = () =>  (dispatch, getState) => {
    if (getState().engine.key) {
        client.post('/engine/close', {}, {params: {key: getState().engine.key}});
    }
    dispatch({type: CLOSE_ENGINE});
}

export const setOption = (name, value) => {
    return { type: SET_OPTION, payload: {name, value}}
}

export const openModal = () => {
    return { type: OPEN_MODAL };
};

export const closeModal = () => {
    return { type: CLOSE_MODAL };
};

export const resetEngine = () => {
    return { type: RESET_ENGINE };
};

export const setSelection = i => {
    return { type: SET_SELECTION, payload: i };
}