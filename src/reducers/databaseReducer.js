import {
    SET_FILES,
    SET_PARENT,
    POSTING,
    DELETING,
    POST_COMPLETE,
    DELETE_COMPLETE,
    RENAMING,
    RENAME_COMPLETE,
    BEGIN_EDIT,
    CANCEL_EDIT,
    EDIT_UPDATE,
    BEGIN_MOVE,
    CANCEL_MOVE,
    MOVING,
    MOVE_COMPLETE,
    SET_ERROR,
    CLEAR_ERROR,
    UPLOAD_COMPLETE,
    UPLOAD_ERROR,
    START_UPLOAD,
    SELECT_ITEM,
    UNSELECT_ITEM,
    SHOW_SELECTION,
    HIDE_SELECTION,
    CLEAR_SELECTION,
    START_DOWNLOAD,
    DOWNLOAD_COMPLETE
} from '../actions/databaseActions';


const initialState = {        
    path: [],    
    files: null,
    game: null,
    deletingFolders: [],
    deletingGames: [],
    renaming: [],
    posting: false,
    editingName: '',
    editing: -1,
    moveSource: null,
    moving: false,
    errMsg: null,
    uploading: false,    
    selection: [],
    showSelection: false,
    downloading: false,
};

const databaseReducer = (state = initialState, action) => {    
    if (action.type === SET_FILES) {                  
        return {
            ...state,
            files: action.payload.list,
            path: action.payload.path            
        };
    }
    else if (action.type === SET_PARENT) {        
        return {...state, parent: action.payload};
    } 
    else if (action.type === POSTING) {
        return {...state, posting: true };
    }
    else if (action.type === POST_COMPLETE) {
        return {...state, posting: false, files: [...state.files, {
            directory: true,
            data: action.payload
        }]};
    }
    else if (action.type === DELETING) {    
        if (action.payload[0]) {
            return {...state, deletingFolders: [...state.deletingFolders, action.payload[1]]};
        }            
        else {
            return {...state, deletingGames: [...state.deletingGames, action.payload[1]]}
        }
    }
    else if (action.type === DELETE_COMPLETE) {
        const newFiles = state.files.filter(f => (f.directory != action.payload[0] || f.data.id != action.payload[1]));
        if (action.payload[0]) {            
            const newDeleting = state.deletingFolders.filter(e => e != action.payload[1]);
            return { ...state, files: newFiles, deletingFolders: newDeleting };
        }
        else {
            const newDeleting = state.deletingGames.filter(e => e != action.payload[1]);
            return { ...state, files: newFiles, deletingGames: newDeleting };
        }
        
    }
    else if (action.type === RENAMING) {
        return {...state, renaming: [...state.renaming, action.payload]};
    }
    else if (action.type === RENAME_COMPLETE) {        
        const otherFiles = state.files.filter(f => (!f.directory || f.data.id != action.payload.id));
        return {
            ...state,
            files: [...otherFiles, {directory: true, data: action.payload}],
            editing: -1,
            renaming: state.renaming.filter(e => e != action.payload.id)
        };
    }
    else if (action.type === BEGIN_EDIT) {
        return {...state, editing: action.payload[0], editingName: action.payload[1]};
    }
    else if (action.type === CANCEL_EDIT) {
        return {...state, editing: -1};
    }
    else if (action.type === EDIT_UPDATE) {
        return {...state, editingName: action.payload};
    }
    else if (action.type === BEGIN_MOVE) {
        return {...state, moveSource: action.payload}
    }
    else if (action.type === CANCEL_MOVE) {        
        return {...state, moveSource: null};
    }
    else if (action.type === MOVING) {
        return {...state, moving: true };
    }
    else if (action.type === MOVE_COMPLETE) {
        const newFiles = state.files.filter(
            f => f.directory !== state.moveSource.directory || f.data.id !== state.moveSource.id
        ); 
        return {...state, moving: false, moveSource: null, files: newFiles};
    }
    else if (action.type === SET_ERROR) {        
        if (action.payload.action === SET_FILES) {            
            return {...state, files: [], errMsg: `Failed to load contents: ${action.payload.message}`};
        }
        else if (action.payload.action === POST_COMPLETE) {
            return {...state, posting:false, errMsg: `Failed to create folder: ${action.payload.message}`};
        }
        else if (action.payload.action === RENAME_COMPLETE) {
            return {...state, renaming: [], editing: -1, errMsg: `Failed to rename folder: ${action.payload.message}`};
        }
        else if (action.payload.action === DELETE_COMPLETE) {
            return {
                ...state, deletingFolders: [], deletingGames: [], 
                errMsg: `Failed to delete file: ${action.payload.message}`
            };
        }
        else if (action.payload.action === MOVE_COMPLETE) {
            return {
                ...state, moving: false, moveSource: null, 
                errMsg: `Failed to move item: ${action.payload.message}`
            };
        }
    }
    else if (action.type === CLEAR_ERROR) {
        return {...state, errMsg: null};
    }    
    else if (action.type === START_UPLOAD) {
        return {...state, uploading: true};
    }
    else if (action.type === UPLOAD_COMPLETE) {        
        return {...state, uploading: false, files: [...state.files, ...action.payload]};
    }
    else if (action.type === UPLOAD_ERROR) {
        return {...state, uploading: false, errMsg: action.payload};
    }
    else if (action.type === SELECT_ITEM) {        
        return {...state, selection: [...state.selection, action.payload]}
    }
    else if (action.type === UNSELECT_ITEM) {        
        return {
            ...state,
            selection: state.selection.filter(i => !(i.directory === action.payload.directory && i.data.id === action.payload.data.id))
        };
    }
    else if (action.type === CLEAR_SELECTION) {
        return {
            ...state,
            selection: []
        };
    }
    else if (action.type === SHOW_SELECTION) {
        return {
            ...state,
            showSelection: true
        };
    }    
    else if (action.type === HIDE_SELECTION) {
        return {
            ...state,
            showSelection: false
        };
    }
    else if (action.type === START_DOWNLOAD) {
        return {
            ...state,
            downloading: true            
        };
    }
    else if (action.type === DOWNLOAD_COMPLETE) {
        return {
            ...state,
            downloading: false
        }
    }
    return state;   
};

export default databaseReducer;