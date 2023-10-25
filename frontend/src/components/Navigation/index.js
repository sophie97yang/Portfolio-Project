import { NavLink } from "react-router-dom";
import ProfileButton from './ProfileButton';
import { useSelector } from "react-redux";
import logo from './Meet-U.png';
import OpenModalButton from '../OpenModalButton';
import LoginFormModal from "../LoginFormModal";
import SignUpFormModal from "../SignupFormModal";
import './navigation.css';

const Navigation = ({isLoaded}) => {
    const sessionUser = useSelector(state => state.session.user);
    return (
        <nav>
            <ul>
            <li className='logo'>
                <p className='niceTo'>Nice to</p>
                <NavLink to='/'> <img src={logo} alt='logo'></img></NavLink>
            </li>
            {isLoaded && (!sessionUser ?
                <>
                <div className='NavLinks'>
                <li>
                    <OpenModalButton
                    buttonText="Log In"
                    modalComponent={<LoginFormModal
                    />}
                    />
                    <OpenModalButton
                    buttonText="Sign Up"
                    modalComponent={<SignUpFormModal
                    />}
                    />
                </li>
                </div>
                </>
                :
                <>
                <NavLink to='/groups/new'>Start a new group</NavLink>
                <ProfileButton user={sessionUser}/>
                </>
                )
            }
            </ul>
        </nav>
    )
}

export default Navigation
