const router = require('express').Router();
const {Group,GroupImage,User,Venue,Membership,Event,EventImage,Attendance} = require('../../db/models');
const {restoreUser,requireAuth } = require('../../utils/auth.js');
const {Op} = require('sequelize');
const membershipRouter = require('./memberships.js');
const {getGroupDetails,checkGroupExistence, validateGroupCreation,authorizeGroupOrganizer,validateGroupEdits} = require('../../utils/group_helper-functions');

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
router.get('/:groupId/members',restoreUser, async (req,res,next)=> {


    const { groupId } = req.params;

    const group = await Group.findByPk(groupId);

    if (!group) {
        const err = new Error("Group couldn't be found");
        err.title = "Invalid Group Id"
        err.status=404;
        return next(err);
    }


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
router.get('/:groupId/venues',requireAuth,async (req,res,next)=> {
    const {id} = req.user;
    const {groupId} = req.params;
    const group = await Group.findByPk(groupId);
    const currUserMembership = await Membership.findOne({
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
    }

    if (currUserMembership.status!=='co-host' || group.organizerId!==id) {
        const err = new Error(`User does not have authorization to view venues.
            User must be the organizer of the group or have a co-host membership status.`);
        err.title = "Permission not granted"
        err.status=403;
        return next(err);
    }

    const venues = await Venue.findAll({
        where: {groupId}
    });

    res.json({Venues: venues});
});

router.post('/:groupId/venues',requireAuth,async (req,res,next)=> {
    const {id} = req.user;
    const {groupId} = req.params;
    const {address,city,state,lat,lng} = req.body;

    const group = await Group.findByPk(groupId);
    const currUserMembership = await Membership.findOne({
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
    }

    if (currUserMembership.status!=='co-host' || group.organizerId!==id) {
        const err = new Error(`User does not have authorization to view venues.
            User must be the organizer of the group or have a co-host membership status.`);
        err.title = "Permission not granted"
        err.status=403;
        return next(err);
    }

    const newVenue = await group.createVenue({address,city,state,lat,lng});
    res.json({
        id:newVenue.id,
        groupId:newVenue.groupId,
        city:newVenue.city,
        state:newVenue.state,
        lat:newVenue.lat,
        lng:newVenue.lng
    });

});


//events

router.get('/:groupId/events', async (req,res,next)=> {
    const {groupId} = req.params;

    const group = await Group.findByPk(groupId, {
        attributes:[],
        include: {
            model:Event,
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
        }
    });

    if (!group) {
        const err = new Error("Group couldn't be found");
        err.title = "Invalid Group Id"
        err.status=404;
        return next(err);
    }

    const groupEvents = group.Events;

    const GroupEventsList = [];

    groupEvents.forEach(event => GroupEventsList.push(event.toJSON()));

    for (let event of GroupEventsList) {
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


    res.json(GroupEventsList);
});

router.post('/:groupId/events', requireAuth,async (req,res,next) => {
    const { id } = req.user;
    const { groupId } = req.params;
    const {venueId,name,type,capacity,price,description,startDate,endDate} = req.body;
    const group = await Group.findByPk(groupId);
    const membership = await Membership.findOne({
        where: {
            groupId,
            memberId:id
        }
    });
    const venue = await Venue.findByPk(venueId);

    if (!group) {
        const err = new Error("Group couldn't be found");
        err.title = "Invalid Group Id"
        err.status=404;
        return next(err);
    }

    if (id!==group.organizerId || membership.status!=='co-host') {
        const err = new Error(`User does not have authorization to create an event.
            User must be the organizer of the group or have a co-host membership status.`);
        err.title = "Permission not granted"
        err.status=403;
        return next(err);
    };

    if (venueId) {
    const venue = await Venue.findByPk(venueId);
        if (!venue) {
            const err = new Error("Validations Error");
            err.title = "Validations Error"
            err.status=400;
            err.errors = {
                venueId: "Venue doesn't exist"
            }
        return next(err);
        }
    }

    let newEvent =  await group.createEvent({venueId,name,type,capacity,price,description,startDate,endDate});

    //organizer who made event should automatically be considered attending?
    await Attendance.create({userId:id,eventId:newEvent.id,status:'attending'});

    newEvent = newEvent.toJSON();

    delete newEvent.createdAt;
    delete newEvent.updatedAt;

    res.json(newEvent);

});




module.exports =router;
