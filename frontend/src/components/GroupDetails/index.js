import { useParams,NavLink } from "react-router-dom";
import {useDispatch, useSelector} from 'react-redux';
import { fetchDetails,groupEvents } from "../../store/groups";
import { useEffect } from "react";

const GroupDetails = () => {
    const {id} = useParams();
    const dispatch = useDispatch();
    const group = useSelector(state => state.groups.group);
    const events = useSelector(state=>state.groups.groupEvents);

    useEffect(()=> {
        dispatch(fetchDetails(id));
    },[dispatch,id]);

    useEffect(()=> {
        dispatch(groupEvents(id));
    },[dispatch,id])

    if (!group || !events) return null;


    const image = group.GroupImages.filter(image => image.preview===true)[0];
    const upcomingEvents = events.Events.filter(event => new Date(event.startDate)> new Date());
    const pastEvents = events.Events.filter(event => new Date(event.startDate)< new Date());

    const handleJoinGroup = () => {
        alert('Feature Coming Soon!')
    }

    return (
        <div>
            <span> {'<'} </span> <NavLink to='/groups'>Groups</NavLink>
            <div className='gd-section-one'>
                <img src={image.url} alt={group.name}></img>
                <div className='gd-sec-one-right'>
                    <h2>{group.name}</h2>
                    <p>{group.city}, {group.state}</p>
                    <p>{group.private ? 'Private' : 'Public'}</p>
                    <p> Organized by (insert organizer name here)</p>
                    <button onClick={handleJoinGroup}>Join This Group</button>
                </div>
            </div>

            <div className='gd-section-two'>
                <h3>Organizer</h3>
                <p>Organizer name here</p>

                <h3> What we're about</h3>
                <p>{group.about}</p>

            {upcomingEvents && <h3>Upcoming Events<span> ({upcomingEvents.length}) </span></h3>}
            {upcomingEvents && upcomingEvents.map(({id,previewImage,name,startDate,Venue}) => (
                <NavLink to={`/events/${id}`} key={id} className='group-event-details'>
                    <img src={previewImage} alt={name}></img>
                    <div className='ged-left'>
                        <p>{startDate.slice(0,10)}</p>
                        <p>{startDate.slice(11,16)}</p>
                        <h4>{name}</h4>
                        <p>{Venue.city}, {Venue.state} </p>
                    </div>
                    <p>Event Description</p>
                </NavLink>
                ))
            }

            {pastEvents &&<h3>Past Events <span> ({pastEvents.length}) </span></h3>}
            {pastEvents && pastEvents.map(({id,previewImage,name,startDate,Venue}) => (
                <NavLink to={`/events/${id}`} key={id} className='group-event-details'>
                    <img src={previewImage} alt={name}></img>
                    <div className='ged-left'>
                        <p>{startDate.slice(0,10)}</p>
                        <p>{startDate.slice(11,16)}</p>
                        <h4>{name}</h4>
                        <p>{Venue.city}, {Venue.state} </p>
                    </div>
                    <p>Event Description</p>
                </NavLink>
            ))
            }

            </div>




       </div>
    )
}

export default GroupDetails;
