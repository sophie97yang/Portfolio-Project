import { csrfFetch } from "./csrf";

export const GET_GROUPS='groups/GET_GROUPS';

export const getGroups = (groups) => ({
    type:GET_GROUPS,
    groups
});

export const allGroups = () => async dispatch => {
    const res = await csrfFetch('/api/groups');

    if (res.ok) {
        const groups = await res.json();
        dispatch(getGroups(groups.Groups));
        return groups;
    } else {
        const data = await res.json();
        return data;
    }
}

const initialState = {groups:null};

const groupsReducer = (state=initialState,action) => {
    switch(action.type) {
        case GET_GROUPS:
            return {...state, groups:action.groups}
        default:
            return state;
    }

}

export default groupsReducer;
