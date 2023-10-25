import GroupForm from "./index";

const CreateGroup = () => {
    const formDetails = {};
    return (
        <>
        <GroupForm formDetails={formDetails} formType={'Create Group'}/>
        </>
    )
}

export default CreateGroup;
