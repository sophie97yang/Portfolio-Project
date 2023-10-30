import { useParams } from "react-router-dom";
import EventForm from "."

const CreateEvent = ({isLoaded}) => {
    const {id} = useParams();
    const groupInfo = {id};
    return (
        <EventForm formType='Create Event' groupInfo={groupInfo} isLoaded={isLoaded}/>
    )
}

export default CreateEvent;
