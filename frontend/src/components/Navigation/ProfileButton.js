import { useState,useEffect } from "react";
import './navigation.css';
import { useDispatch } from "react-redux";
import { logOut } from "../../store/session";
import {useHistory} from 'react-router-dom';

const ProfileButton = ({user}) => {
  const history = useHistory();

  const [clicked,setClicked] = useState(false);

  const dispatch = useDispatch();

  const handleClick = (e) => {
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
    history.push('/groups/current');

  }

  useEffect(() => {
    if (!clicked) return;

    const closeMenu = (e) => {
      setClicked(false);
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
        </button>

        <div className={`${clicked} profileMenu`}>
          <div className='userInfo'>
            <p>{`Hello, ${user.firstName}`}</p>
            <p>{user.email}</p>
          </div>
          <button
          className="submitButton"
          onClick={viewGroups}
          id='viewGroups'
          > View Groups </button>
          <button
          onClick={logout}
          className="submitButton"
          >Log Out</button>
        </div>
    </div>

    )
}

export default ProfileButton;
