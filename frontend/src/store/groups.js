import { csrfFetch } from "./csrf";

export const GET_GROUPS='groups/GET_GROUPS';
export const GET_DETAILS = 'groups/GET_DETAILS';

export const getGroups = (groups) => ({
    type:GET_GROUPS,
    groups
});

export const getDetails = (group) => ({
    type:GET_DETAILS,
    group
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
};

export const fetchDetails = (groupId) => async dispatch => {
    const res = await csrfFetch(`/api/groups/${groupId}`);

    if (res.ok) {
        const group = await res.json();
        dispatch(getDetails(group));
        return group
    } else {
        const data = await res.json();
        return data;
    }

};


const initialState = {groups:null,group:null};

const groupsReducer = (state=initialState,action) => {
    switch(action.type) {
        case GET_GROUPS:
            return {...state, groups:action.groups}
        case GET_DETAILS:
            return {...state, group:action.group}
        default:
            return state;
    }

}

export default groupsReducer;
