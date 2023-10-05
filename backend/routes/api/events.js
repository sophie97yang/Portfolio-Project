const router = require('express').Router();
const {Event,Group,Venue,User, EventImage,Membership,Attendance} = require('../../db/models');
const {restoreUser,requireAuth } = require('../../utils/auth.js');
const {Op} = require('sequelize');
const attendanceRouter = require('./attendances.js');

router.get('/', async (req,res,next)=> {

    const events = await Event.findAll({
        include:[
        {
            model:Group,
            attributes: ['id','name','city','state']
        },
        {
            model:Venue,
            attributes: ['id','city','state']
        },
        {
            model:User,
            through: {
                attributes:['status']
            }
        },
        {
            model:EventImage
        }
    ]
    });

    const eventsList = [];

    events.forEach(event => eventsList.push(event.toJSON()));

    for (let event of eventsList) {
        const users = event.Users;
        const images = event.EventImages;
        const attending = users.filter((user)=> {
            return user.Attendance.status === 'attending'
        });
        const image = images.filter((image)=> {
            return image.preview === true
        });
        event.previewImage = image[0].url;
        event.numAttending = attending.length;
        delete event.Users;
        delete event.EventImages;
    }

    res.json(eventsList);
});

router.get('/:eventId', async (req,res,next)=> {
    const {eventId} = req.params;
    let event = await Event.findByPk(eventId, {
        attributes: {
            include: ['capacity','price']
        },
        include: [
            {
                model:Group,
                attributes: ['id','name','city','state','private']
            },
            {
                model:Venue,
                attributes: ['id','city','state','lat','lng']
            },
            {
                model:User,
                through: {
                    attributes:['status']
                }
            },
            {
                model:EventImage,
                attributes: ['id','url','preview']
            }
    ]
    });

    if (!event) {
        const err = new Error("Event couldn't be found");
        err.title = "Invalid Event Id"
        err.status=404;
        return next(err);
    }

    event = event.toJSON();

    const users = event.Users;
    const images = event.EventImages;
    const attending = users.filter((user)=> {
            return user.Attendance.status === 'attending'
    });
    event.numAttending = attending.length;
    delete event.Users;


    res.json(event);
});

router.post('/:eventId/images',requireAuth, async (req,res,next)=> {
    const {id} = req.user;
    const {eventId} = req.params;
    const {url,preview} = req.body;
    const event = await Event.findByPk(eventId, {
        attributes:["id",'groupId']
    });

    if (!event) {
        const err = new Error("Event couldn't be found");
        err.title = "Invalid Event Id"
        err.status=404;
        return next(err);
    };

    const membership = await Membership.findOne({
        where: {
            memberId:id,
            groupId:event.groupId
        }
    });

    const attendance = await Attendance.findOne({
        where: {
            userId:id,
            eventId
        }
    });

    if (!membership || !attendance || (membership.status!== 'co-host' && attendance.status!=="attending")) {
        const err = new Error(`User does not have authorization to add an image to the event.
            User must have a co-host membership status or must be an attendee of the event.`);
        err.title = "Permission not granted"
        err.status=403;
        return next(err);
    };

    let newImage = await event.createEventImage({url,preview});
    newImage = newImage.toJSON();
    delete newImage.createdAt;
    delete newImage.updatedAt;

    res.json(newImage);
});

router.put('/:eventId', requireAuth, async (req,res,next)=> {
    const {eventId} = req.params;
    const {id} = req.user;
    const {venueId,name,type,capacity,price,description,startDate,endDate} = req.body;
    const event = await Event.findByPk(eventId);
    if (!event) {
        const err = new Error("Event couldn't be found");
        err.title = "Invalid Event Id"
        err.status=404;
        return next(err);
    };

    const membership = await Membership.findOne({
        where: {
            memberId:id,
            groupId:event.groupId
        }
    });

    if (!membership || membership.status!== 'co-host') {
        const err = new Error(`User does not have authorization to edit the details of the event.
            User must have a co-host membership status or must be the organizer of the group.`);
        err.title = "Permission not granted"
        err.status=403;
        return next(err);
    };

    if (venueId!==undefined) {
        const venue = await Venue.findByPk(venueId);
        if (!venue) {
            const err = new Error("Venue couldn't be found");
            err.title = "Invalid Venue Id"
            err.status=404;
            return next(err);
        }
        event.venueId = venueId;
    };
    if (name!==undefined) event.name = name;
    if (type!==undefined) event.type = type;
    if (capacity!==undefined) event.capacity = capacity;
    if (price!==undefined) event.price = price;
    if (description!==undefined) event.description = name;
    if (startDate!==undefined) event.startDate = startDate;
    if (endDate!==undefined) event.endDate = endDate;

    await event.save();

    res.json(event);
});

router.delete('/:eventId', requireAuth, async (req,res,next)=> {
    const {eventId} = req.params;
    const {id} = req.user;

    const event = await Event.findByPk(eventId);

    if (!event) {
        const err = new Error("Event couldn't be found");
        err.title = "Invalid Event Id"
        err.status=404;
        return next(err);
    }
    const membership = await Membership.findOne({
        where: {
            memberId:id,
            groupId:event.groupId
        }
    });

    if (!membership || membership.status !== 'co-host') {
        const err = new Error(`User does not have authorization to delete the event.
            User must have a co-host membership status or must be the organizer of the group.`);
        err.title = "Permission not granted"
        err.status=403;
        return next(err);
    }

    await event.destroy();

    res.json({message:"Successfully deleted"});

});

//attendances
router.get('/:eventId/attendees',restoreUser, async (req,res,next)=> {
    const {eventId} = req.params;
    const {id} = req.user;
    const event = await Event.findByPk(eventId);

    if (!event) {
        const err = new Error("Event couldn't be found");
        err.title = "Invalid Event Id"
        err.status=404;
        return next(err);
    }
    const membership = await Membership.findOne({
        where: {
            memberId:id,
            groupId:event.groupId
        }
    });

    let attendances;

    if (membership.status === "co-host") {
        attendances = await event.getUsers();

    } else {
        attendances = await event.getUsers({
            through: {
                where: {
                    status:['attending','waitlist']
                }
            }
        })

    }
    const attendanceList = [];

    attendances.forEach(attendee=> attendanceList.push(attendee.toJSON()));

    for (let attendance of attendanceList) {
        delete attendance.Attendance.userId;
        delete attendance.Attendance.eventId;
        delete attendance.Attendance.createdAt;
        delete attendance.Attendance.updatedAt;
    }

    res.json({Attendees:attendanceList});

});

router.use('/:eventId/attendance',attendanceRouter)

module.exports = router;
