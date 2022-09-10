import { createSlice } from "@reduxjs/toolkit"

export const LANDING = 0
export const DATABASE = 1
export const EDITOR = 2
export const STUDY = 3
export const QUIZ = 4


const initialState = {
    location: LANDING,
    params: null    
}

const navSlice = createSlice({
    name: 'nav',
    initialState,
    reducers: {
        go: (state, { payload }) => {      
            console.log(payload)      
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