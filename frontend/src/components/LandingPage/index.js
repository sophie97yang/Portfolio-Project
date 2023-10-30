import OpenModalButton from '../OpenModalButton/index';
import SignUpFormModal from "../SignupFormModal/index";
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import mainImage from './main-image.png';
import groupsIcon from './groups.png';
import eventsIcon from './events.png';
import startIcon from './start.png';
import './LandingPage.css';
const LandingPage = () => {
    const [disabled,setDisabled] = useState(true);
    const sessionUser = useSelector(state=> state.session.user);

    useEffect(()=> {
        if (sessionUser) setDisabled(false);
        else setDisabled(true);
    },[sessionUser])

return (
    <div id='landing-page'>

    <div className='lp-section-one'>
        <div id='lp-sec-one-text'>
            <h1> The People Platform - Where Interests become Friendships</h1>
            <p> Whatever your interest, from hiking and reading to networking and skill sharing,
                there are thousands of people who share it on MeetU.
                Events are happening every day—sign up to join the fun. It's very nice to Meet You!
            </p>
        </div>
        <img src={mainImage} alt='People'></img>
    </div>

    <div className='lp-section-two'>
        <h2>How MeetU works</h2>
        <p>Since 2023, members have used MeetU to make new friends, meet like-minded people,
            spend time on hobbies, and connect with locals over shared interests. Learn how.</p>
    </div>

    <div className='lp-section-three'>
        <div className='lp-groups'>
            <img src={groupsIcon} alt='groups'></img>
            <h3><Link to='/groups'>See All Groups</Link></h3>
            <p>See who's hosting local events for all the things you love.</p>
        </div>
        <div className='lp-events'>
            <img src={eventsIcon} alt='events'></img>
            <h3><Link to='/events'>Find an Event</Link></h3>
            <p>See all of the local events for all the things you love.</p>
        </div>
        <div className={`lp-start-${disabled}`}>
            <img src={startIcon} alt='startGroup'></img>
            <h3>{disabled ? <Link onClick={e => e.preventDefault()} to='/'>Start a New Group</Link> :<Link to='/groups/new'>Start a New Group</Link>}</h3>
            <p>Create your new MeetU group, and draw from a community of millions.</p>
        </div>
    </div>

    <div className='lp-section-four'>
        <OpenModalButton
            buttonText="Join MeetU"
            className={sessionUser ? "hidden-join" : "active-join"}
            modalComponent={<SignUpFormModal
        />}
        />
    </div>

    </div>
)
}
export default LandingPage;
