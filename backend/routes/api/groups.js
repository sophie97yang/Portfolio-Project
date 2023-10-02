const router = require('express').Router();
const {Group,GroupImage,User,Membership} = require('../../db/models');
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth.js');
const {Op} = require('sequelize');

router.get('/',async (req,res,next)=>{
    const groups = await Group.findAll({
        include:{
            model: GroupImage,
            attributes:['url']
        }
    });

    const data = [];

    for (const group of groups) {

        const dataGroup={};

        const members = await group.getUsers();

        dataGroup.id=group.id;
        dataGroup.organizerId=group.organizerId;
        dataGroup.name = group.name;
        dataGroup.type = group.type;
        dataGroup.city = group.city;
        dataGroup.createdAt = group.createdAt;
        dataGroup.updatedAt = group.updatedAt;
        dataGroup.numMembers = members.length;
        dataGroup.previewImage = group.GroupImages[0];
        data.push(dataGroup)
    };

    res.status(200).json({Groups:data});
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
            as: 'previewImage',
            attributes:['url'],
            where: {
                preview: true,
            },
            required:false
        }
    }
   });

   res.json(currentUserGroups);

})


module.exports =router;
