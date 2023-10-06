const router = require('express').Router();
const {Group,GroupImage,User,Venue,Membership,Event,EventImage,Attendance} = require('../../db/models');
const {restoreUser,requireAuth } = require('../../utils/auth.js');
const {Op} = require('sequelize');
const membershipRouter = require('./memberships.js');
const {getGroupDetails,checkGroupExistence, validateGroupCreation,authorizeGroupOrganizer,validateGroupEdits} = require('../../utils/group_helper-functions');
const {authorizeCurrentUser,validateVenueCreation} = require('../../utils/venue_helper-functions');
const {getEventDetails,validateEventCreation} = require('../../utils/event_helper-functions');

router.get('/',async (req,res,next)=>{
    const groups = await Group.findAll({
        include:[{
            model: GroupImage,
            attributes:['url'],
            where: {
                preview:true
            },
            required:false
        }]
    });

    const groupList = await getGroupDetails(groups);

    res.json({Groups: groupList});
});

router.get('/current', requireAuth, async (req,res,next)=> {
   const { id } = req.user;
   const currentUserGroups = await User.findByPk(id, {
    attributes:{
        exclude:['id','firstName','lastName']
    },
    include:{
        model: Group,
        through: {
            attributes:[],
            where: {
                status: {
                    [Op.in]:['co-host','member']
                }
            },
        required:false
        },
        include: {
            model:GroupImage,
            attributes:['url'],
            where: {
                preview: true,
            },
            required:false
        }
    }
   });

    const groupList = await getGroupDetails(currentUserGroups.Groups);

    res.json({Groups: groupList});

});

router.get('/:groupId',checkGroupExistence, async (req,res,next)=> {
    const {groupId} = req.params;
    let group = await Group.findByPk(groupId, {
        include:[
        {
            model:GroupImage
        },
        {
          model:Venue
        },
        {
            model:User
        }
    ]
    });
    const members = await group.getUsers( {
        through: {
            attributes:['status'],
            where: {
                status: {
                    [Op.in]:['member','co-host']
                }
            }
        }
    });

    group = group.toJSON();

    group.numMembers = members.length;
    group.Organizer = group.User;
    delete group.User;


    res.json(group);
});

router.post('/',requireAuth,validateGroupCreation, async (req,res,next)=> {
    const {name,about,type,private,city,state} = req.body;
    const { id } = req.user;
    const newGroup = await Group.create({
        organizerId:id,
        name,
        about,
        type,
        private,
        city,
        state
    });

    //create membership where status is automatically set to co-host
    await Membership.create({
        memberId:id,
        groupId:newGroup.id,
        status:'co-host'
    });

    res.status(201).json(newGroup);
   });

router.post('/:groupId/images',requireAuth,checkGroupExistence,authorizeGroupOrganizer, async (req,res,next)=>{
    const group = req.group;
    const {url,preview} = req.body;

    if (preview===true) {
        const previewImages = await group.getGroupImages({
            where: {preview:true}
        });

        if (previewImages){
            for (let image of previewImages) {
                image.preview=false;
                await image.save();
            }
        }
    };

    let newImage = await group.createGroupImage({
        url,
        preview
    });

    newImage = newImage.toJSON();
    delete newImage.createdAt;
    delete newImage.updatedAt;
    delete newImage.groupId;

    res.json(newImage);

   });

router.put('/:groupId', requireAuth,checkGroupExistence, authorizeGroupOrganizer,validateGroupEdits, async (req,res,next)=> {
    const {name,about,type,private,city,state} = req.body;
    const group = req.group;

    if (name!==undefined) {
        group.name = name
    }
    if (about!==undefined) {
        group.about = about;
    }
    if (type!==undefined) {
        group.type = type;
    }
    if (private!==undefined) {
        group.private = private;
    }
    if (city!==undefined) {
        group.city = city;
    }
    if (state!==undefined) {
        group.state = state;
    }

    await group.save();
    res.status(200).json(group);


   });

router.delete('/:groupId',requireAuth, checkGroupExistence, authorizeGroupOrganizer, async (req,res,next)=> {
    const group = req.group;

    await group.destroy();

    res.json({message:'Successfully deleted'})

   });

//membership
router.get('/:groupId/members',restoreUser,checkGroupExistence, async (req,res,next)=> {
    const group = req.group;

    if (req.user) {
        const { id } = req.user;

        if (group.organizerId===id) {
            const members = await group.getUsers();
            return res.json(members);
        }
    }

    const members = await group.getUsers({
        attributes:['id','firstName','lastName'],
        through: {
            //not selecting just membership.status
            attributes:['status'],
            where: {
                status:{
                    [Op.in]:['member','co-host']
                }
            }
        }
    });

    return res.json(members);

});

router.use('/:groupId/membership',membershipRouter);


//venues
router.get('/:groupId/venues',requireAuth,checkGroupExistence,authorizeCurrentUser, async (req,res,next)=> {
    const {groupId} = req.params;

    const venues = await Venue.findAll({
        where: {groupId}
    });

    res.json({Venues: venues});
});

router.post('/:groupId/venues',requireAuth,checkGroupExistence,authorizeCurrentUser,validateVenueCreation,async (req,res,next)=> {
    const {address,city,state,lat,lng} = req.body;
    const group = req.group;

    let newVenue = await group.createVenue({address,city,state,lat,lng});
    newVenue = newVenue.toJSON();
    delete newVenue.createdAt;
    delete newVenue.updatedAt;

    res.json(newVenue);

});


//events
router.get('/:groupId/events',checkGroupExistence, async (req,res,next)=> {
    const group = req.group;
    const events = await group.getEvents({
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
        ]
    });
    const eventsList = await getEventDetails(events);

    res.json({Events:eventsList});

});

router.post('/:groupId/events', requireAuth, checkGroupExistence,authorizeCurrentUser, validateEventCreation,async (req,res,next) => {
    const {venueId,name,type,capacity,price,description,startDate,endDate} = req.body;
    const {id} = req.user;
    const group = req.group;

    let newEvent =  await group.createEvent({venueId,name,type,capacity,price,description,startDate,endDate});

    //organizer who made event should automatically be considered attending
    await Attendance.create({userId:id,eventId:newEvent.id,status:'attending'});

    newEvent = newEvent.toJSON();

    delete newEvent.createdAt;
    delete newEvent.updatedAt;

    res.json(newEvent);

});




module.exports =router;
