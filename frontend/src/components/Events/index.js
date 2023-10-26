import { Link,NavLink} from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import {useEffect} from 'react';
import { allEvents} from "../../store/events";
import noImage from '../GroupDetails/Image_not_available.png';
import './EventsList.css';

const Events = () => {
    const dispatch = useDispatch();
    const events = useSelector(state=>state.events);


    useEffect(()=> {
        dispatch(allEvents())
        .catch(res => console.log(res));
    },[dispatch]);

    if (!events.events) return null;

   events.events.forEach(event => {
    const startDate = new Date(event.startDate).toLocaleString();
    const index = startDate.indexOf(',');
    const date = startDate.slice(0,index);
    const time = startDate.slice(index+1,startDate.length);
    event.date = date;
    event.time =time;
   });

    return (
    <div className='eventsPage'>
        <div className='events-nav'>
            <h2><Link to='/events' id='E-events-link' onClick={e => e.preventDefault()}>Events</Link></h2>
            <h2><Link to='/groups' id='E-groups-link'>Groups</Link></h2>
        </div>

        <div>
            <span>Events in MeetU</span>
            <ul className='events-list'>
                {events.events.map(({id,previewImage,name,Venue,time,date,description,Group}) => (
                    <li key={id}>
                    <NavLink to={`/events/${id}`}>
                        <div className='event-details'>
                            <div id='ed-left'>
                                {previewImage!=='Preview image is not available' ?<img src={previewImage} alt={name}></img> : <img src={noImage} alt='not-available'></img> }
                            </div>
                            <div className='event-details-right'>
                                <p className='time'>{date} · {time}</p>
                                <h3>{name}</h3>
                                {Group ? <p className="ed-grey-details">{Venue ? `${Venue.city},${Venue.state}` : `${Group.city}, ${Group.state}`}</p>: <p>city,state</p>}
                                <p>{description}</p>
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
