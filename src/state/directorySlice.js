import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { download } from "../util/appUtil"
import PGN from '../chess/PGN';

export const loadFiles = createAsyncThunk(
    'directory:listFiles',
    async (parent, thunkAPI) => {
        const results = await window.electronAPI.listFiles(parent)        
        // TODO check for error
        return results
    }
)

export const postFolder = createAsyncThunk(
    'directory:postDirectoryNew',
    async (dir) => {                
        const id = await window.electronAPI.postDirectory(dir)
        // TODO check for error
        return {
            ...dir,
            id,
            key: `directory_${id}`,
            type: 0
        }
    }
)

export const updateFolder = createAsyncThunk(
    'directory:postDirectoryExisting',
    async (params) => {
        const { item, description } = params
        const { id, parent_id } = item
        const result = await window.electronAPI.postDirectory({ id, parent_id, description })
        // TODO check for error
        return { ...item, description }
    }
)

export const deleteItem = createAsyncThunk(
    'directory:delete',
    async (key) => {
        const [type, id] = key.split('_')
        let result = null
        if (type === 'directory') {
            result = await window.electronAPI.deleteDirectory(id)
        }
        else {
            result = await window.electronAPI.deleteGame(id)
        }
        return key
    }
)

export const downloadGames = createAsyncThunk(
    'directory:downloadGames',
    async (ids) => {
        const games = await window.electronAPI.downloadGames(ids)
        // TODO check for error
        let pgn = ''
        for (const game of games) {
            const tags = [
                {name: 'Event', value: game.event},
                {name: 'Site', value: game.site},
                {name: 'Date', value: game.date},
                {name: 'Round', value: game.round},
                {name: 'White', value: game.white_name},
                {name: 'Black', value: game.black_name},
                {name: 'result', value: game.result}                           
            ];
            if (game.white_rating != 0) {
                tags.push({name: 'WhiteELO', value: game.white_rating});
            }
            if (game.black_rating != 0) {
                tags.push({name: 'BlackELO', value: game.black_rating})
            }
            let segment = '';
            for (const tag of tags) {
                segment += `[${tag.name} "${tag.value}"]\n`
            }                        
            const pgnGame = new PGN(game.movetext, game.start_position);
            if (pgnGame.error) {
                console.log('error loading pgn: ' + pgn.error);
                continue;
            }
            else {
                segment += '\n';;
                segment += pgnGame.firstGame().writePGN();                
                segment += ` ${game.result}\n`;
            }
            pgn += segment + '\n';        
        }        
        download(pgn);
        return pgn.length
    }
)

export const move = createAsyncThunk(
    'directory:move',
    async (params) => {
        const { type, id, parent_id } = params
        let result = null;
        if (type === 0) {
            result = await window.electronAPI.moveDirectory(id, parent_id)
        }
        else {
            result = await window.electronAPI.moveGame(id, parent_id)
        }
    }
)

export const uploadGames = createAsyncThunk(
    'directory:uploadGames',
    async (games) => {
        const doUpload = async gamelist => {
            for (const game of gamelist) {            
                const id = await window.electronAPI.postGame(game)
                game.id = id                     
            }        
        };
        await doUpload(games)
        return games.map(g => {
            return {
                ...g,
                date: g.date.toLocaleDateString(),
                key: `game_${g.id}`,
                type: 1
            }
        })
    }
)

const initialState = {
    path: [],
    files: null,
    posting: false,
    renaming: [],
    deleting: [],
    editing: -1,
    downloading: false,
    editingName: '',
    moveSource: null,
    errMsg: null,
    moving: false,
    uploading: false,
    selection: [],
    showSelection: false,
    sortField: 0,
    showFilter: false,
    filter: {
        name: {
            text: '',
            match: 0
        },
        startDate: null,
        endDate: null,
        event: 'Any',
        result: ''
    }
}

export const directorySlice = createSlice({
    name: 'directory',
    initialState,
    reducers: {
        beginEdit: (state, { payload }) => {
            const { key, description } = payload
            state.editing = key
            state.editingName = description
        },
        cancelEdit: (state) => {
            state.editing = false
        },
        editUpdate: (state, { payload }) => {
            state.editingName = payload
        },
        beginMove: (state, { payload }) => {
            state.moveSource = payload
        },
        cancelMove: (state) => {
            state.moveSource = null
        },
        setError: (state, payload) => {
            state.errMsg = payload
        },
        clearError: (state) => {
            state.errMsg = null
        },
        selectEntry: (state, { payload }) => {
            if (!state.selection.find(e => e.key === payload.key)) {
                state.selection.push(payload)
            }            
        },
        unselectEntry: (state, { payload }) => {
            state.selection = state.selection.filter(i => i.key !== payload.key)
        },
        clearSelection: (state) => {
            state.selection = []
        },
        showSelection: (state) => {
            state.showSelection = true
        },
        hideSelection: (state) => {
            state.showSelection = false
        },
        setSort: (state, { payload }) => {
            state.sortField = payload
        },
        setFilter: (state, { payload }) => {
            state.filter = payload
        },
        clearFilter: (state) => {
            state.filter = initialState.filter
        }
    },
    extraReducers: {
        [loadFiles.fulfilled]: (state, { payload }) => {
            state.files = payload.list
            state.path = payload.path
        },
        [postFolder.pending]: (state) => {
            state.posting = true
        },
        [postFolder.fulfilled]: (state, { payload }) => {
            state.files.push(payload)
            state.posting = false
        },
        [updateFolder.pending]: (state, action) => {
            state.renaming.push(action.meta.arg.item.key)
        },
        [updateFolder.fulfilled]: (state, { payload }) => {
            const otherFiles = state.files.filter(f => f.key !== payload.key)
            state.files = [...otherFiles, payload]
            state.editing = -1
            state.renaming = state.renaming.filter(e => e != payload.key)
        },
        [deleteItem.pending]: (state, action) => {
            state.deleting.push(action.meta.arg)
        },
        [deleteItem.fulfilled]: (state, { payload }) => {            
            state.files = state.files.filter(f => f.key !== payload);            
            state.deleting = state.deleting.filter(k => k !== payload);            
        },
        [downloadGames.pending]: (state) => {
            state.downloading = true
        },
        [downloadGames.fulfilled]: (state) => {
            state.downloading = false
        },
        [move.pending]: (state) => {
            state.moving = true
        },
        [move.fulfilled]: (state) => {
            const newFiles = state.files.filter(f => f.key !== state.moveSource.key); 
            state.moving = false
            state.moveSource = null
            state.files = newFiles            
        },
        [uploadGames.pending]: (state) => {
            state.uploading = true            
        },
        [uploadGames.fulfilled]: (state, { payload }) => {
            state.uploading = false
            state.games = [...state.games, ...payload]
        },
        [uploadGames.rejected]: (state, { payload }) => {
            state.uploading = false
            state.errMsg = payload
        }        
    }
})

export const {
    beginEdit,
    cancelEdit,
    editUpdate,
    beginMove,
    cancelMove,
    setError,
    clearError,
    selectEntry,
    unselectEntry,
    clearSelection,
    showSelection,
    hideSelection,
    setSort,
    setFilter,
    clearFilter
} = directorySlice.actions
export default directorySlice.reducer