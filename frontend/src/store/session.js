import { csrfFetch } from "./csrf";
//action type constants
export const SET_USER = 'session/SET_USER';
export const REMOVE_USER  = 'session/REMOVE_USER';

//POJO action creators
export const setUser = (user) => ({
    type: SET_USER,
    user
});
export const removeUser = () => ({
    type:REMOVE_USER
})

//thunk action creators
export const logIn = (credentials) => async dispatch => {
    const res = await csrfFetch('/api/session', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(credentials)
    });

    if (res.ok) {
        const user = await res.json();
        dispatch(setUser(user));
        return user
    } else return res.json();
};


const initialState={user:null}

const sessionReducer = (state=initialState,action) => {
switch(action.type) {
    case SET_USER:
        return {...state,user:action.user}
    case REMOVE_USER: {
        return {...state, user: null}
    }
    default:
        return state;
}
}

export default sessionReducer;
