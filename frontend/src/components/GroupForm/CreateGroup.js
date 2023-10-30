import { useSelector } from "react-redux";
import { useEffect,useState } from "react";
import {Redirect} from 'react-router-dom';
import GroupForm from "./index";

const CreateGroup = ({isLoaded}) => {
    const sessionUser = useSelector(state=>state.session.user)
    const [redirect,setRedirect] = useState(false);

    useEffect(()=> {
        if (isLoaded && (!sessionUser)) setRedirect(true);
        else setRedirect(false);
    },[sessionUser,isLoaded])


    if (redirect===true) return <Redirect to='/'/>

    const formDetails = {};
    return (
        <>
        <GroupForm formDetails={formDetails} formType={'Create Group'}/>
        </>
    )
}

export default CreateGroup;
