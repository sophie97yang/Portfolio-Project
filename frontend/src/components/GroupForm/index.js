import { useState} from 'react';
import { useDispatch,useSelector} from 'react-redux';
import { createGroup } from '../../store/groups';
import { useHistory } from 'react-router-dom';

const GroupForm = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const [location,setLocation] = useState('');
    const [name,setName] = useState('');
    const [about, setAbout] = useState('');
    const [type,setType] = useState('');
    const [privacy,setPrivacy] = useState('');
    const [imageUrl,setImageUrl] = useState('');
    const [validationErrors,setValidationErrors] = useState({});
    const sessionUser = useSelector(state => state.session.user);


    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = {};
        if (!name) errors.name='Name is required';
        if (!location) errors.location='Location is required';
        if (about.length<50) errors.about='Description must be at least 50 characters long';
        if (!type) errors.type='Group type is required';
        if (!privacy) errors.privacy='Visibility preferences are required';
        const checkUrl = imageUrl.slice(imageUrl.length-6,imageUrl.length);
        if (!checkUrl.includes('.jpg') && !checkUrl.includes('.png') && !checkUrl.includes('.jpeg')) errors.imageUrl = 'Image URL must end in .png, .jpg, or .jpeg';

        const indexOfSeparation = location.indexOf(',');
        if (indexOfSeparation===-1) errors.locationFormat = "Please enter location in a valid format (ex. San Diego,CA)"
        setValidationErrors(errors);

        const city = location.slice(0,indexOfSeparation);
        const state = location.slice(indexOfSeparation+1,location.length)
        const payload = {
            name,
            city,
            state,
            about,
            type,
            private:privacy,
           organizerId:sessionUser.id
        }
        console.log(payload);
        const newGroup = await dispatch(createGroup(payload));
        console.log(newGroup);
        history.push(`/groups/${newGroup.id}`);
    }
    return (
        <form onSubmit={handleSubmit}>
        <h3>START A NEW GROUP</h3>
        <h2>We'll walk you through a few steps to build you local community</h2>
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
        </div>

        <div>
        <h2>What will your group's name be?</h2>
        <p>Choose a name that will give people a clear idea of what the group is about.
            Feel free to get creative! You can edit this later if you change your mind.
        </p>
        <input
            type='text'
            placeholder='What is your group name?'
            value={name}
            onChange={e => setName(e.target.value)}
        />
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
        </label>

        <label>Please add an image url for your group below:
            <input
                type='text'
                placeholder='Image Url'
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
            />
        </label>
        </div>

        <button className='submitButton'> Create group </button>
        </form>


    )
}

export default GroupForm;
