const {Op} = require('sequelize');
const {Group} = require('../db/models');
const { handleValidationErrors } = require('./validation.js');
const { check } = require('express-validator');
const {restoreUser} = require('./auth.js');

const getGroupDetails = async (groups) => {
    const groupList = [];
    const membersList = [];

    for (let group of groups) {
        groupList.push(group.toJSON());
        membersList.push(
        //NumMembers only count members that don't have a pending status
        await group.getUsers({
            through: {
                where: {
                    status: {
                        [Op.in]:['member','co-host']
                    }
                }
            }
        }))
    }

   for (let i=0;i<groupList.length;i++) {
    const group = groupList[i];
    const members = membersList[i];

    group.numMembers = members.length;

        if (group.GroupImages.length>=1) {
            let previewImage = group.GroupImages[0];
            group.previewImage = previewImage.url;
        } else {
            group.previewImage = 'Preview image is not available'
        }

        delete group.GroupImages;

    };

    return groupList;
}

const checkGroupExistence = async (req,res,next) => {
    const {groupId} = req.params;
    const group = await Group.findByPk(groupId);
    if (!group) {
        const err = new Error("Group couldn't be found");
        err.title = "Invalid Group Id"
        err.status=404;
        next(err);
    } else {
        req.group=group;
        next();
    }
};

const validateGroupCreation = [
    check('name')
      .exists({ checkFalsy: true })
      .isLength({max:60})
      .withMessage('Name must be 60 characters or less'),
    check('about')
      .exists({checkFalsy:true})
      .isLength({min:50})
      .withMessage('About must be 50 characters or more'),
      check('type')
      .exists({checkFalsy:true})
      .custom( value => {
        if (!(value==='Online'|| value==='In person')) return false;
        else return true;
      })
      .withMessage("Type must be 'Online' or 'In person'"),
    check('private')
      .exists({values:"null"})
      .isBoolean()
      .withMessage('Private must be a boolean'),
    check('city')
      .exists({ checkFalsy: true })
      .withMessage('City is required'),
    check('state')
      .exists({ checkFalsy: true })
      .withMessage('State is required'),
    handleValidationErrors
  ];

const validateGroupEdits = [
    check('name').optional({values:null})
        .isLength({max:60})
        .withMessage('Name must be 60 characters or less'),
    check('about').optional({values:null})
        .isLength({min:50})
        .withMessage('About must be 50 characters or more'),
    check('type').optional({values:null})
        .custom( value => {
            if (!(value==='Online'|| value==='In person')) return false;
            else return true;
        })
        .withMessage("Type must be 'Online' or 'In person'"),
    check('private').optional({values:null})
        .isBoolean()
        .withMessage('Private must be a boolean'),
    check('city')
      .optional({values:null})
      .isLength({min:1})
      .withMessage('City is required'),
    check('state')
      .optional({values:null})
      .isLength({min:1})
      .withMessage('State is required'),
        handleValidationErrors
  ];

const authorizeGroupOrganizer = [restoreUser, async (req,res,next)=> {
    const {groupId} = req.params;
    const group = await Group.findByPk(groupId,{attributes:['organizerId']});
    if (req.user.id!==group.organizerId) {
        const err = new Error("User does not have authorization to do this. User must be the organizer of the group.");
        err.status=403;
        err.title = "Permission not granted"
        return next(err);
    } else {
        return next();
    }
}];

module.exports = {getGroupDetails,checkGroupExistence,validateGroupCreation,authorizeGroupOrganizer,validateGroupEdits};
