import {
    OPEN_MODAL,
    CLOSE_MODAL,
    RESET_ENGINE, 
    SET_NAMES,
    ENGINE_LOADED,
    SET_SELECTION,
    SET_OPTION,
    ENGINE_STARTING,
    UPDATE_ENGINE_STATE,
    SET_ENGINE_POSITION,
    CLOSE_ENGINE
} from '../actions/engineActions';

const initialState = {
    key: null,
    engineNames: [],
    selection: 0,
    engineState: null,
    showModal: false,
    options: null,
    optionValues: [],
    updating: false,
    started: false,
    currentPosition: null
};

const engineReducer = (state=initialState, action) => {    
    if (action === RESET_ENGINE) {
        return initialState;
    }
    else if (action.type === SET_NAMES) {        
        return {
            ...state,
            engineNames: action.payload
        };
    }
    else if (action.type === ENGINE_LOADED) {        
        return {
            ...state,
            key: action.payload.key,
            options: action.payload.options,
            optionValues: action.payload.options.map(o => {
                return {
                    name: o.name,
                    value: o.defaultValue
                }
            })
        }
    }
    else if (action.type === OPEN_MODAL) {        
        return {
            ...state,
            showModal: true
        };
    }
    else if (action.type === CLOSE_MODAL) {
        return {
            ...state,
            showModal: false
        };
    }
    else if (action.type === SET_SELECTION) {
        return {
            ...state,
            selection: action.payload
        };
    }
    else if (action.type === SET_OPTION) {
        return {
            ...state,
            optionValues: [
                ...state.optionValues.filter(v => v.name != action.payload.name),
                {...action.payload, dirty: true}
            ]
        }
    }
    else if (action.type === ENGINE_STARTING) {
        if (action.payload === 0) {
            return {
                ...state,
                updating: true
            }
        }
        else if (action.payload === 1){
            return {
                ...state,
                updating: false,
                started: true
            }
        }        
        else if (action.payload === 2) {
            return {
                ...state,
                updating: false
            }
        }
        else if (action.payload === 3) {
            return {
                ...state,
                updating: false,
                started: false,
                engineState: null
            }
        }
    }
    else if (action.type === UPDATE_ENGINE_STATE) { 
        
        const newState = action.payload.map((s, i) => {            
            if (!state.engineState || 
                state.engineState.length <= i || 
                !state.engineState[i].principleVariation ||
                state.engineState[i].principleVariation.length <= s.principleVariation.length) {
                return s;    
            }                  
            const old = state.engineState[i].principleVariation;    
            
            for (let j = 0; j < s.principleVariation.length; j++) {
                if (old[j] != s.principleVariation[j]) return s;
            }
            return {
                ...s,
                principleVariation: old
            }
        })        
        return {
            ...state,
            engineState: newState
        };
    }
    else if (action.type === SET_ENGINE_POSITION) {
        return {
            ...state,
            currentPosition: action.payload
        };
    }
    else if (action.type === CLOSE_ENGINE) {
        return {
            ...initialState,
            showModal: state.showModal,
            engineNames: state.engineNames,
            selection: state.selection
        };
    }
    return state;
};

export default engineReducer;