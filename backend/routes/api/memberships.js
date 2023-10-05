const router = require('express').Router({mergeParams:true});
const {Group,User,Membership} = require('../../db/models');
const {requireAuth } = require('../../utils/auth.js');
const {Op} = require('sequelize');


router.post('/', requireAuth, async (req,res,next)=> {
    const { groupId } = req.params;
    const { id } = req.user;

    const group = await Group.findByPk(groupId);
    const user = await User.findByPk(id);
    const membership = await Membership.findOne({
        where: {
            groupId,
            memberId:id
        }
    });

    if (!group) {
        const err = new Error("Group couldn't be found");
        err.title = "Invalid Group Id"
        err.status=404;
        return next(err);
    };

    if (membership) {

        if (membership.status === 'pending') {
            const err = new Error('Membership has already been requested');
            err.status = 400;
            err.title = 'Already existing Request';
            return next(err);
        } else {
            const err = new Error('User is already a member of the group');
            err.status = 400;
            err.title = 'Already existing Membership';
            return next(err);
        }
    }

    const added = await group.addUser(user);
    const newMember = added[0];

    res.json({
            memberId: newMember.memberId,
            status: newMember.status
    });
});

router.put('/',requireAuth, async(req,res,next)=> {

    const {groupId} = req.params;
    const {id} = req.user;
    const { memberId , status } = req.body;

    const group = await Group.findByPk(groupId);
    const user = await User.findByPk(memberId);
    const currUserMembership = await Membership.findOne({
        where: {
            groupId,
            memberId:id
        }
    });


    if (currUserMembership.status==='member' || currUserMembership.status==='pending' || !currUserMembership) {
        const err = new Error(`User does not have authorization to change membership status.
            User must be the organizer of the group or have a co-host membership status.`);
        err.title = "Permission not granted"
        err.status=403;
        return next(err);
    };

    if (!group) {
        const err = new Error("Group couldn't be found");
        err.title = "Invalid Group Id"
        err.status=404;
        return next(err);
    };

    if (!user) {
        const err = new Error("Validations Error");
        err.title = "Validations Error"
        err.status=400;
        err.errors = {
            memberId: "User couldn't be found"
        }
        return next(err);
    };

    if (memberId) {

        const membershipToChange = await Membership.findOne({
            where: {
                groupId,
                memberId
            }
        });

        if (!membershipToChange) {
            const err = new Error('Membership between the user and the group does not exist');
            err.title = "Membership doesn't exist";
            err.status = 404;
            return next(err);
        }

        if (status) {
                //what about changing a status from co-host to member? What authorization should you have - Organizer?
            if ((status === 'member' && membershipToChange.status==='pending') && (currUserMembership.status!=='co-host' || group.organizerId!==id)) {
                const err = new Error(`User does not have authorization to change membership status.
                    User must be the organizer of the group or have a co-host membership status.`);
                err.title = "Permission not granted"
                err.status=403;
                return next(err);
                    //do not necessarily understand how to produce a validation error here
            } else if ((status === 'co-host'|| (status === 'member' && membershipToChange.status==='co-host')) && group.organizerId!==id) {
                const err = new Error(`User does not have authorization to change membership status.
                    User must be the organizer of the group.`);
                err.title = "Permission not granted"
                err.status=403;
                return next(err);
            } else if (status==='pending') {
                const err = new Error("Validations Error");
                err.title = "Validations Error"
                err.status=400;
                err.errors = {
                    memberId: "Cannot change a membership status to pending"
                }
                return next(err);
            }

            membershipToChange.status = status;
            await membershipToChange.save();
            res.json(membershipToChange);
        }
    }

    });

router.delete('/',requireAuth,async (req,res,next)=> {
    const { groupId } = req.params;
    const { id } = req.user;
    const { memberId } = req.body;
    const group = await Group.findByPk(groupId);
    const user = await User.findByPk(memberId);

    if (memberId!==id && group.organizerId!==id) {
        const err = new Error(`User does not have authorization to delete members.
        User must be the organizer of the group or the member who is being deleted.`);
        err.title = "Permission not granted"
        err.status=403;
        return next(err);
    }

    if (!group) {
        const err = new Error("Group couldn't be found");
        err.title = "Invalid Group Id"
        err.status=404;
        return next(err);
    };

    if (!user) {
        const err = new Error("Validations Error");
        err.title = "Validations Error"
        err.status=400;
        err.errors = {
            memberId: "User couldn't be found"
        }
        return next(err);
    };

    const membership = await Membership.findOne({
        where: {
            groupId,
            memberId
        }
    });

    if (!membership) {
        const err = new Error('Membership between the user and the group does not exist');
        err.title = "Membership doesn't exist";
        err.status = 404;
        return next(err);
    }


    await membership.destroy();

    res.json({message: "Successfully deleted membership from group"});

});

module.exports = router;
