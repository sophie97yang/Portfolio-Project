const router = require('express').Router({mergeParams:true});
const {Event,Group,User,Membership,Attendance} = require('../../db/models');
const {restoreUser,requireAuth } = require('../../utils/auth.js');
const {Op} = require('sequelize');
const {checkEventExistence} = require('../../utils/event_helper-functions.js');
const {authorizeCurrentUser} = require('../../utils/venue_helper-functions.js');
const { validateAttendanceEdits,validateAttendanceDeletion} = require('../../utils/attendance_helper-functions');

router.post('/',requireAuth,checkEventExistence, async (req,res,next)=> {
    const {id} = req.user;
    const {eventId} = req.params;
    const event = req.event;
    const user = await User.findByPk(id);

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

router.put('/',requireAuth, checkEventExistence, authorizeCurrentUser,validateAttendanceEdits,async (req,res,next)=> {
    const { eventId } = req.params;
    const { userId, status } = req.body;


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


    attendanceToChange.status = status;
    await attendanceToChange.save();
    res.json({
        id:attendanceToChange.id,
        eventId:attendanceToChange.eventId,
        userId:attendanceToChange.userId,
        status:attendanceToChange.status
    });

});

router.delete('/', requireAuth,checkEventExistence,validateAttendanceDeletion, async (req,res,next)=> {
    const { eventId } = req.params;
    const { id } = req.user;
    const { userId } = req.body;
    const event = req.event;

    if (userId!==id && event.Group.organizerId!==id) {
        const err = new Error(`Only the User or organizer may delete an Attendance.`);
        err.title = "Permission not granted"
        err.status=403;
        return next(err);
    }

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

    res.json({message: "Successfully deleted attendance from event"});
});

module.exports = router;
