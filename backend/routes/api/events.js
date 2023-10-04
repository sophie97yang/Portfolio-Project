const router = require('express').Router();
const {Event,Group,Venue,User, EventImage} = require('../../db/models');
const {restoreUser,requireAuth } = require('../../utils/auth.js');
const {Op} = require('sequelize');

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
})


module.exports = router;
