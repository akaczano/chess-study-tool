import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Game from "../chess/Game";
import PGN from "../chess/PGN";
import { parseFEN } from "../chess/fen";

export const loadVariation = createAsyncThunk(
    'session:loadVariation',
    async (id, thunkAPI) => {
        const variation = await window.electronAPI.loadVariation(id)
        return variation
    }
)

export const updateVariation = createAsyncThunk(
    'session:updateVariation',
    async (_, thunkAPI) => {
        await window.electronAPI.updateVariation(thunkAPI.getState().quiz.variation)
    }
)


const initialState = {
    reversed: false,
    loading: false,
    game: null,
    reference: null,
    variation: { total_time: -1, completed_date: null},
    time: 0,
    paused: false,
    lastMove: null,
    dirty: false,
    saving: false    
}

const quizSlice = createSlice({
    name: 'quiz',
    initialState,
    reducers: {
        setReversed: (state, { payload }) => {
            state.reversed = payload
        },
        goToStart: (state) => {
            state.game = state.game.goToBeginning()                                            
        },
        goToEnd: (state) => {
            state.game = state.game.goToEnd()                        
        },
        goForward: (state) => {
            state.game = state.game.goForward()                    
        },
        goBack: (state) => {
            state.game = state.game.goBack()                        
        },
        goToMove: (state, { payload }) => {            
            state.game = state.game.getCopy(payload)        
        },
        tryMove: (state, { payload }) => {
            if (!state.game.canGoForward()) {
                state.variation.attempts++
                state.variation.dirty = true
                const movePlayed = state.game.getCurrentPosition().getNotation(...payload)                
                if (movePlayed == state.reference.getNextMove()) {
                    state.game = state.game.doMove(...payload)                    
                    state.reference = state.reference.goForward()
                    if (state.reference.canGoForward()) {                        
                        state.game = state.game.doMoveNotation(state.reference.getNextMove())
                        state.reference = state.reference.goForward()
                    }
                    else {
                        state.variation.completed_date = new Date()                                                
                    }
                }
            }
        },
        updateTime: (state, { payload }) => {
            state.variation.total_time = payload        
        }
    },
    extraReducers: {
        [loadVariation.pending]: (state) => {
            state.loading = true            
        },
        [loadVariation.fulfilled]: (state, { payload }) => {
            const pgn = new PGN(payload.movetext, payload.start_position)
            const game = new Game(parseFEN(payload.start_position)) 
            const reference = pgn.games[0].goToBeginning()
            let reversed = false
            if (payload.side) {
                reversed = true
                if (game.getCurrentPosition().isWhiteToMove()) {
                    game = game.goForward()
                    reference = reference.goForward()
                }
            }
            return {
                ...initialState,                
                reversed,
                reference,
                game,
                variation: payload,
                time: payload.total_time,

            }                                                            
        },
        [updateVariation.pending]: (state) => {
            state.saving = true
        },
        [updateVariation.fulfilled]: (state) => {
            state.saving = false
            state.dirty = false
        }
    }
})

export const {
    setReversed,
    goToStart,
    goToEnd,
    goForward,
    goBack,
    goToMove,
    tryMove,
    updateTime
} = quizSlice.actions

export default quizSlice.reducer
