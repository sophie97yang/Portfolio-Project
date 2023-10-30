import { useState,useEffect, useRef } from "react";
import './navigation.css';
import { useDispatch } from "react-redux";
import { logOut } from "../../store/session";
import {useHistory} from 'react-router-dom';

const ProfileButton = ({user}) => {
  const history = useHistory();
  const [clicked,setClicked] = useState(false);
  const dispatch = useDispatch();
  const divRef = useRef();

  const handleClick = (e) => {
    if (clicked) return;
    e.preventDefault();
    setClicked(true);
  };


  const logout = (e) => {
    e.preventDefault();
    dispatch(logOut());
    history.push('/')
  };

  const viewGroups = (e) => {
    e.preventDefault();
    setClicked(false);
    history.push('/groups/current');

  }

  const viewEvents = (e) => {
    e.preventDefault();
    setClicked(false);
    history.push('/events/current');
  }

  useEffect(() => {
    if (!clicked) return;

    const closeMenu = (e) => {
      if (!divRef.current.contains(e.target)) {
        setClicked(false);
      }
    };

    document.addEventListener('click', closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [clicked]);


    return (
    <div id='profile-button'>
        <button className="User submitButton"
        onClick={handleClick}
        >
          <i className="fa-solid fa-user-circle fa-lg"/>
          <i className="fa-solid fa-angle-up fa-lg" id={`dropdown-arrow-up-${clicked}`}></i>
          <i className="fa-solid fa-angle-down fa-lg" id={`dropdown-arrow-down-${clicked}`}></i>
        </button>

        <div className={`${clicked} profileMenu`} ref={divRef}>
          <div className='userInfo'>
            <p>{`Hello, ${user.firstName}`}</p>
            <p>{user.email}</p>
          </div>
          <button
          className="submitButton"
          onClick={viewGroups}
          id='viewGroups'
          > Your Groups </button>

        <button
          className="submitButton"
          onClick={viewEvents}
          id='viewEvents'
          > Your Events </button>

          <button
          onClick={logout}
          className="submitButton"
          >Log Out</button>
        </div>
    </div>

    )
}

export default ProfileButton;
