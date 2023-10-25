import { useParams,NavLink } from "react-router-dom";
import {useDispatch, useSelector} from 'react-redux';
import {eventDetails} from "../../store/events";
import { useEffect } from "react";
import './EventDetails.css';
import { fetchDetails } from "../../store/groups";

const EventDetails = () => {
    const {id} = useParams();
    const dispatch = useDispatch();
    const event = useSelector(state=>state.events.event);
    const group = useSelector(state => state.groups.group);
    const sessionUser = useSelector(state => state.session.user);

    useEffect(()=> {
        dispatch(eventDetails(id));
    },[dispatch,id]);

    useEffect(()=> {
        if (event) dispatch(fetchDetails(event.groupId));
    },[event,dispatch])

    if (!event) return null;
    if (!group) return null;

    const image = event.EventImages.filter(image => image.preview===true)[0];
    const groupImage = group.GroupImages.filter(image => image.preview === true)[0];

    return (
        <div className='event-details-page'>
            <span> {'<'} </span> <NavLink to='/events'>Events</NavLink>
            <div className='ed-section-one'>
                <h2>{event.name}</h2>
                <p>Hosted by {group.Organizer.firstName} {group.Organizer.lastName}</p>
            </div>
            <div className='ed-section-two'>
                <img src={image.url} alt={event.name}></img>
                <div className='ed-sec-two-right'>
                    <NavLink to={`/groups/${event.groupId}`}id='ed-group-details'>
                        <img src={groupImage.url} alt={group.name}></img>
                        <div className='ed-gd-right'>
                            <h4>{event.Group.name}</h4>
                            <p>{event.Group.private==='true' ? 'Private' : 'Public'}</p>
                        </div>
                    </NavLink>
                    <div className='ed-details'>
                        <div className='ed-details-section'>
                            <i className="fas fa-clock"></i>
                            <div id='startEnd'>
                                <p>START <span>{event.startDate.slice(0,10)} · {event.startDate.slice(11,16)}</span></p>
                                <p>END <span>{event.endDate.slice(0,10)} · {event.endDate.slice(11,16)}</span></p>
                            </div>
                        </div>
                        <div className='ed-details-section'>
                            <i className="fas fa-dollar-sign"></i>
                            <p>$ {event.price || 'FREE'}</p>
                        </div>
                        <div className='ed-details-section'>
                            <i className='fas fa-location-dot'></i>
                            <p>{event.type}</p>
                        </div>

                        <button className={(sessionUser && sessionUser.id===group.organizerId) ? 'ed-active' :'ed-hidden'} id='ed-update'>Update</button>
                        <button className={(sessionUser && sessionUser.id===group.organizerId) ? 'ed-active' :'ed-hidden'} id='ed-delete'>Delete</button>
                    </div>
                </div>
            </div>
            <div className='ed-section-three'>
                <h3>Details</h3>
                <p>{event.description}</p>
            </div>
        </div>
    )
}
export default EventDetails
