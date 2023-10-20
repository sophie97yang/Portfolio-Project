import {useState,useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as sessionActions from '../../store/session';
import { Redirect } from 'react-router-dom';
import "./LoginForm.css";

const LoginFormPage = () => {
    const [credential,setCredential] = useState('');
    const [password,setPassword] = useState('');
    const [sustainUser, setSustainUser] = useState(false);
    const [errors,setErrors] = useState({});
    const sessionUser = useSelector(state => state.session.user);
    const dispatch = useDispatch();

    if (sessionUser) return <Redirect to='/' />


    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        const user = {credential,password};
        return await dispatch(sessionActions.logIn(user)).catch(
           async (res) => {
            res = await res.json();

            if (res?.errors) setErrors(res.errors);
        }
        )
    }

    return (
        <div className="loginForm">
        <form onSubmit={handleSubmit}>
            <h2>Log In</h2>
            <h4>Not a member yet? <span>Sign up</span></h4>
            <div className='userInput'>
            <label>Email</label>
                <input
                    type='text'
                    value={credential}
                    onChange={(e)=> setCredential(e.target.value)}
                />

            <div className='errors'>{errors?.credential}</div>
            {/* On real MeetUp, errors are calculated once user clicks out of field and every time the user inputs something
            Error message: Email is required
            Email has invalid format
            Password is required
            */}
            </div>
            <div className='userInput'>
            <label> Password </label>
                <input
                    type='password'
                    value={password}
                    onChange={(e)=> setPassword(e.target.value)}
                />

            <div className='errors'>{errors?.password}</div>
            </div>
            <label>
            <input type='checkbox'
            value={sustainUser}
            onChange={(e)=> setSustainUser(!sustainUser)}
            />
            Keep me signed in
            </label>

            <button type="submit">Log in</button>
        </form>
        </div>
    )
};

export default LoginFormPage;
