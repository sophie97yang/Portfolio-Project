import { useState } from "react";
import './navigation.css';
import { useDispatch } from "react-redux";
import { logOut } from "../../store/session";

const ProfileButton = ({user}) => {

  const [clicked,setClicked] = useState(false);

  const dispatch = useDispatch();

  const handleClick = (e) => {
    e.preventDefault();
    setClicked(!clicked);
  };


  const logout = (e) => {
    e.preventDefault();
    setClicked(false);
    dispatch(logOut());
  };

    return (
    <div>
        <button className="User"
        onClick={handleClick}
        >
          <i className="fas fa-user-circle" />
        </button>

        <div className={`${clicked} profileMenu`}>
          <div>
            <p>{`Hello, ${user.username}`}</p>
            <p>{user.email}</p>
          </div>
          <button
          onClick={logout}
          >Log Out</button>
        </div>
    </div>

    )
}

export default ProfileButton;
