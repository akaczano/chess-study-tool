import {
    SET_SESSIONS,
    SET_GROUPS,
    SHOW_GROUP_MODAL,
    SHOW_SESSION_MODAL,
    ADD_GROUP,
    ADD_SESSION,
    CLOSE_GROUP_MODAL,
    CLOSE_SESSION_MODAL,
    SET_GROUP_DATA,
    SET_GROUP_ERROR,
    SET_PUZZLES,
    SELECT_GROUP
} from '../actions/tacticsActions';

const initialState = {
    groups: null,
    puzzles: null,
    selectedGroup: null,
    sessions: null,
    stats: null,
    groupModal: null,
    sessionModal: null
};

const tacticsReducer = (state = initialState, action) => {
    if (action.type === SET_GROUPS) {        
        return {...state, groups: action.payload};
        
    }
    else if (action.type === SET_SESSIONS) {
        return {...state, sessions: action.payload};
    }
    else if (action.type === SET_PUZZLES) {
        return {...state, puzzles: action.payload};
    }
    else if (action.type === SHOW_GROUP_MODAL) {
        return {...state, groupModal: {description: ''}};
    }
    else if (action.type === SHOW_SESSION_MODAL) {
        return { ...state, sessionModal: {} }
    }
    else if (action.type === ADD_GROUP) {
        return { ...state, groupModal: null, groups: [...state.groups, action.payload] }        
    }
    else if (action.type === ADD_SESSION) {
        return { ...state, sessions: [...state.sessions, action.payload] }
    }
    else if (action.type === CLOSE_GROUP_MODAL) {
        return { ...state, groupModal: null };
    }
    else if (action.type === CLOSE_SESSION_MODAL) {
        return { ...state, sessionModal: null };
    }
    else if (action.type === SET_GROUP_DATA) {
        return { ...state, groupModal: {...state.groupModal, description: action.payload} };
    }
    else if (action.type === SET_GROUP_ERROR) {
        return { ...state, groupModal: {...state.groupModal, error: action.payload}};
    }
    else if (action.type === SELECT_GROUP) {
        let selected = state.groups.find(g => g.id == action.payload);
        return {...state, selectedGroup: selected};
    }
    return state;
};

export default tacticsReducer;