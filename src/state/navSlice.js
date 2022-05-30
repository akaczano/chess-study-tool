import { createSlice } from "@reduxjs/toolkit"

export const LANDING = 0
export const DATABASE = 1
export const EDITOR = 2


const initialState = {
    location: LANDING,
    params: null    
}

const navSlice = createSlice({
    name: 'nav',
    initialState,
    reducers: {
        go: (state, { payload }) => {            
            const { location, params } = payload
            state.location = location
            state.params = params
        }
    }
})

export const {
    go
} = navSlice.actions

export default navSlice.reducer