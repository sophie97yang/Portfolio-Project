import { Link,NavLink} from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import {useEffect} from 'react';
import { allGroups } from "../../store/groups";
import './GroupList.css';

const Groups = () => {
    const dispatch = useDispatch();
    const groups = useSelector(state => state.groups);

    useEffect(()=> {
        dispatch(allGroups());
    },[dispatch]);

    if (!groups.groups) return null;

    return (
    < div className='groupsPage'>
        <div className='groups-nav'>
            <h2><Link to='/events' id='events-link'>Events</Link></h2>
            <h2><Link to='/groups' onClick={e => e.preventDefault()} id='groups-link'>Groups</Link></h2>
        </div>

        <div>
            <ul className='groups-list'>
                {groups.groups.map((group) => (
                    <li key={group.id}>
                    <NavLink to={`/groups/${group.id}`}>
                        <div className='group-details'>
                            <img src={group.previewImage} alt={group.name}></img>
                            <div className='group-details-right'>
                                <h3>{group.name}</h3>
                                <p className="gd-grey-details">{group.city},{group.state}</p>
                                <p>{group.about}</p>
                                <p className="gd-grey-details"> # events · {group.private ? "Private" : "Public"}</p>
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
