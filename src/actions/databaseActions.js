import client from '../api/client';
import PGN from '../chess/PGN';
import { download } from '../util/appUtil';

export const SET_FILES = 'SET_FILES';
export const SET_PARENT = 'SET_PARENT';
export const POSTING = 'POSTING';
export const DELETING = 'DELETING';
export const RENAMING = 'RENAMING';
export const POST_COMPLETE = 'POST_COMPLETE';
export const DELETE_COMPLETE = 'DELETE_COMPLETE';
export const RENAME_COMPLETE = 'RENAME_COMPLETE';

export const BEGIN_EDIT = 'BEGIN_EDIT';
export const CANCEL_EDIT = 'CANCEL_EDIT';
export const EDIT_UPDATE = 'EDIT_UPDATE';

export const BEGIN_MOVE = 'BEGIN_MOVE';
export const CANCEL_MOVE = 'CANCEL_MOVE';
export const MOVING = 'MOVING';
export const MOVE_COMPLETE = 'MOVE_COMPLETE';

export const SET_ERROR = 'SET_ERROR';
export const CLEAR_ERROR = 'CLEAR_ERROR';

export const START_UPLOAD = 'START_UPLOAD';
export const UPLOAD_COMPLETE = 'UPLOAD_COMPLETE';
export const UPLOAD_ERROR = 'UPLOAD_ERROR';

export const SELECT_ITEM = 'SELECT_ITEM';
export const UNSELECT_ITEM = 'UNSELECT_ITEM';
export const CLEAR_SELECTION = 'CLEAR_SELECTION';
export const SHOW_SELECTION = 'SHOW_SELECTION';
export const HIDE_SELECTION = 'HIDE_SELECTION';

export const START_DOWNLOAD = 'START_DOWNLOAD';
export const DOWNLOAD_COMPLETE = 'DOWNLOAD_COMPLETE';

export const loadFiles = (parent = null) => dispatch => {

    client
        .get('/game/list' + (parent ? ('/' + parent) : ''))
        .then(response => {            
            dispatch({ type: SET_FILES, payload: response.data });
        })
        .catch(err => {
            dispatch({ type: SET_ERROR, payload: { action: SET_FILES, message: err.message } });
        })
}

export const postFolder = description => (dispatch, getState) => {
    dispatch({ type: POSTING });
    const parent = getState().database.parent;
    client
        .post('/game/directory', { parent_id: parent, description })
        .then(response => {
            dispatch({
                type: POST_COMPLETE, payload: {
                    description,
                    id: response.data,
                    parent_id: parent
                }
            });
        })
        .catch(err => {
            dispatch({ type: SET_ERROR, payload: { action: POST_COMPLETE, message: err.message } });
        });
}

export const updateFolder = (id, parent_id, description) => dispatch => {
    dispatch({ type: RENAMING, payload: id });    
    client
        .post('game/directory', { id, parent_id, description })
        .then(() => {
            dispatch({ type: RENAME_COMPLETE, payload: { id, parent_id, description } });
        })
        .catch(err => {
            dispatch({ type: SET_ERROR, payload: { action: RENAME_COMPLETE, message: err.message } });
        })
}

export const deleteFolder = id => dispatch => {
    dispatch({ type: DELETING, payload: [true, id] });
    client
        .delete(`/game/directory/${id}`)
        .then(() => {
            dispatch({ type: DELETE_COMPLETE, payload: [true, id] });
        })
        .catch(err => {
            dispatch({ type: SET_ERROR, payload: { action: DELETE_COMPLETE, message: err.message } });
        });
};

export const deleteGame = id => dispatch => {
    dispatch({ type: DELETING, payload: [false, id] });
    client
        .delete(`/game/${id}`)
        .then(() => {
            dispatch({ type: DELETE_COMPLETE, payload: [false, id] });
        })
        .catch(err => {
            dispatch({ type: SET_ERROR, payload: { action: DELETE_COMPLETE, message: err.message } });
        });
};

export const doDownload = ids => dispatch => {
    dispatch({ type: START_DOWNLOAD });
    client.post('/game/download', ids).then(resp => {           
        const games = resp.data;
        let pgn = '';        
        for (const game of games) {
            const tags = [
                {name: 'Event', value: game.event},
                {name: 'Site', value: game.site},
                {name: 'Date', value: game.date},
                {name: 'Round', value: game.round},
                {name: 'White', value: game.white_name},
                {name: 'Black', value: game.black_name},
                {name: 'result', value: game.result}                           
            ];
            if (game.white_rating != 0) {
                tags.push({name: 'WhiteELO', value: game.white_rating});
            }
            if (game.black_rating != 0) {
                tags.push({name: 'BlackELO', value: game.black_rating})
            }
            let segment = '';
            for (const tag of tags) {
                segment += `[${tag.name} "${tag.value}"]\n`
            }                        
            const pgnGame = new PGN(game.movetext, game.start_position);
            if (pgnGame.error) {
                console.log('error loading pgn: ' + pgn.error);
                continue;
            }
            else {
                segment += '\n';;
                segment += pgnGame.firstGame().writePGN();                
                segment += ` ${game.result}\n`;
            }
            pgn += segment + '\n';        
        }        
        download(pgn);
        dispatch({ type: DOWNLOAD_COMPLETE });
    })
    .catch(err => {
        console.log(err);
        dispatch({ type: DOWNLOAD_COMPLETE });
    });   
}

export const beginEdit = (id, text) => {
    return { type: BEGIN_EDIT, payload: [id, text] };
};

export const cancelEdit = () => {
    return { type: CANCEL_EDIT };
};

export const editUpdate = text => {
    return { type: EDIT_UPDATE, payload: text };
};

export const beginMove = (directory, id) => {
    return { type: BEGIN_MOVE, payload: { directory, id } };
};

export const cancelMove = () => {
    return { type: CANCEL_MOVE };
};

export const move = (directory, id, parent_id) => dispatch => {    
    dispatch({ type: MOVING });
    const path = directory ? '/game/directory/move' : '/game/move';
    client
        .post(path, { }, { params: {id, parent_id} })
        .then(() => {
            dispatch({ type: MOVE_COMPLETE });
        })
        .catch(err => {
            dispatch({ type: SET_ERROR, payload: { action: MOVE_COMPLETE, message: err.message } });
        });
};

export const clearError = () => {
    return { type: CLEAR_ERROR };
};



export const uploadGames = games => dispatch => {
    dispatch({ type: START_UPLOAD });
    const doUpload = async gamelist => {
        for (const game of gamelist) {            
            const response = await client.post('/game/upsert', game);
            game.id = response.data.id;                       
        }        
    };
    doUpload(games)
        .then(() => {
            dispatch({type: UPLOAD_COMPLETE, payload: games.map(g => {return {data: {...g, date: g.date.toLocaleDateString()}, directory: false};})});
        })
        .catch(e => {            
            dispatch({type: UPLOAD_ERROR, payload: e.message});
        });
};

export const reportUploadError = msg => {
    return {type: UPLOAD_ERROR, payload: msg};
};

export const selectEntry = e => {
    return {type: SELECT_ITEM, payload: e};
};

export const unselectEntry = e => {
    return {type: UNSELECT_ITEM, payload: e};
};

export const clearSelection = () => {
    return { type: CLEAR_SELECTION };
}

export const showSelection = () => {
    return { type: SHOW_SELECTION };
};

export const hideSelection = () => {
    return { type: HIDE_SELECTION };
};