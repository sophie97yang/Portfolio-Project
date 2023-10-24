import { Link,NavLink} from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import {useEffect} from 'react';
import { allEvents, getDetails } from "../../store/events";
import './EventsList.css';

const Events = () => {
    const dispatch = useDispatch();
    const events = useSelector(state=>state.events);
    const eventDetails = useSelector(state=>state.event);


    useEffect(()=> {
        dispatch(allEvents());
    },[dispatch]);

    if (!events.events) return null;


    return (
    <div className='eventsPage'>
        <div className='events-nav'>
            <h2><Link to='/events' id='E-events-link' onClick={e => e.preventDefault()}>Events</Link></h2>
            <h2><Link to='/groups' id='E-groups-link'>Groups</Link></h2>
        </div>

        <div>
            <span>Events in MeetU</span>
            <ul className='events-list'>
                {events.events.map(({id,previewImage,name,Venue,startDate}) => (
                    <li key={id}>
                    <NavLink to={`/events/${id}`}>
                        <div className='event-details'>
                            <img src={previewImage} alt={name}></img>
                            <div className='event-details-right'>
                                <p className='time'>{startDate.slice(0,10)} · {startDate.slice(11,16)}</p>
                                <h3>{name}</h3>
                                <p className="ed-grey-details">{Venue.city},{Venue.state}</p>
                                <p>Event Description</p>
                            </div>
                        </div>
                    </NavLink>
                    </li>
                ))}
            </ul>
        </div>
    </div>
    )

}

export default Events;
