import { combineReducers } from "redux";

import tacticsReducer from './tacticsReducer';
import openingsReducer from './openingsReducer';
import databaseReducer from './databaseReducer';
import editorReducer from './editorReducer';

export default combineReducers({
    tactics: tacticsReducer,
    openings: openingsReducer,
    database: databaseReducer,
    editor: editorReducer
});