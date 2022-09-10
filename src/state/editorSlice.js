import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import PGN from '../chess/PGN'
import Game from "../chess/Game"
import { writeFEN, parseFEN } from '../chess/fen'
import { emptyBoard, startingPosition } from "../chess/chess";


export const loadGame = createAsyncThunk(
    'directory:getGame',
    async (id) => {
        if (!id) {
            return null
        }
        const game = await window.electronAPI.getGame(id)
        // TODO check for error
        return game
    }
)

export const saveGame = createAsyncThunk(
    'directory:postGame',
    async (parent, { getState }) => {

        const state = getState()
        let side = state.editor.gameData.side
        console.log(state.editor.gameData.type)
        if (state.editor.gameData.type == 3) {
            side = !state.editor.game.goToBeginning().getCurrentPosition().isWhiteToMove()
        }
        const result = await window.electronAPI.postGame({
            ...state.editor.gameData,
            side,
            movetext: state.editor.game.writePGN(),
            start_position: writeFEN(state.editor.game.head.position),
            parent_id: parent
        })
        return result

    }
)

const initialState = {
    loaded: false,
    error: null,
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
        description: '',
        side: false,
        id: null,
        type: 1
    },
    saving: false,
    dirty: false,
    dataModal: false,
    positionModal: false
}

const editorSlice = createSlice({
    name: 'editor',
    initialState,
    reducers: {
        goForward: (state) => {
            state.game = state.game.goForward()
        },
        goBackward: (state) => {
            state.game = state.game.goBack()
        },
        goToStart: (state) => {
            state.game = state.game.goToBeginning()
        },
        goToEnd: (state) => {
            state.game = state.game.goToEnd()
        },
        doMove: (state, action) => {
            const args = action.payload;
            const newGame = state.game.doMove(args[0], args[1], args[2], args[3], args[4]);
            state.dirty = state.dirty || state.game !== newGame
            state.game = newGame
        },
        goToMove: (state, { payload }) => {
            state.game = state.game.getCopy(payload)
        },
        setModal: (state, { payload }) => {
            state.dataModal = payload
        },
        updateData: (state, { payload }) => {
            state.gameData = payload
            state.dirty = true
        },
        deleteMove: (state) => {
            state.dirty = true
            state.game = state.game.deleteCurrent()
        },
        promoteMove: (state) => {
            state.dirty = true
            state.game = state.game.promoteCurrent()
            console.log(state.game)
        },
        setAnnotation: (state, { payload }) => {
            state.dirty = true
            state.game = state.game.setAnnotation(payload)
        },
        setNAGs: (state, { payload }) => {
            state.dirty = true
            state.game = state.game.setNAGs(payload)
        },
        setStartPosition: (state, { payload }) => {
            state.dirty = true
            state.game = new Game(payload)
        },
        setPositionModal: (state, { payload }) => {
            state.positionModal = payload
        },
        clearError: (state) => {
            state.error = null
        }
    },
    extraReducers: {
        [loadGame.pending]: (state) => {
            state.loaded = false
        },
        [loadGame.fulfilled]: (state, { payload }) => {
            if (!payload) {
                return {
                    ...initialState,
                    game: new Game(parseFEN(startingPosition)),
                    loaded: true
                }
            }
            else {
                const pgn = new PGN(payload.movetext, payload.start_position);
                if (pgn.error) {
                    state.loaded = true
                    state.error = pgn.error
                    state.game = new Game(parseFEN(emptyBoard))
                }
                else {
                    state.loaded = true
                    state.game = pgn.firstGame()
                    state.gameData = {
                        white_name: payload.white_name,
                        black_name: payload.black_name,
                        white_rating: payload.white_rating,
                        black_rating: payload.black_rating,
                        event: payload.event,
                        site: payload.site,
                        date: new Date(payload.date.replace('-', ' ')),
                        round: payload.round,
                        result: payload.result,
                        id: payload.id,
                        parent_id: payload.parent_id,
                        type: payload.type,
                        description: payload.description,
                        side: payload.side
                    }
                    state.saving = false
                    state.dirty = false
                }
            }
        },
        [saveGame.pending]: (state) => {
            state.saving = true
        },
        [saveGame.fulfilled]: (state, { payload }) => {
            state.saving = false
            state.dirty = false
            state.gameData = { ...state.gameData, id: payload }
        }
    }
})

export const {
    goForward,
    goBackward,
    goToStart,
    goToEnd,
    doMove,
    goToMove,
    setModal,
    updateData,
    deleteMove,
    promoteMove,
    setAnnotation,
    setNAGs,
    setStartPosition,
    setPositionModal,
    clearError
} = editorSlice.actions
export default editorSlice.reducer