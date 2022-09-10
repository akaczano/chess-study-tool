import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const createTemplate = createAsyncThunk(
    'template:create',
    async (params, thunkAPI) => {
        const { description, files } = params
        try {
            await window.electronAPI.createTemplate(description, files)
        }
        catch (err) {
            thunkAPI.rejectWithValue(3)
        }
    }
)

export const listTemplates = createAsyncThunk(
    "template:list",
    async (_, thunkAPI) => {
        try {
            const list = await window.electronAPI.listTemplates()
            return list
        }
        catch (err) {
            console.log(err)
            thunkAPI.rejectWithValue(err)
        }
    }
)

export const deleteTemplate = createAsyncThunk(
    'template:delete',
    async (id, thunkAPI) => {
        if (await window.electronAPI.deleteTemplate(id)) {
            return id
        }
        else {            
            return thunkAPI.rejectWithValue(1)
        }
    }
)


const initialState = {
    descriptionModal: false,
    createStatus: 0,
    loadingList: false,
    list: null,
    deleting: [],
    deleteError: false,
}

const templateSlice = createSlice({
    name: 'template',
    initialState,
    reducers: {
        clearError: (state) => {
            state.deleteError = false
        },
        setDescriptionModal: (state, { payload }) => {
            state.descriptionModal = payload
        },
        setCreateStatus: (state, { payload }) => {
            state.createStatus = payload
        }
    },
    extraReducers: {
        [createTemplate.pending]: state => {
            state.createStatus = 1
        },
        [createTemplate.fulfilled]: state => {
            state.descriptionModal = false
            state.createStatus = 2
        },
        [createTemplate.rejected]: state => {
            state.descriptionModal = false
            state.createStatus = 3
        },
        [listTemplates.pending]: state => {
            state.loadList = true
        },
        [listTemplates.fulfilled]: (state, { payload }) => {
            state.loadingList = false
            state.list = payload
        },
        [listTemplates.rejected]: (state) => {
            state.loadingList = false
            state.list = null
        },
        [deleteTemplate.pending]: (state, action) => {
            state.deleting.push(action.meta.arg)
        },
        [deleteTemplate.fulfilled]: (state, { payload }) => {            
            state.deleting = state.deleting.filter(k => k !== payload);
            state.list = state.list.filter(k => k.id !== payload)
        },
        [deleteTemplate.rejected]: (state, action) => {            
            state.deleting = state.deleting.filter(k => k != action.meta.arg)
            state.deleteError = true
        }
    }
})

export const {
    setDescriptionModal,
    setCreateStatus,
    setDescription,
    clearError
} = templateSlice.actions

export default templateSlice.reducer