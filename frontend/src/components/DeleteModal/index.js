import { useDispatch } from "react-redux";
import { useModal } from "../../context/modal";
import { useHistory } from "react-router-dom";
import { deleteGroup } from "../../store/groups";
import { deleteEvent } from "../../store/events";
import './DeleteModal.css';


const DeleteModal  = ({id,deleteType,groupId}) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const {closeModal} = useModal();

    const handleDelete = async (e) => {
        if (deleteType==='Group') {
            e.preventDefault();
            const attemptedDelete = await dispatch(deleteGroup(id))
            .catch( async res => {
                const error = await res.json();
                return error;
            })
            if (!attemptedDelete.errors) {
                closeModal();
                history.push('/groups');
            }
        }

        if (deleteType==='Event') {
            e.preventDefault();
            const attemptedDelete = await dispatch(deleteEvent(id))
            .catch( async res => {
                const error = await res.json();
                return error;
            })
            if (!attemptedDelete.errors) {
                closeModal();
                history.push(`/groups/${groupId}`);
            }
        }
    }
    return (
        <div id='delete-modal'>
            <h2>Confirm Delete?</h2>
            <p>Are you sure you want to remove this {deleteType==='Group' ? 'group' : 'event'}?</p>
            <button onClick={handleDelete} className='submitButton' id='dm-button-yes'>Yes (Delete {deleteType})</button>
            <button onClick={closeModal} className='submitButton' id='dm-button-no'>No (Keep {deleteType})</button>
        </div>

    )

}

export default DeleteModal;
