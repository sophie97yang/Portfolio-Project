import { useParams } from "react-router-dom";
import EventForm from "."

const CreateEvent = () => {
    const {id} = useParams();
    const groupInfo = {id};
    return (
        <EventForm formType='Create Event' groupInfo={groupInfo}/>
    )
}

export default CreateEvent;
