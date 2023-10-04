const router = require('express').Router();
const {Group,GroupImage,User,Venue,Membership,Event,EventImage,Attendance} = require('../../db/models');
const {restoreUser,requireAuth } = require('../../utils/auth.js');
const {Op} = require('sequelize');
const membershipRouter = require('./memberships.js');

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

    const data = [];

    for (const group of groups) {

        const dataGroup={};
        const members = await group.getUsers( {
            through: {
                where: {
                    status: {
                        [Op.in]:['member','co-host']
                    }
                }
            }
        });

        dataGroup.id=group.id;
        dataGroup.organizerId=group.organizerId;
        dataGroup.name = group.name;
        dataGroup.type = group.type;
        dataGroup.city = group.city;
        dataGroup.createdAt = group.createdAt;
        dataGroup.updatedAt = group.updatedAt;
        dataGroup.numMembers = members.length;
        if (group.GroupImages.length===1) {
        dataGroup.previewImage = group.GroupImages[0].url;
        }
        data.push(dataGroup)
    };

    res.status(200).json({Groups: data});
});

router.get('/current', requireAuth, async (req,res,next)=> {
   const { id } = req.user;
   const currentUserGroups = await User.findByPk(id, {
    attributes:{
        exclude:['id','firstName','lastName','username']
    },
    include:{
        model: Group,
        through: {
            attributes:[],
            where: {
                status: {
                    [Op.in]:['co-host','member']
                }
            }
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

   const data = [];
   const groups = currentUserGroups.Groups;

    for (const group of groups) {
        const dataGroup = {};

        const members = await group.getUsers( {
            through: {
                where: {
                    status: {
                        [Op.in]:['member','co-host']
                    }
                }
            }
        });

        dataGroup.id=group.id;
        dataGroup.organizerId=group.organizerId;
        dataGroup.name = group.name;
        dataGroup.type = group.type;
        dataGroup.city = group.city;
        dataGroup.createdAt = group.createdAt;
        dataGroup.updatedAt = group.updatedAt;
        dataGroup.numMembers = members.length;
        dataGroup.previewImage = group.GroupImages[0].url;
        data.push(dataGroup)
    }

   res.json({Groups:data});


});

router.get('/:groupId', async (req,res,next)=> {
    const {groupId} = req.params;
    const group = await Group.findByPk(groupId, {
        include:[{
            model:GroupImage,
            attributes: {
                exclude:['createdAt','updatedAt','groupId']
            }
        }, {
          model:Venue,
          attributes:{
            exclude:['createdAt','updatedAt']
          }
        }]
    });

    if (!group) {
        const err = new Error("Group couldn't be found");
        err.title = "Invalid Group Id"
        err.status=404;
        return next(err);
    }

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

    const Organizer = await group.getUser({
        attributes:{
            exclude:['username']
        }
    });

    res.json({
        id:group.id,
        organizerId:group.organizerId,
        name:group.name,
        about:group.about,
        type:group.type,
        private:group.private,
        city:group.city,
        state:group.state,
        createdAt:group.createdAt,
        updatedAt:group.updatedAt,
        numMembers:members.length,
        GroupImages:group.GroupImages,
        Organizer,
        Venues:group.Venues
    });
   });

router.post('/',requireAuth, async (req,res,next)=> {
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

    await Membership.create({
        memberId:id,
        groupId:newGroup.id,
        status:'co-host'
    });

    res.status(201).json(newGroup);
   });

router.post('/:groupId/images',requireAuth, async (req,res,next)=>{
    const {id} = req.user;
    const {groupId} = req.params;
    const group = await Group.findByPk(groupId);
    const {url,preview} = req.body;
    if (!group) {
        const err = new Error("Group couldn't be found");
        err.title = "Invalid Group Id";
        err.status=404;
        return next(err);
    }

    if (group.organizerId!==id) {
        const err = new Error("User does not have authorization to add a photo. User must be the organizer of the group.");
        err.status=403;
        err.title = "Permission not granted"
        return next(err);
    }

    const newImage = await group.createGroupImage({
        url,
        preview
    });

    res.status(200).json({
        id:newImage.id,
        url:newImage.url,
        preview:newImage.preview
    });

   });

router.put('/:groupId', requireAuth, async (req,res,next)=> {
    const {groupId} = req.params;
    const {id} = req.user;
    const {name,about,type,private,city,state} = req.body;

    const group = await Group.findByPk(groupId);

    if (!group) {
        const err = new Error("Group couldn't be found");
        err.title = "Invalid Group Id"
        err.status=404;
        return next(err);
    }

    if (group.organizerId!==id) {
        const err = new Error("User does not have authorization to edit details of group. User must be the organizer of the group.");
        err.title = "Permission not granted"
        err.status=403;
        return next(err);
    }

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
        group.private = about;
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

router.delete('/:groupId',requireAuth, async (req,res,next)=> {
    const {groupId} = req.params;
    const {id} = req.user;

    const group = await Group.findByPk(groupId);

    if (!group) {
        const err = new Error("Group couldn't be found");
        err.title = "Invalid Group Id"
        err.status=404;
        return next(err);
    }

    if (group.organizerId!==id) {
        const err = new Error("User does not have authorization to delete group. User must be the organizer of the group.");
        err.title = "Permission not granted"
        err.status=403;
        return next(err);
    }

    await group.destroy();

    res.status(200).json({message:'Successfully deleted'})

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
