import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import engineReducer from "./state/engineSlice";
import directoryReducer from './state/directorySlice'
import editorReducer from './state/editorSlice';
import navReducer from './state/navSlice'

const initialState = {}

const middleware = [thunk]


const store = configureStore({
    reducer: {
        directory: directoryReducer,                        
        editor: editorReducer,
        engine: engineReducer,
        nav: navReducer
    },
    initialState,
    middleware    
});
export default store;