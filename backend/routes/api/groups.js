const router = require('express').Router();
const {Group,GroupImage,User,Venue,Membership} = require('../../db/models');
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth.js');
const {Op,literal} = require('sequelize');

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
        const err = new Error("User does not have authorization to edit details of group. User must be the organizer of the event.");
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
        const err = new Error("User does not have authorization to delete event. User must be the organizer of the event.");
        err.title = "Permission not granted"
        err.status=403;
        return next(err);
    }

    await group.destroy();

    res.status(200).json({message:'Successfully deleted'})

   });

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

    router.post('/:groupId/membership', requireAuth, async (req,res,next)=> {
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

    router.put('/:groupId/membership',requireAuth, async(req,res,next)=> {

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

        if (currUserMembership.status==='member' || currUserMembership.status==='pending' || !currUserMembership) {
            const err = new Error(`User does not have authorization to change membership status.
                     User must be the organizer of the group or have a co-host membership status.`);
                    err.title = "Permission not granted"
                    err.status=403;
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

    router.delete('/:groupId/membership',requireAuth,async (req,res,next)=> {
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










module.exports =router;
