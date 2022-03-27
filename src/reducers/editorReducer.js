import { GiConsoleController } from "react-icons/gi";
import { bindActionCreators } from "redux";
import {
    GAME_LOADED,
    GO_FORWARD,
    GO_BACKWARD,
    GO_TO_END,
    GO_TO_START,
    GO_TO_MOVE,
    DO_MOVE,
    SET_MODAL,
    UPDATE_DATA,
    GAME_SAVING,
    SAVE_COMPLETE,
    DELETE_MOVE,
    SET_ANNOTATION,
    SET_NAGS,
    PROMOTE_MOVE,
    SET_START_POSITION,
    SET_POSITION_MODAL,
    LOAD_ERROR,
    SAVE_ERROR,
    CLEAR_ERROR
} from "../actions/editorActions";
import { emptyBoard, startingPosition } from "../chess/chess";
import { parseFEN } from "../chess/fen";
import Game from "../chess/Game";
import PGN from '../chess/PGN';

const initialState = {
    loaded: false,
    game: new Game(parseFEN(startingPosition)),
    gameData: {
        white_name: 'Player 1',
        black_name: 'Player 2',
        white_rating: '0',
        black_rating: '0',
        event: 'Chess Tournament',
        site: 'Nowhere',
        date: new Date(),
        round: '1',
        result: '*',
        id: null
    },    
    dataModal: false,
    dirty: false,
    saving: false,
    positionModal: false,
    error: null
};


const editorReducer = (state=initialState, action) => {

    if (action.type === GAME_LOADED) {          
        if (!action.payload) return {
            ...initialState, 
            game: new Game(parseFEN(startingPosition)),
            loaded: true,
            error: null
        };              
        const pgn =new PGN(action.payload.movetext, action.payload.start_position);        
        if (pgn.error) {            
            return {
                ...state,
                loaded: true,
                errMsg: pgn.error,
                game: new Game(parseFEN(emptyBoard))
            }
        }
        console.log(pgn.games);
        return {
            ...state,
            loaded: true,
            game: pgn.firstGame(),
            gameData: {
                white_name: action.payload.white_name,
                black_name: action.payload.black_name,
                white_rating: action.payload.white_rating,
                black_rating: action.payload.black_rating,
                event: action.payload.event,
                site: action.payload.site,
                date: new Date(action.payload.date),
                round: action.payload.round,
                result: action.payload.result,
                id: action.payload.id,
                parent_id: action.payload.parent_id
            },
            saving: false,
            dirty: false            
        }

    }
    else if (action.type === GO_FORWARD) {        
        return {...state, game: state.game.goForward() };
    }
    else if (action.type === GO_BACKWARD) {                
        return {...state, game: state.game.goBack() };
    }
    else if (action.type === GO_TO_START) {        
        return {...state, game: state.game.goToBeginning() };
    }
    else if (action.type === GO_TO_END) {        
        return {...state, game: state.game.goToEnd() };
    }
    else if (action.type === DO_MOVE) {
        const args = action.payload;
        const newGame = state.game.doMove(args[0], args[1], args[2], args[3], args[4]);
        return {
            ...state,
            game: newGame,
            dirty: state.dirty || state.game !== newGame
        };
    }
    else if (action.type === GO_TO_MOVE) {
        console.log(action.payload);
        return {...state, game: state.game.getCopy(action.payload)};
    }
    else if (action.type === DELETE_MOVE) {
        return {...state, game: state.game.deleteCurrent(), dirty: true};
    }
    else if (action.type === PROMOTE_MOVE) {        
        return {...state, game: state.game.promoteCurrent(), dirty: true};
    }
    else if (action.type === SET_ANNOTATION) {
        return {...state, game: state.game.setAnnotation(action.payload), dirty: true};
    }
    else if (action.type === SET_NAGS) {
        return {...state, game: state.game.setNAGs(action.payload), dirty: true};
    }
    else if (action.type === SET_MODAL) {
        return {...state, dataModal: action.payload};
    }
    else if (action.type === UPDATE_DATA) {
        return {...state, gameData: action.payload, dirty: true};
    }    
    else if (action.type === GAME_SAVING) {
        return {...state, saving: true};
    }
    else if (action.type === SAVE_COMPLETE) {
        return {...state, saving: false, dirty: false, gameData: {...state.gameData, id: action.payload}};
    }
    else if (action.type === SET_START_POSITION) {
        return {...state, dirty: true, game: new Game(action.payload)};
    }
    else if (action.type === SET_POSITION_MODAL) {
        return {...state, positionModal: action.payload};
    }
    else if (action.type === LOAD_ERROR) {
        return {
            ...state,
            loaded: true,
            game: new Game(parseFEN(emptyBoard)),
            error: `Failed to load game: ${action.payload}`
        };
    }
    else if (action.type === SAVE_ERROR) {
        return {
            ...state,
            saving: false,
            dirty: true,
            error: `Failed to save game: ${action.payload}`
        };
    }
    else if (action.type === CLEAR_ERROR) {
        return {...state, error: null};
    }    
    return state;
};

export default editorReducer;