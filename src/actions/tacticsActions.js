import {
    STATUS_NOT_STARTED,
    STATUS_IN_PROGRESS
} from '../util/appUtil';

import client from '../api/client';

export const SET_GROUPS = 'TACTICS_SET_GROUPS';
export const SET_SESSIONS = 'TACTICS_SET_SESSIONS';
export const SET_PUZZLES = 'TACTICS_SET_PUZZLES';
export const SHOW_GROUP_MODAL = 'SHOW_GROUP_MODAL';
export const ADD_GROUP = 'ADD_GROUP';
export const SHOW_SESSION_MODAL = 'SHOW_SESSIONS_MODAL';
export const ADD_SESSION = 'ADD_SESSION';
export const CLOSE_GROUP_MODAL = 'CLOSE_GROUP_MODAL';
export const CLOSE_SESSION_MODAL = 'CLOSE_SESSION_MODAL';
export const SET_GROUP_DATA = 'SET_GROUP_DATA';
export const SET_GROUP_ERROR = 'SET_GROUP_ERROR';
export const SELECT_GROUP = 'SELECT_GROUP';

export const loadGroups = () => (dispatch, getState) => {    
    client
        .get('/tactics/groups')
        .then(response => {            
            dispatch({ type: SET_GROUPS, payload: response.data });
        })
        .catch(err => {
            console.log(err);
        })    
}


export const loadSessions = () => (dispatch, getState) => {
    // TODO retrieve sessions from database
    let sessions = [
        {
            id: 0,
            description: 'Session 1',
            status: STATUS_IN_PROGRESS,
            completed: 35,
            positions: 432
        },
        {
            id: 1,
            description: 'Session 2',
            status: STATUS_IN_PROGRESS,
            completed: 231,
            positions: 556
        },
        {
            id: 2,
            description: 'Woodpecker Main',
            status: STATUS_NOT_STARTED,
            completed: 0,
            positions: 945
        }
    ];
    dispatch({ type: SET_SESSIONS, payload: sessions });
};


export const showGroupModal = () => {
    return {
        type: SHOW_GROUP_MODAL
    };
};

export const closeGroupModal = () => {
    return {
        type: CLOSE_GROUP_MODAL
    };
};

export const showSessionModal = () => {
    return {
        type: SHOW_SESSION_MODAL
    };
};

export const closeSessionModal = () => {
    return {
        type: CLOSE_SESSION_MODAL
    };
};

export const addGroup = () => (dispatch, getState) => {
    let data = getState().tactics.groupModal;

    if (!data.description || data.description.length < 1) {
        dispatch({ type: SET_GROUP_ERROR, payload: 'Description is required' });
        return;
    }        

    const newGroup = {
        description: data.description
    };

    client.post('/tactics/groups', newGroup)
        .then(response => {
            dispatch({type: ADD_GROUP, payload: response.data});                   
        })    
        .catch(err => {
            console.log(err);
            dispatch({type: SET_GROUP_ERROR, payload: 'Group creation failed.'});
        });
};

export const deleteGroup = () => (dispatch, getState) => {
    
}

export const addSession = session => (dispatch, getState) => {
    // TODO post session to server

    dispatch({ type: ADD_SESSION, payload: session });
}


export const setGroupData = description => {
    return {
        type: SET_GROUP_DATA,
        payload: description
    };
};

export const selectGroup = groupID => (dispatch, getState) => {
    dispatch({type: SELECT_GROUP, payload: groupID});

    // TODO retrieve puzzles from server
    let puzzles = [

    ];

    dispatch({type: SET_PUZZLES, payload: puzzles});
}

