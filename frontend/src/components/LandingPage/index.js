import OpenModalButton from '../OpenModalButton/index';
import SignUpFormModal from "../SignupFormModal/index";
import { Link } from 'react-router-dom';
import './LandingPage.css';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const LandingPage = () => {
    const [disabled,setDisabled] = useState(true);
    const sessionUser = useSelector(state=> state.session.user);

    useEffect(()=> {
        if (sessionUser) setDisabled(false);
        else setDisabled(true);
    },[sessionUser])

return (
    <div>

    <div className='lp-section-one'>
    <h1> The People Platform - Where Interests become Friendships</h1>
    <p> Whatever your interest, from hiking and reading to networking and skill sharing,
        there are thousands of people who share it on MeetU.
        Events are happening every day—sign up to join the fun. It's very nice to Meet You!
    </p>
    <OpenModalButton
        buttonText="Join MeetU"
        modalComponent={<SignUpFormModal
    />}
    />
    </div>

    <div className='lp-section-two'>
        <h2>How MeetU works</h2>
        <p>Since 2023, members have used MeetU to make new friends, meet like-minded people,
            spend time on hobbies, and connect with locals over shared interests. Learn how.</p>
    </div>

    <div className='lp-section-three'>
        <div className='lp-groups'>
            <h3><Link to='/groups'>See All Groups</Link></h3>
            <p>See who's hosting local events for all the things you love.</p>
        </div>
        <div className='lp-events'>
            <h3><Link to='/events'>See All Events</Link></h3>
            <p>See all of the local events for all the things you love.</p>
        </div>
        <div className={`lp-start-${disabled}`}>
            <h3><Link to='/groups/new' disabled={disabled}>Start a New Group</Link></h3>
            <p>Create your new MeetU group, and draw from a community of millions.</p>
        </div>
    </div>

    </div>
)
}
export default LandingPage;
