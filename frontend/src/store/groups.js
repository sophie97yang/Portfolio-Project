import { csrfFetch } from "./csrf";

export const GET_GROUPS='groups/GET_GROUPS';
export const GET_CURRENT='groups/GET_CURRENT';
export const GET_DETAILS = 'groups/GET_DETAILS';
export const GET_EVENTS = 'groups/GET_EVENTS';
export const ADD_GROUP = 'groups/ADD_GROUP';


export const getGroups = (groups) => ({
    type:GET_GROUPS,
    groups
});

export const getCurrent = (groups) => ({
    type:GET_CURRENT,
    groups
});

export const getDetails = (group) => ({
    type:GET_DETAILS,
    group
});

export const getEvents = (events) => ({
    type:GET_EVENTS,
    events
});

export const addGroup = (group) => ({
    type:ADD_GROUP,
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

export const currentGroups = () => async dispatch => {
    const res = await csrfFetch('/api/groups/current');

    if (res.ok) {
        const current = await res.json();
        dispatch(getCurrent(current.Groups));
        return current;
    } else {
        const data = await res.json();
        return data;
    }
}

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

export const groupEvents = (groupId) => async dispatch => {
    const res = await csrfFetch(`/api/groups/${groupId}/events`);

    if (res.ok) {
        const events = await res.json();
        dispatch(getEvents(events));
        return events;
    } else {
        const data = await res.json();
        return data;
    }
}

export const createGroup = (payload) => async dispatch => {
    const res = await csrfFetch('/api/groups', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload)
    });

    if (res.ok) {
        const newGroup = await res.json();
        dispatch(addGroup(newGroup));
        dispatch(getDetails(newGroup.id))
        return newGroup;
    } else {
        const data = await res.json();
        return data;
    }
}

const initialState = {groups:null,group:null,groupEvents:null,current:null};

const groupsReducer = (state=initialState,action) => {
    switch(action.type) {
        case GET_GROUPS:
            return {...state, groups:action.groups}
        case GET_CURRENT:
            return {...state,current:action.groups}
        case GET_DETAILS:
            return {...state, group:action.group}
        case GET_EVENTS:
            return {...state, groupEvents: action.events}
        case ADD_GROUP:
            return {...state, groups:[...state.groups,action.group]}
        default:
            return state;
    }

}

export default groupsReducer;
