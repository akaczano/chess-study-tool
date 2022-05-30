import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { writeFEN } from '../chess/fen';

export const engineInit = createAsyncThunk(
    'engine:init',
    async (_, { dispatch, getState }) => {
        window.electronAPI.onEngineUpdate((_, state) => {
            const newState = state.map(s => {
                let pos = getState().editor.game.getCurrentPosition()
                let moves = [];
                for (const m of s.principleVariation) {
                    const parsedMove = pos.parseEngineNotation(m);
                    if (!parsedMove) break
                    const [x1, y1, x2, y2, pp] = parsedMove
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
            dispatch(updateState(newState))
        })
    }
)


export const loadList = createAsyncThunk(
    'engine:loadList',
    async () => {
        return await window.electronAPI.getEngineList()
    }
)

export const loadEngine = createAsyncThunk(
    'engine:loadEngine',
    async (name) => {
        return await window.electronAPI.loadEngine(name)
    }
)

const getBody = getState => {
    return {        
        position: writeFEN(getState().editor.game.getCurrentPosition()),
        options: getState().engine.optionValues.filter(opt => opt.dirty)
    };
}

export const startEngine = createAsyncThunk(
    'engine:startEngine',
    async (_, thunkAPI) => {
        try {
            console.log('start engine   ')
            const { position, options } = getBody(thunkAPI.getState);
            const engineState = await window.electronAPI.startEngine(position, options)
            console.log('start complete')
            return { position, engineState }
        }
        catch (err) {
            return thunkAPI.rejectWithValue()
        }
    }
)

export const restartIfNeeded = createAsyncThunk(
    'engine:restartIfNeeded',
    async (_, { getState, dispatch }) => {
        if (!getState().engine.started) return null;
        const editorPos = writeFEN(getState().editor.game.getCurrentPosition());
        if (!getState().engine.updating && editorPos != getState().engine.currentPosition) {            
            dispatch(restart())
        }
    }
)

const restart = createAsyncThunk(
    'engine:restart',
    async (_, { getState }) => {
        const { position, options } = getBody(getState)
        window.electronAPI.restartEngine(position, options)
        return position
    }
)


const initialState = {
    loading: false,
    loaded: false,
    engineNames: [],
    selection: 0,
    engineState: null,
    showModal: false,
    options: null,
    optionValues: [],
    updating: false,
    started: false,
    currentPosition: null
}

const engineSlice = createSlice({
    name: 'engine',
    initialState,
    reducers: {
        stopEngine: (state) => {
            window.electronAPI.stopEngine()
            state.started = false
            state.updating = false
            state.engineState = null
        },
        closeEngine: (state) => {
            window.electronAPI.closeEngine()
            return {
                ...initialState,
                showModal: state.showModal,
                engineNames: state.engineNames,
                selection: state.selection
            };
        },
        setOption: (state, { payload }) => {
            console.log(payload)
            state.optionValues = [
                ...state.optionValues.filter(v => v.name != payload.name),
                { ...payload, dirty: true }
            ]
        },
        openModal: (state) => {
            state.showModal = true
        },
        closeModal: (state) => {
            state.showModal = false
        },
        resetEngine: () => initialState,
        setSelection: (state, { payload }) => {
            state.selection = payload
        },
        updateState: (state, { payload }) => {
            const newState = payload.map((s, i) => {
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
            console.log(newState[0].running)
            state.engineState = newState
        },
        setPosition: (state, { payload }) => {
            state.currentPosition = payload
        }
    },
    extraReducers: {
        [loadList.fulfilled]: (state, { payload }) => {
            state.engineNames = payload
        },
        [loadEngine.pending]: (state) => {
            state.loading = true
            state.loaded = false
        },
        [loadEngine.fulfilled]: (state, { payload }) => {
            state.loading = false
            state.loaded = true
            state.options = payload
            state.optionValues = payload.map(o => {
                return {
                    name: o.name,
                    value: o.defaultValue
                }
            })
        },
        [startEngine.pending]: (state) => {
            state.updating = true
        },
        [startEngine.fulfilled]: (state, { payload }) => {
            state.updating = false
            state.started = true
            state.currentPosition = payload.position
            state.engineState = payload.engineState
            console.log(state.engineState)
        },
        [startEngine.rejected]: (state) => {
            state.updating = false
        },
        [restart.pending]: (state) => {
            state.updating = true
            state.engineState = state.engineState.map(es => { return { running: true } })
        },
        [restart.fulfilled]: (state, { payload }) => {
            state.updating = false        
            state.currentPosition = payload    
        }
    }
})

export const {
    stopEngine,
    closeEngine,
    setOption,
    openModal,
    closeModal,
    resetEngine,
    setSelection,
    updateState,
    setPosition
} = engineSlice.actions
export default engineSlice.reducer