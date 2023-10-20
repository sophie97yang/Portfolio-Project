import { csrfFetch } from "./csrf";
//action type constants
export const SET_USER = 'session/SET_USER';
export const REMOVE_USER  = 'session/REMOVE_USER';
export const ADD_USER = 'session/ADD_USER';

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
        dispatch(setUser(user.user));
        return user
    } else {
        const data= await res.json();
        return data;
    }
};

export const restoreUser = () => async dispatch => {
    const res = await csrfFetch('/api/session');

    if (res.ok) {
        const user = await res.json();
        dispatch (setUser(user.user));
        return user;
    } else {
        const data = await res.json();
        return data;
    }
};

export const signUpUser = (newUser) => async dispatch => {
    const res = await csrfFetch('/api/users', {
        method: 'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(newUser)
    });

    if (res.ok) {
        const UserInfo = await res.json();
        dispatch(setUser(UserInfo.user));
        return UserInfo;
    } else {
        const data = await res.json();
        return data;
    }
}

export const logOut = () => async dispatch => {
    const res = await csrfFetch('/api/session', {
        method:'DELETE'
    });

    if (res.ok) {
        dispatch(removeUser());
    } return res;
}


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
