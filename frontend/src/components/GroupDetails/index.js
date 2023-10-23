import { useParams,NavLink } from "react-router-dom";
import {useDispatch, useSelector} from 'react-redux';
import { fetchDetails } from "../../store/groups";
import { useEffect } from "react";
const GroupDetails = () => {
    const {id} = useParams();
    const dispatch = useDispatch();
    const group = useSelector(state => state.groups.group);

    useEffect(()=> {
        dispatch(fetchDetails(id));
    },[dispatch,id])

    if (!group) return null;

    const image = group.GroupImages.filter(image => image.preview===true)[0];
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

                <h3>Upcoming Events</h3>
                <NavLink to='/events'>

                </NavLink>

            </div>




       </div>
    )
}

export default GroupDetails;
