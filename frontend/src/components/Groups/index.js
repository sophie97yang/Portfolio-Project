import { Link,NavLink,Switch,Route} from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import {useEffect} from 'react';
import { allGroups } from "../../store/groups";
import GroupDetails from '../GroupDetails';
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
                {groups.groups.map(({id,name,city,state,about,previewImage}) => (
                    <li key={id}>
                    <NavLink to={`/groups/${id}`}>
                        <div className='group-details'>
                            <img src={previewImage} alt={name}></img>
                            <div className='group-details-right'>
                                <h3>{name}</h3>
                                <p>{city},{state}</p>
                                <p>{about}</p>
                                <p>More Group Details: # of events and public/private</p>
                            </div>
                        </div>
                    </NavLink>
                    </li>
                ))}
            </ul>
        </div>
        <Switch>
            <Route path='/groups/:id'>
                <GroupDetails groups={groups.groups}/>
            </Route>
        </Switch>
    </div>
    )
}

export default Groups;
