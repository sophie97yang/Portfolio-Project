import { NavLink } from "react-router-dom";
import ProfileButton from './ProfileButton';
import { useSelector } from "react-redux";
import logo from './Meet-U.png';
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
                <li><NavLink to='/login'> Log In </NavLink></li>
                <li><NavLink to='/signup'> Sign Up </NavLink></li>
                </div>
                </>
                :
                <ProfileButton user={sessionUser}/>)
            }
            </ul>
        </nav>
    )
}

export default Navigation
