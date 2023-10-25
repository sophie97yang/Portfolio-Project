import { csrfFetch } from "./csrf";

//Action Type Constants
export const GET_GROUPS='groups/GET_GROUPS';
export const GET_CURRENT='groups/GET_CURRENT';
export const GET_DETAILS = 'groups/GET_DETAILS';
export const GET_EVENTS = 'groups/GET_EVENTS';
export const ADD_GROUP = 'groups/ADD_GROUP';
export const ADD_IMAGE = 'groups/ADD_IMAGE';
export const EDIT_GROUP = 'groups/EDIT_GROUP';
export const REMOVE_GROUP = 'groups/REMOVE_GROUP';


//Action Creators
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

export const addImage = (image) => ({
    type:ADD_IMAGE,
    image
})

export const editGroup = (groupId,group) => ({
    type:EDIT_GROUP,
    group,
    groupId
});

export const removeGroup = (groupId) => ({
    type:REMOVE_GROUP,
    groupId
});


//Thunk Action Creators
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
        return newGroup;
    } else {
        const data = await res.json();
        return data;
    }
}

export const addGroupImage = (payload,groupId) => async dispatch => {
    const res = await csrfFetch(`/api/groups/${groupId}/images`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload)
    });

    if (res.ok) {
        const groupImage = await res.json();
        dispatch(addImage(groupImage));
        return groupImage
    } else {
        const data = await res.json();
        return data;
    }
}

export const updateGroup = (payload,groupId) => async dispatch => {
    const res = await csrfFetch(`/api/groups/${groupId}`, {
        method:'PUT',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload)
    });

    if (res.ok) {
        const updatedGroup = await res.json();
        dispatch(editGroup(groupId,updatedGroup))
        return updatedGroup
    } else {
        const data = await res.json();
        return data;
    }

};

export const deleteGroup = (groupId) => async dispatch => {
    const res = await csrfFetch(`/api/groups/${groupId}`, {
        method:'DELETE'
    });
    const data = await res.json();
    if (res.ok) {
        await dispatch(removeGroup(groupId));
        return data;
    } else {
        return data;
    }
}

const initialState = {groups:[],group:null,groupEvents:null,current:[],image:null};

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
        case ADD_IMAGE:
            return {...state, image: action.image}
        case EDIT_GROUP: {
            const newState = [...state.groups];
            if (newState.length) {
            const index = newState.findIndex(group => group.id===Number(action.groupId));
            newState[index]=action.group;
            }
            const currGroupsState = [...state.current];
            if (currGroupsState.length) {
                const groupIndex =currGroupsState.findIndex(group => group.id === Number(action.groupId));
                currGroupsState[groupIndex] = action.group
            }
            return {...state,group:action.group,groups:newState}
        }
        case REMOVE_GROUP: {
            const newState = [...state.groups];
            if (newState) {
                const index = newState.findIndex(group => group.id === Number(action.groupId));
                newState.splice(index,1);
            }
            const currGroupsState = [...state.current];
            if (currGroupsState) {
                const groupIndex =currGroupsState.findIndex(group => group.id === Number(action.groupId));
                currGroupsState.splice(groupIndex,1);
            }

            return {...state, groups:newState,group:null,current:currGroupsState}
        }
        default:
            return state;
    }

}

export default groupsReducer;
