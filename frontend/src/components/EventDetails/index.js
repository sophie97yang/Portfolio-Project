import { useParams,NavLink,Redirect } from "react-router-dom";
import {useDispatch, useSelector} from 'react-redux';
import {eventDetails} from "../../store/events";
import { useEffect, useState } from "react";
import { fetchDetails } from "../../store/groups";
import OpenModalButton from "../OpenModalButton";
import DeleteModal from "../DeleteModal";
import noImage from '../GroupDetails/Image_not_available.png';
import './EventDetails.css';


const EventDetails = () => {
    const {id} = useParams();
    const dispatch = useDispatch();
    const event = useSelector(state=>state.events.event);
    const group = useSelector(state => state.groups.group);
    const sessionUser = useSelector(state => state.session.user);
    const [redirect,setRedirect] = useState(false);

    useEffect(()=> {
        dispatch(eventDetails(id))
        .catch(async res => {
            const error = await res.json();
            if (error.message==="Event couldn't be found") setRedirect(true);
        })
        ;
    },[dispatch,id]);

    useEffect(()=> {
        if (event) dispatch(fetchDetails(event.groupId));
    },[event,dispatch])

    if (redirect===true) return <Redirect to='/page-not-found' />
    if (!event) return null;
    if (!group) return null;

    const image = event.EventImages.filter(image => image.preview===true)[0];
    const groupImage = group.GroupImages.filter(image => image.preview === true)[0];
    const startDate = new Date(event.startDate).toLocaleString();
    const indexOfSeparation = startDate.indexOf(',');
    const endDate = new Date(event.endDate).toLocaleString();
    const indexOfEndDate = endDate.indexOf(',');


    return (
        <div className='event-details-page'>
            <span> {'<'} </span> <NavLink to='/events'>Events</NavLink>
            <div className='ed-section-one'>
                <h2>{event.name}</h2>
                <p>Hosted by {group.Organizer.firstName} {group.Organizer.lastName}</p>
            </div>
            <div className='ed-section-two'>
                <div id='ed-sec-two-left'>
                {image ? <img src={image.url} alt={event.name}></img>: <img src={noImage} alt="not-available"></img>}
                </div>
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
                                <p>START <span>{startDate.slice(0,indexOfSeparation)} · {startDate.slice(indexOfSeparation+1,startDate.length)}</span></p>
                                <p>END <span>{endDate.slice(0,indexOfEndDate)} · {endDate.slice(indexOfEndDate+1,endDate.length)}</span></p>
                            </div>
                        </div>
                        <div className='ed-details-section'>
                            <i className="fas fa-dollar-sign"></i>
                            <p> {event.price ? `$ ${event.price}` : 'FREE'}</p>
                        </div>
                        <div className='ed-details-section'>
                            <i className='fas fa-location-dot'></i>
                            <p>{event.type}</p>
                        </div>
                        <div className='ed-details-buttons'>
                            <NavLink to={`/events/${id}/edit`}><button className={(sessionUser && sessionUser.id===group.organizerId) ? 'ed-active' :'ed-hidden'} id='ed-update'>Update</button></NavLink>
                            {/* <button className={(sessionUser && sessionUser.id===group.organizerId) ? 'ed-active' :'ed-hidden'} id='ed-delete'>Delete</button> */}
                                <OpenModalButton
                                    buttonText="Delete"
                                    modalComponent={<DeleteModal id={id} deleteType='Event' groupId={group.id}
                                    />}
                                    className={(sessionUser && sessionUser.id===group.organizerId) ? 'ed-active' :'ed-hidden'}
                                />
                        </div>
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
