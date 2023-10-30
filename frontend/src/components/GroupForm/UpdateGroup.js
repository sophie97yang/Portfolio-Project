import GroupForm from "./index";
import { useParams } from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import { fetchDetails } from "../../store/groups";
import { useEffect, useState } from "react";
import { Redirect } from "react-router-dom/cjs/react-router-dom.min";

const UpdateGroup = ({isLoaded}) => {
    const {id} = useParams();
    const group = useSelector(state => state.groups.group);
    const sessionUser = useSelector(state => state.session.user);
    const [redirect,setRedirect] = useState(false);
    const [timeToRedirect,setTime] = useState(false);
    const dispatch = useDispatch();

    useEffect(()=> {
        const groupDetails = async () => {
           await dispatch(fetchDetails(id));
        }

      groupDetails()
      .then(()=>setTime(isLoaded&&true))
      .catch(() => setRedirect(true));


    },[dispatch,id,isLoaded])

    useEffect(()=> {
        if (timeToRedirect && (!sessionUser || sessionUser.id!==group?.organizerId)) setRedirect(true);
        else setRedirect(false);
    },[sessionUser,group,timeToRedirect])


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
