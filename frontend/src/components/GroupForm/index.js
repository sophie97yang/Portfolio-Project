import { useState} from 'react';
import { useDispatch,useSelector} from 'react-redux';
import { addGroupImage, createGroup, updateGroup } from '../../store/groups';
import { useHistory } from 'react-router-dom';

const GroupForm = ({formDetails,formType}) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const locationToEdit = formDetails.city ? `${formDetails.city} ,${formDetails.state}`: null;
    const [location,setLocation] = useState( locationToEdit||'');
    const [name,setName] = useState(formDetails.name || '');
    const [about, setAbout] = useState(formDetails.about || '');
    const [type,setType] = useState(formDetails.type || '');
    const [privacy,setPrivacy] = useState(formDetails.privacy===true || formDetails.privacy===false ? formDetails.privacy : '');
    const [imageUrl,setImageUrl] = useState('');
    const [validationErrors,setValidationErrors] = useState({});
    const sessionUser = useSelector(state => state.session.user);



    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = {};
        if (!name) errors.name='Name is required';
        if (name.length>60) errors.nameLength = 'Name must be less than 50 characters';
        if (!location) errors.location='Location is required';
        if (about.length<50) errors.about='Description must be at least 50 characters long';
        if (!type) errors.type='Group type is required';
        if (privacy==='') errors.privacy='Visibility preferences are required';

        if (formType==='Create Group') {
        const checkUrl = imageUrl.slice(imageUrl.length-6,imageUrl.length);
        if (!checkUrl.includes('.jpg') && !checkUrl.includes('.png') && !checkUrl.includes('.jpeg')) errors.imageUrl = 'Image URL must end in .png, .jpg, or .jpeg';
        }

        const indexOfSeparation = location.indexOf(',');
        if (indexOfSeparation===-1) errors.locationFormat = "Please enter location in a valid format (ex. San Diego,CA)"

        setValidationErrors(errors);

        if (!Object.keys(errors)[0] && formType==='Create Group') {
        const city = location.slice(0,indexOfSeparation).trim();
        const state = location.slice(indexOfSeparation+1,location.length).trim();
        const payload = {
            name,
            city,
            state,
            about,
            type,
            private:privacy,
           organizerId:sessionUser.id
        }
        const image = {
            url:imageUrl,
            preview:true
        };

        const newGroup = await dispatch(createGroup(payload))
        .catch(async res => {
            const data = await res.json();
            return data;
        });

        if (!newGroup.errors) {
        const newImage = await dispatch(addGroupImage(image,newGroup.id))
        .catch(async res => {
            const data = await res.json();
            return data
        });
            if (!newImage.errors) history.push(`/groups/${newGroup.id}`);
        } else {
            setValidationErrors(newGroup.errors);
            return;
            }
        }

        if (!Object.keys(errors)[0] && formType==='Update Group') {
            const city = location.slice(0,indexOfSeparation).trim();
            const state = location.slice(indexOfSeparation+1,location.length).trim();
            const payload = {
                name,
                city,
                state,
                about,
                type,
                private:privacy,
                organizerId:sessionUser.id
            }
            const updatedGroup = await dispatch(updateGroup(payload,formDetails.id))
            .catch(async res => {
                const data= await res.json();
                return data;
            });

            if (!updatedGroup.errors) history.push(`/groups/${formDetails.id}`);
            else setValidationErrors(updatedGroup.errors);
        }


    }
    return (
        <form onSubmit={handleSubmit}>
        {formType==='Create Group' ? <h3>START A NEW GROUP</h3> : <h3>UPDATE YOUR GROUP'S INFORMATION</h3>}
        {formType==='Create Group' ? <h2>We'll walk you through a few steps to build your local community</h2> : <h2>We'll walk you through a few steps to update your group's information</h2>}
        <div>
        <h2>First set your group's location.</h2>
        <p>MeetU groups meet locally,in person and online.
            We'll connect you with people in your area, and more can join you online</p>
        <input
            type='text'
            placeholder='City, STATE'
            value={location}
            onChange={e => setLocation(e.target.value)}
        />
        <div className='errors'>{validationErrors.location}</div>
        <div className='errors'>{validationErrors.locationFormat}</div>
        </div>

        <div>
        <h2>What will your group's name be?</h2>
        <p>Choose a name that will give people a clear idea of what the group is about.
            Feel free to get creative! {formType==='Create Group' ? <span>You can edit this later if you change your mind.</span> : <span></span>}
        </p>
        <input
            type='text'
            placeholder='What is your group name?'
            value={name}
            onChange={e => setName(e.target.value)}
        />
        <div className='errors'>{validationErrors.name}</div>
        </div>

        <div>
        <h2>Now describe what your group will be about</h2>
        <p>People will see this when we promote your group, but you will be able to add to it later, too.</p>
            <ol>
                <li>What is the purpose of the group?</li>
                <li>Who should join?</li>
                <li>What is the purpose of the group?</li>
            </ol>
        <input
            type='text'
            placeholder='Please write at least 50 characters'
            value={about}
            onChange={e => setAbout(e.target.value)}
        />
        <div className='errors'>{validationErrors.about}</div>
        </div>

        <div>
        <h2>Final steps...</h2>

        <label>Is this an in person or online group?
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

        <label>Is this group private or public?
        <select
            value={privacy}
            onChange={e => setPrivacy(e.target.value)}
        >
            <option value=''>(Select One)</option>
            <option value={true}>Private</option>
            <option value={false}>Public</option>
        </select>
        <div className='errors'>{validationErrors.privacy}</div>
        </label>

        <label>Please add an image url for your group below:
            <input
                type='text'
                placeholder='Image Url'
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
            />
            <div className='errors'>{validationErrors.imageUrl}</div>
        </label>
        </div>

        <button className='submitButton'> {formType} </button>
        </form>


    )
}

export default GroupForm;
