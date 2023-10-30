import { useState, useEffect } from "react";
import { signUpUser } from "../../store/session";
import { useDispatch} from 'react-redux';
import { useModal } from "../../context/modal";
import OpenModalButton from "../OpenModalButton";
import LoginFormModal from "../LoginFormModal";
import './SignUpForm.css';
import { useHistory } from "react-router-dom";


const SignUpFormModal = () => {
    const [firstName,setFirstName] = useState('');
    const [lastName,setLastName] = useState('');
    const [email,setEmail] = useState('');
    const [username,setUsername] = useState('');
    const [password,setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [errors,setErrors] = useState({});
    const [formError,setFormErrors] = useState({empty:'true'});
    const [disabled, setDisabled] = useState(true);
    const {closeModal} = useModal();

    const dispatch = useDispatch();
    const history = useHistory();


    useEffect(()=> {
        if (Object.keys(formError).length) setDisabled(true);
        else setDisabled(false);
    },[formError])

    useEffect(()=> {
        const errorsForm = {};
        if (!firstName.length) errorsForm.firstName = true;
        if (!lastName.length) errorsForm.lastName = true;
        if (username.length<4) errorsForm.username = true;
        if (password.length<6) errorsForm.password = true;
        if (!email.length) errorsForm.email = true;
        if (password!==confirm) errorsForm.confirm = 'Confirm password does not match password';
        setFormErrors(errorsForm);
    },[firstName,lastName,username,password,confirm,email])

    useEffect(() => {
        const handleEnter = (e)=> {
            if (e.key==='Enter') {
                e.preventDefault();
            }
        }
        document.addEventListener("keypress",handleEnter);
        return () => document.removeEventListener("keypress", handleEnter);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        const newUser = {firstName,lastName,email,username,password};

        return dispatch(signUpUser(newUser))
        .then(closeModal)
        .then(history.push('/'))
        .catch(
            async (res) => {
                res = await res.json();
                if (res?.errors) setErrors(res.errors);
            }
        )
    };


    return (
        <div className="signUpForm">
        <form onSubmit={handleSubmit} className='form-signup'>
            <h2>Sign Up</h2>
            <h4>Already a member? <span><OpenModalButton
                    buttonText="Log In"
                    className='redirect-buttons'
                    modalComponent={<LoginFormModal />}
                    />
            </span></h4>
            <div className='userInput'>
            <label>First Name</label>
                <input
                    type='text'
                    value={firstName}
                    onChange={(e)=> setFirstName(e.target.value)}
                    required
                />

            <div className='errors'>{errors.firstName?.includes('Validation') ? 'Invalid Name' :errors?.firstName}</div>
            </div>

            <div className='userInput'>
            <label>Last Name</label>
                <input
                    type='text'
                    value={lastName}
                    onChange={(e)=> setLastName(e.target.value)}
                />

            <div className='errors'>{errors.lastName?.includes('Validation') ? 'Invalid Name' :errors?.lastName}</div>
            </div>

            <div className='userInput'>
            <label>Email</label>
                <input
                    type='text'
                    value={email}
                    onChange={(e)=> setEmail(e.target.value)}
                />
            <div className='errors'>{errors?.email}</div>
            </div>


            <div className='userInput'>
            <label>Username</label>
                <input
                    type='text'
                    value={username}
                    onChange={(e)=> setUsername(e.target.value)}
                />
            <div className='errors'>{errors?.username}</div>
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

            <div className='userInput'>
            <label>Confirm Password </label>
                <input
                    type='password'
                    value={confirm}
                    onChange={(e)=> setConfirm(e.target.value)}
                />
            <div className='errors'>{formError?.confirm}</div>
            </div>


            <button type="submit" disabled={disabled} className='submitButton'>Sign Up</button>
        </form>
        </div>
    )
};

export default SignUpFormModal;
