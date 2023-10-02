const router = require('express').Router();
const {Group,GroupImage,User,Venue,Membership} = require('../../db/models');
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth.js');
const {Op} = require('sequelize');

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

//    router.post('/:groupId/images',requireAuth, (req,res,next)=>{

//    })







module.exports =router;
