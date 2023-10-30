import { Link,NavLink,Redirect} from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import {useEffect, useState} from 'react';
import { allGroups, currentGroups} from "../../store/groups";
import './GroupList.css';

const Groups = () => {
    const dispatch = useDispatch();
    const groups = useSelector(state => state.groups.groups);

    useEffect(()=> {
        dispatch(allGroups())
        .catch(res => res)
        ;
    },[dispatch]);

    if (!groups) return null;

    return (
    < div className='groupsPage'>
        <div className='groups-nav'>
            <h2><Link to='/events' id='events-link'>Events</Link></h2>
            <h2><Link to='/groups' onClick={e => e.preventDefault()} id='groups-link'>Groups</Link></h2>
        </div>

        <div>
            <span>Groups in MeetU</span>
            <ul className='groups-list'>
                {groups.map((group) => (
                    <li key={group.id}>
                    <NavLink to={`/groups/${group.id}`}>
                        <div className='group-details'>
                            <img src={group.previewImage} alt={group.name}></img>
                            <div className='group-details-right'>
                                <h3>{group.name}</h3>
                                <p className="gd-grey-details">{group.city},{group.state}</p>
                                <p>{group.about}</p>
                                <p className="gd-grey-details"> {group.numEvents} {group.numEvents===1 ? 'event' : 'events'} · {group.private ? "Private" : "Public"}</p>
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

export const CurrentGroups = () => {
    const dispatch = useDispatch();
    const groups = useSelector(state => state.groups);
    const [redirect,setRedirect] = useState(false);



    useEffect(()=> {
        dispatch(currentGroups())
        .catch((e) => {
            console.error(e.statusText);
            setRedirect(true);
            }
        );
    },[dispatch]);

    if (redirect) return <Redirect to='/groups'/>;

    if (!groups.current) return null;

    if (!groups.current.length) return (
        <div className='groupsPage'id='no-groups'>
        <h2> You have no groups 🧍🏻</h2>
        <NavLink to='/groups/new'><button id='start-new-group'>Make new friends by starting a group here!</button></NavLink>
        </div>
    )
    return (
    < div className='groupsPage'>
        <div className='groups-nav'>
           <h2>Manage Groups</h2>
        </div>

        <div>
            <span>Your Groups in MeetU</span>
            <ul className='groups-list'>
                {groups.current.map((group) => (
                    <li key={group.id}>
                    <NavLink to={`/groups/${group.id}`}>
                        <div className='group-details'>
                            <img src={group.previewImage} alt={group.name}></img>
                            <div className='group-details-right'>
                                <h3>{group.name}</h3>
                                <p className="gd-grey-details">{group.city},{group.state}</p>
                                <p>{group.about}</p>
                                <p className="gd-grey-details"> {group.numEvents} {group.numEvents===1 ? 'event' : 'events'} · {group.private ? "Private" : "Public"}</p>
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

export default Groups;
