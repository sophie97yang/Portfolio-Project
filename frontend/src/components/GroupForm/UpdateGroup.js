import GroupForm from "./index";
import { useParams } from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import { fetchDetails } from "../../store/groups";
import { useEffect, useState } from "react";
import { Redirect } from "react-router-dom/cjs/react-router-dom.min";

const UpdateGroup = () => {
    const {id} = useParams();
    const group = useSelector(state => state.groups.group);
    const sessionUser = useSelector(state => state.session.user);
    const [redirect,setRedirect] = useState(false);
    const dispatch = useDispatch();

    useEffect(()=> {
        if (!sessionUser || sessionUser.id!==group.organizerId) setRedirect(true);
    },[sessionUser,group])

    useEffect(()=> {
        dispatch(fetchDetails(id))
        .catch(() => setRedirect(true))
    },[dispatch,id])



    if (redirect===true) return <Redirect to='/'/>

    if (!group) return null;


    const formDetails = {
        name:group.name,
        type:group.type,
        city:group.city,
        state:group.state,
        about:group.about,
        privacy:group.private,
        id
    }

    return (
        <>
        <GroupForm formDetails={formDetails} formType={'Update Group'}/>
        </>
    )
}

export default UpdateGroup;
