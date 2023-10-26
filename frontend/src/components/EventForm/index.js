import { useEffect,useState } from "react";
import { useDispatch,useSelector } from "react-redux";
import {useHistory} from 'react-router-dom';
import { fetchDetails } from "../../store/groups";
import { createEvent } from "../../store/events";
import './EventForm.css';

const EventForm = ({formType, groupInfo}) => {
    const {id} = groupInfo;
    const dispatch = useDispatch();
    const history = useHistory();
    const group = useSelector(state => state.groups.group);
    const [name,setName] = useState('');
    const [type,setType] = useState('');
    const [price,setPrice] = useState(0);
    const [startDate,setStartDate] = useState('');
    const [capacity,setCapacity] = useState(0);
    const [endDate, setEndDate] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [description,setDescription] = useState('');
    const [validationErrors,setValidationErrors] = useState({});

    useEffect(()=>{
        dispatch(fetchDetails(id))
    },[dispatch,id]);

    if (!group) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = {};
        if (!name) errors.name='Name is required';
        if (description.length<30) errors.description='Description must be at least 30 characters long';
        if (!type) errors.type='Group type is required';
        if (parseInt(capacity)!==Number(capacity)) errors.capacity='Capacity must be an integer';
        if (capacity<=0) errors.capacityMin='Capacity must be greater than 0';
        if (!startDate) errors.startDate='Start Date is required';
        if (new Date(startDate) < new Date()) errors.startDateTime = 'Start Date must be in the future';
        if (!endDate) errors.endDate='End Date is required';
        if (new Date(endDate)< new Date(startDate)) errors.endDateTime = 'End Date must be later than the Start Date';        if (formType==='Create Event') {
        const checkUrl = imageUrl.slice(imageUrl.length-6,imageUrl.length);
        if (!checkUrl.includes('.jpg') && !checkUrl.includes('.png') && !checkUrl.includes('.jpeg')) errors.imageUrl = 'Image URL must end in .png, .jpg, or .jpeg';
        } // eslint-disable-next-line
        const urlRegEx = /^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g;
        if (!imageUrl.match(urlRegEx)) errors.url = 'Please enter a valid URL'

        setValidationErrors(errors);

        if (!Object.keys(errors)[0] && formType==='Create Event') {

        const payload = {
            name,
            type,
            capacity,
            price:Number(price),
            description,
            startDate:new Date(startDate),
            endDate:new Date(endDate)
        }
        const image = {
            url:imageUrl,
            preview:true
        };

        const newEvent = await dispatch(createEvent(payload,image,id))
        .catch(async res => {

            const data = await res.json();
            return data;
        });

        if (!newEvent.errors) history.push(`/events/${newEvent.id}`);
        else {
            setValidationErrors(newEvent.errors);
            return;
        }
        }
    }

    return (
        <form onSubmit={handleSubmit} id='event-form'>
            <div className='event-form-section'>
                <h2>Create an Event for <span> {group.name} </span></h2>
                <label>
                    What is the name of your event?
                    <input
                        type='text'
                        placeholder='Event Name'
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </label>
                <div className='errors'>{validationErrors.name}</div>
            </div>

            <div className='event-form-section'>
                <label>
                    Is this an in person or online event?
                    <select
                        value={type}
                        onChange={e => setType(e.target.value)}
                    >
                    <option value=''>(Select One)</option>
                    <option value='In person'>In person</option>
                    <option value='Online'>Online</option>
                    </select>
                <div className='errors'>{validationErrors.type}</div>
                </label>

                <label>
                    What is the price for your event?
                    <div id='ef-price'>
                    <i className="fa-light fa-dollar-sign"></i>
                    <input
                        type='number'
                        value={price}
                        min={0}
                        onChange={e => setPrice(e.target.value)}
                    />
                    </div>
                </label>

                <label>
                    What is the capacity for the event?
                    <input
                        type='number'
                        min={0}
                        value={capacity}
                        onChange={e => setCapacity(e.target.value)}
                    />
                    <div className='errors'>{validationErrors.capacityMin}</div>
                    <div className='errors'>{validationErrors.capacity}</div>
                </label>
            </div>

            <div className='event-form-section'>
                <label>
                    When does your event start?
                    <div className='ef-dates'>
                    <input
                        type='text'
                        placeholder='MM/DD/YYYY HH:mm AM'
                        value={startDate}
                        onChange={e=> setStartDate(e.target.value)}
                    />
                    <i className='fas fa-calendar fa-2x' />
                    </div>
                    <div className='errors'>{validationErrors.startDate}</div>
                    <div className='errors'>{validationErrors.startDateTime}</div>
                </label>

                <label>
                    When does your event end?
                    <div className='ef-dates'>
                    <input
                        type='text'
                        placeholder='MM/DD/YYYY HH:mm PM'
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                    />
                    <i className='fas fa-calendar fa-2x' />
                    </div>
                    <div className='errors'>{validationErrors.endDate}</div>
                    <div className='errors'>{validationErrors.endDateTime}</div>
                </label>
             </div>

             <div className='event-form-section'>
                <label>
                    Please add in an image URL for your event below:
                    <input
                        type='text'
                        placeholder='Image URL'
                        value={imageUrl}
                        onChange={e=> setImageUrl(e.target.value)}
                        />
                     <div className='errors'>{validationErrors.imageUrl}</div>
                     <div className='errors'>{validationErrors.url ? 'Please enter a valid URL' :''}</div>
                </label>
            </div>

            <div className='event-form-section'>
                <label>
                    Please describe your event:
                    <textarea
                        placeholder='Please include at least 30 characters'
                        value={description}
                        onChange={e=> setDescription(e.target.value)}
                        />
                     <div className='errors'>{validationErrors.description}</div>
                </label>

                <button className='submitButton'>{formType}</button>
            </div>

        </form>
    )
}

export default EventForm;
