import { useState,useEffect } from "react";
import './navigation.css';
import { useDispatch } from "react-redux";
import { logOut } from "../../store/session";

const ProfileButton = ({user}) => {

  const [clicked,setClicked] = useState(false);

  const dispatch = useDispatch();

  const handleClick = (e) => {
    e.preventDefault();
    setClicked(true);
  };


  const logout = (e) => {
    e.preventDefault();
    dispatch(logOut());
  };

  useEffect(() => {
    if (!clicked) return;

    const closeMenu = (e) => {
      setClicked(false);
    };

    document.addEventListener('click', closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [clicked]);

    return (
    <div>
        <button className="User submitButton"
        onClick={handleClick}
        >
          <i className="fas fa-user-circle" />
        </button>

        <div className={`${clicked} profileMenu`}>
          <div className='userInfo'>
            <p>{`Hello, ${user.firstName}`}</p>
            <p>{user.email}</p>
          </div>
          <button
          onClick={logout}
          className="submitButton"
          >Log Out</button>
        </div>
    </div>

    )
}

export default ProfileButton;
