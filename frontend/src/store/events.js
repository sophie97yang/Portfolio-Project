import {csrfFetch} from './csrf';

export const GET_EVENTS='events/GET-EVENTS';
export const GET_DETAILS ='events/GET-DETAILS';


export const getEvents = (events) => ({
    type:GET_EVENTS,
    events
});

export const getDetails = (event) => ({
    type:GET_DETAILS,
    event
})

export const allEvents = () => async dispatch => {
    const res = await csrfFetch('/api/events');

    if (res.ok) {
        const events = await res.json();
        dispatch(getEvents(events.Events))
        return events
    } else {
        const data = await res.json();
        return data;
    }
};

export const eventDetails = (eventId) => async dispatch => {
    const res = await csrfFetch(`/api/events/${eventId}`);

    if (res.ok) {
        const event = await res.json();
        dispatch(getDetails(event));
        return event;
    } else {
        const data = await res.json();
        return data;
    }
}

const initialState = {events:null,event:null}

const eventsReducer = (state=initialState,action) => {
    switch (action.type) {
        case GET_EVENTS:
            return {...state,events:action.events}
        case GET_DETAILS:{
            return {...state, event:action.event}
        }
        default:
            return state;
    }

};

export default eventsReducer;
