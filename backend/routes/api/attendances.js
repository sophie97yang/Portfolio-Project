const router = require('express').Router({mergeParams:true});
const {Event,Group,Venue,User, EventImage,Membership,Attendance} = require('../../db/models');
const {restoreUser,requireAuth } = require('../../utils/auth.js');
const {Op} = require('sequelize');

router.post('/',requireAuth, async (req,res,next)=> {
    const {id} = req.user;
    const {eventId} = req.params;
    const event = await Event.findByPk(eventId, {
        attributes:['groupId','id']
    });
    const user = await User.findByPk(id);

    if (!event) {
        const err = new Error("Event couldn't be found");
        err.title = "Invalid Event Id"
        err.status=404;
        return next(err);
    }
    const membership = await Membership.findOne({
        where: {
            groupId:event.groupId,
            memberId:id
        }
    });

    if (!membership || membership.status==='pending') {
        const err = new Error(`User does not have authorization to request attendance for the event.
        User must be a member of the group.`);
        err.title = "Permission not granted"
        err.status=403;
        return next(err);
    }

    const attendance = await Attendance.findOne({
        where: {
            eventId,
            userId:id
        },
        attributes:['status']
    });

    if (attendance) {
        if (attendance.status === 'pending') {
            const err = new Error('Attendance has already been requested');
            err.status = 400;
            err.title = 'Already existing Request';
            return next(err);
        } else {
            const err = new Error('User is already an attendee of the event');
            err.status = 400;
            err.title = 'Already existing Attendance';
            return next(err);
        }
    }

    const added = await event.addUser(user);
    const newMember = added[0];
    res.json(newMember);

});

router.put('/',requireAuth, async (req,res,next)=> {
    const { eventId } = req.params;
    const { id } = req.user;
    const { userId, status } = req.body;

    const event = await Event.findByPk(eventId, {attributes:['groupId','id']});
    const user = await User.findByPk(userId);

    const currUserMembership = await Membership.findOne({
        where: {
            groupId:event.groupId,
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

    if (!event) {
        const err = new Error("Event couldn't be found");
        err.title = "Invalid Event Id"
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

    const attendanceToChange = await Attendance.findOne({
        where: {
            eventId,
            userId
        }
    });

    if (!attendanceToChange) {
        const err = new Error("Attendance between the user and the event does not exist");
        err.title = "Attendance doesn't exist";
        err.status = 404;
        return next(err);
    }

    if (status) {

        if (status==='pending') {
            const err = new Error("Validations Error");
            err.title = "Validations Error"
            err.status=400;
            err.errors = {
                memberId: "Cannot change an attendance status to pending"
            }
            return next(err);
        }

        attendanceToChange.status = status;
        await attendanceToChange.save();
        res.json(attendanceToChange);
    }

});

router.delete('/', requireAuth, async (req,res,next)=> {
    const { eventId } = req.params;
    const { id } = req.user;
    const { userId } = req.body;
    const event = await Event.findByPk(eventId, {
        include: {
            model:Group,
            attributes:['organizerId']
        }
    });
    const user = await User.findByPk(userId);

    if (!event) {
        const err = new Error("Event couldn't be found");
        err.title = "Invalid Event Id"
        err.status=404;
        return next(err);
    };

    if (userId!==id && event.Group.organizerId!==id) {
        const err = new Error(`Only the User or organizer may delete an Attendance.`);
        err.title = "Permission not granted"
        err.status=403;
        return next(err);
    }

    if (!user) {
        const err = new Error("Validations Error");
        err.title = "Validations Error"
        err.status=400;
        err.errors = {
            memberId: "User couldn't be found"
        }
        return next(err);
    };

    const attendance = await Attendance.findOne({
        where: {
            eventId,
            userId
        }
    });

    if (!attendance) {
        const err = new Error('Attendance between the user and the event does not exist');
        err.title = "Attendance doesn't exist";
        err.status = 404;
        return next(err);
    }


    await attendance.destroy();

    res.json({message: "Successfully deleted attendance from group"});
});

module.exports = router;
