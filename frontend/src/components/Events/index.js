import { Link,NavLink,Redirect } from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import {useEffect, useState} from 'react';
import { allEvents} from "../../store/events";
import {currentGroups,groupEvents} from '../../store/groups';
import noImage from '../GroupDetails/Image_not_available.png';
import './EventsList.css';

const Events = () => {
    const dispatch = useDispatch();
    const events = useSelector(state=>state.events);


    useEffect(()=> {
        dispatch(allEvents())
        .catch(res => res);
    },[dispatch]);

    if (!events.events) return null;

    const upcomingEvents = events.events.filter(event =>{
        const startDate = new Date(event.startDate).toLocaleString();
        return (new Date(startDate) > new Date());
    });

    const pastEvents = events.events.filter(event => {
        const startDate = new Date(event.startDate).toLocaleString();
        return (new Date(startDate) < new Date());
    });

   upcomingEvents.forEach(event => {
    const startDate = new Date(event.startDate).toLocaleString();
    const index = startDate.indexOf(',');
    const date = startDate.slice(0,index);
    const time = startDate.slice(index+1,startDate.length);
    event.date = date;
    event.time =time;
   });

   pastEvents.forEach(event => {
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
                {upcomingEvents.map(({id,previewImage,name,Venue,time,date,description,Group}) => (
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

                {pastEvents.map(({id,previewImage,name,Venue,time,date,description,Group}) => (
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

};

// export const CurrEvents = () => {
//     const dispatch = useDispatch();
//     const groups = useSelector(state => state.groups);
//     const [redirect,setRedirect] = useState(false);
//     const eventsList=[];

//     useEffect(()=> {
//         const currentGroups = async () => {
//             const groups = await dispatch(currentGroups())
//             .catch((e) => {
//                 console.error(e.statusText);
//                 setRedirect(true);
//                 }
//             );

//             return groups;
//         }

//     },[dispatch]);

//     if (redirect) return <Redirect to='/events'/>;

//     if (!groups.current) return null;

//     if (!groups.current.length) return (
//         <div className='eventsPage'id='no-events'>
//         <h2> You have no events 🧍🏻</h2>
//         <NavLink to='/groups/current'><button id='start-new-group'>Click here for a list of your groups you can make an event for</button></NavLink>
//         </div>
//     )



//    return <h2>hello</h2>
// }

export default Events;
