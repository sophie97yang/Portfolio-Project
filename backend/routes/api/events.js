const router = require('express').Router();
const {Event,Group,Venue,User, EventImage,Membership,Attendance} = require('../../db/models');
const {restoreUser,requireAuth } = require('../../utils/auth.js');
const {Op} = require('sequelize');
const attendanceRouter = require('./attendances.js');
const {getEventDetails,checkEventExistence,authorizeCurrentUserAttendance,validateEventEdits,validateQueryParams} = require('../../utils/event_helper-functions');
const {authorizeCurrentUser} = require('../../utils/venue_helper-functions');

router.get('/', validateQueryParams,async (req,res,next)=> {
    //adding query filters
    //limit: size
    //offset:(page-1)*size
    let {page,size,name,type,startDate} = req.query;
    const where = {};
    //pagination
    page = parseInt(page);
    size = parseInt(size);
    if (Number.isNaN(page) || page<=0) page = 1;
    if (page>10) page = 10
    if (Number.isNaN(size) || size<=0) size = 20;
    if (size>20) size=20

    const pagination = {
        limit:size,
        offset:(page-1)*size
    }

    //search filters
    if (name) {
        const length=name.length;
        name = name.slice(1,length-1);
        where.name = name;
    }
    if (type) {
        if (type==='"Online"') {
            where.type = 'Online';
        }
        if (type === '"In person') {
            where.type = 'In person';
        }

    }
    if (startDate) {
        const length=startDate.length;
        startDate = startDate.slice(1,length-1);
        let date = new Date(startDate);
        where.startDate = date;
    }

    const events = await Event.findAll({
        where,
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
                attributes:['status'],
                where: {
                    status:"attending"
                },
            required:false
            }
        },
        {
            model:EventImage,
            where: {
                preview:true
            },
            required:false
        }
    ],
    ...pagination
    });

    const eventsList = await getEventDetails(events);

    res.json({Events:eventsList});
});

router.get('/:eventId',checkEventExistence, async (req,res,next)=> {
    const {eventId} = req.params;
    let event = await Event.findByPk(eventId, {
        attributes: {
            include: ['capacity','price','description']
        },
        include: [
            {
                model:Group,
                attributes: ['id','name','city','state','private']
            },
            {
                model:Venue,
                attributes: {
                    exclude:['groupId','createdAt','updatedAt']
                }
            },
            {
                model:User,
                through: {
                    attributes:['status'],
                where: {
                    status:"attending"
                },
                required:false
                }
            },
            {
                model:EventImage
            }
    ]
    });

    event = event.toJSON();
    event.numAttending = event.Users.length;
    delete event.Users;


    res.json(event);
});

router.post('/:eventId/images',requireAuth, checkEventExistence,authorizeCurrentUserAttendance, async (req,res,next)=> {
    const {id} = req.user;
    const {eventId} = req.params;
    const {url,preview} = req.body;
    const event = req.event;

    //there can only be 1 image that has a preview of true
    if (preview===true) {
        const previewImages = await event.getEventImages({
            where: {preview:true}
        });

        if (previewImages){
            for (let image of previewImages) {
                image.preview=false;
                await image.save();
            }
        }
    };

    let newImage = await event.createEventImage({url,preview});
    newImage = newImage.toJSON();
    delete newImage.createdAt;
    delete newImage.updatedAt;
    delete newImage.eventId;

    res.json(newImage);
});

router.put('/:eventId', requireAuth,checkEventExistence,authorizeCurrentUser, validateEventEdits,async (req,res,next)=> {
    //is venue existence a 404 or 400 error?
    const {venueId,name,type,capacity,price,description,startDate,endDate} = req.body;
    const {eventId} = req.params;
    let event = req.event;
    if (venueId!==undefined) event.venueId = venueId;
    if (name!==undefined) event.name = name;
    if (type!==undefined) event.type = type;
    if (capacity!==undefined) event.capacity = capacity;
    if (price!==undefined) event.price = price;
    if (description!==undefined) event.description = description;
    if (startDate!==undefined) event.startDate = startDate;
    if (endDate!==undefined) event.endDate = endDate;

    await event.save();

    const newEvent = await Event.findByPk(eventId, {attributes: {
        include: ['capacity','price','description']
    }});

    res.json(newEvent);
});

router.delete('/:eventId', requireAuth,checkEventExistence,authorizeCurrentUser, async (req,res,next)=> {

    const event = req.event;

    await event.destroy();

    res.json({message:"Successfully deleted"});

});

//attendances
router.get('/:eventId/attendees',restoreUser,checkEventExistence, async (req,res,next)=> {
    const {id} = req.user;
    const event = req.event;

    const membership = await Membership.findOne({
        where: {
            memberId:id,
            groupId:event.groupId
        }
    });

    let attendances;

    if (membership && membership.status === "co-host") {
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
