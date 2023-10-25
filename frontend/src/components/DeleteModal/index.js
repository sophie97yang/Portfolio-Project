import { useDispatch } from "react-redux";
import { useModal } from "../../context/modal";
import { useHistory } from "react-router-dom";
import { deleteGroup } from "../../store/groups";


const DeleteModal  = ({groupId}) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const {closeModal} = useModal();

    const handleDelete = async (e) => {
        e.preventDefault();
       const attemptedDelete = await dispatch(deleteGroup(groupId))
        .catch( async res => {
            const error = await res.json();
            return error;
        })
        if (!attemptedDelete.errors) {
            closeModal();
            history.push('/groups');
        }
    }
    return (
        <div>
            <h2>Confirm Delete?</h2>
            <p>Are you sure you want to remove this group?</p>
            <button onClick={handleDelete}>Yes (Delete Group)</button>
            <button onClick={closeModal}>No (Keep Group)</button>
        </div>

    )

}

export default DeleteModal;
