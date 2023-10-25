import { useParams,NavLink } from "react-router-dom";
import {useDispatch, useSelector} from 'react-redux';
import { fetchDetails,groupEvents } from "../../store/groups";
import { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import OpenModalButton from "../OpenModalButton";
import DeleteModal from "../DeleteModal";

import './GroupDetails.css';



const GroupDetails = () => {
    const {id} = useParams();
    const dispatch = useDispatch();
    const group = useSelector(state => state.groups.group);
    const events = useSelector(state=>state.groups.groupEvents);
    const sessionUser = useSelector(state => state.session.user);
    const [redirect,setRedirect]=useState(false);


    useEffect(()=> {
        dispatch(fetchDetails(id))
        .catch(async res => {
            const error = await res.json();
            if (error.message==="Group couldn't be found") setRedirect(true);
        });
    },[dispatch,id]);

    useEffect(()=> {
        dispatch(groupEvents(id))
        .catch(async res => {
            const error = await res.json();
            if (error.message==="Group couldn't be found") setRedirect(true);
        });
        ;
    },[dispatch,id])

    if (redirect===true) return <Redirect to='/page-not-found' />
    if (!group || !events || !group.GroupImages) return null;

    const image = group.GroupImages.filter(image => image.preview===true)[0];
    const upcomingEvents = events.Events.filter(event => new Date(event.startDate)> new Date());
    const pastEvents = events.Events.filter(event => new Date(event.startDate)< new Date());

    const handleJoinGroup = () => {
        alert('Feature Coming Soon!')
    }

    return (
        <div className='group-details-page'>
            <span> {'<'} </span> <NavLink to='/groups'>Groups</NavLink>
            <div className='gd-section-one'>
                {image ? <img src={image.url} alt={group.name}></img>: <h2>Loading Image...</h2>}
                <div className='gd-sec-one-right'>
                    <h2>{group.name}</h2>
                    <p>{group.city}, {group.state}</p>
                    <p>{events.Events.length} {events.Events.length===1 ? 'Event' : 'Events' } · {group.private ? 'Private' : 'Public'}</p>
                    <p> Organized by {group.Organizer.firstName} {group.Organizer.lastName}</p>
                    <div className='gd-manage-buttons'>
                    <NavLink to={`/groups/${id}/events/new`}> <button className={(sessionUser && sessionUser.id===group.organizerId) ? 'gd-active-organizer' : 'gd-hidden'}>Create An Event</button></NavLink>
                    <NavLink to={`/groups/${id}/edit`}> <button className={(sessionUser && sessionUser.id===group.organizerId) ? 'gd-active-organizer' : 'gd-hidden'}>Update Group</button></NavLink>
                    <OpenModalButton
                        buttonText="Delete Group"
                        modalComponent={<DeleteModal groupId={id}
                        />}
                        className={(sessionUser && sessionUser.id===group.organizerId) ? 'gd-active-organizer' : 'gd-hidden'}
                    />
                    <button onClick={handleJoinGroup} className={(sessionUser && sessionUser.id!==group.organizerId) ? 'gd-active' : 'gd-hidden'}>Join This Group</button>
                    </div>
                </div>
            </div>

            <div className='gd-section-two'>
                <h3>Organizer</h3>
                <p id='gd-organizer'>{group.Organizer.firstName} {group.Organizer.lastName}</p>

                <h3> What we're about</h3>
                <p>{group.about}</p>

            {upcomingEvents.length ? <h3>Upcoming Events<span> ({upcomingEvents.length}) </span></h3>: <h3>No Upcoming Events</h3>}
            {upcomingEvents.length ? upcomingEvents.map(({id,previewImage,name,startDate,Venue}) => (
                <div className='group-event-details' key={id}>
                <NavLink to={`/events/${id}`} key={id}>
                    <div className='ged-sec-one'>
                    <img src={previewImage} alt={name}></img>
                    <div className='ged-right'>
                        <div className='time'>
                            <p>{startDate.slice(0,10)} · </p>
                            <p> {startDate.slice(11,16)}</p>
                        </div>
                        <h4>{name}</h4>
                        <p>{Venue.city}, {Venue.state} </p>
                    </div>
                    </div>
                    <p id='e-description'>Event Description</p>
                </NavLink>
                </div>
                ))
                : <span></span>
            }

            {pastEvents.length ? <h3>Past Events <span> ({pastEvents.length}) </span></h3> : <span></span>}
            {pastEvents.length ? pastEvents.map(({id,previewImage,name,startDate,Venue}) => (
                 <div className='group-event-details'>
                 <NavLink to={`/events/${id}`} key={id}>
                     <div className='ged-sec-one'>
                     <img src={previewImage} alt={name}></img>
                     <div className='ged-right'>
                         <div className='time'>
                             <p>{startDate.slice(0,10)} · </p>
                             <p> {startDate.slice(11,16)}</p>
                         </div>
                         <h4>{name}</h4>
                         <p>{Venue.city}, {Venue.state} </p>
                     </div>
                     </div>
                     <p id='e-description'>Event Description</p>
                 </NavLink>
                 </div>
                 ))
                 : <span></span>
            }
            </div>
       </div>
    )
}

export default GroupDetails;
