import PGN from '../chess/PGN'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { listTemplates } from './templateSlice'
import { go, QUIZ } from './navSlice'

export const createSession = createAsyncThunk(
    'session:create',
    async (_, thunkAPI) => {
        const template = await window.electronAPI.getTemplate(thunkAPI.getState().session.createModal)
        let vars = []
        for (const file of template.files) {
            const pgn = new PGN(file.movetext, file.start_position)
            const flattened = pgn.games[0].flatten() 
            console.log(flattened)           
            vars = [...vars, ...(flattened.map(f => {
                return {
                    templateLine: file.id,
                    movetext: f,
                    start_position: file.start_position,
                    game: file.game_id
                }                
            }))]
        }                
        
        const session = await window.electronAPI.createSession(thunkAPI.getState().session.description, template.id, vars)
        thunkAPI.dispatch(listTemplates())
        return session
    }
)

export const listSessions = createAsyncThunk(
    'session:list',
    async () => {
        const sessions = await window.electronAPI.listSessions()
        return sessions
    }
)

export const deleteSession = createAsyncThunk(
    'session:delete',
    async (id) => {        
        await window.electronAPI.deleteSession(id)
        return id        
    }
)

export const resume = createAsyncThunk(
    'session:resume',
    async (session_id, { dispatch }) => {
        const varId = await window.electronAPI.nextVariation(session_id)        
        dispatch(go({location: QUIZ, params: {id: varId}}))
    }
)

const initialState = {
    loading: false,
    creating: false,
    activeSessions: [],
    inactiveSessions: [],
    createModal: -1,
    description: '',
    deleting: []
}


const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        startCreate: (state, { payload }) => {
            state.createModal = payload.id
            state.description = `${payload.description} (#${payload.session_count + 1})`
        },
        setDescription: (state, { payload }) => {
            state.description = payload
        },
        closeModal: (state) => {
            state.createModal = -1
        }
    },
    extraReducers: {
        [createSession.pending]: state => {
            state.creating = true
        },
        [createSession.fulfilled]: (state, { payload }) => {
            state.activeSessions.push(payload)
            state.createModal = -1
            state.creating = false
        },
        [listSessions.pending]: (state) => {
            state.loading = true
        },
        [listSessions.fulfilled]: (state, { payload }) => {
            state.loading = false
            state.activeSessions = payload.filter(s => s.position > 0)
            state.inactiveSessions = payload.filter(s => s.position < 0)
        },
        [deleteSession.pending]: (state, action) => {
            state.deleting.push(action.meta.arg)
        },
        [deleteSession.fulfilled]: (state, { payload }) => {
            state.deleting = state.deleting.filter(d => d != payload)
            state.activeSessions = state.activeSessions.filter(s => s.id != payload)
            state.inactiveSessions = state.inactiveSessions.filter(s => s.id != payload)
        }
    }
})

export const {
    startCreate,
    setDescription,
    closeModal
} = sessionSlice.actions

export default sessionSlice.reducer