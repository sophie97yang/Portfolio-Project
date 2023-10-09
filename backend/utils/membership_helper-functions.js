const {Op} = require('sequelize');
const {Group,Venue,Membership,Event,User} = require('../db/models');
const { handleValidationErrors } = require('./validation.js');
const { check } = require('express-validator');
const {restoreUser} = require('./auth.js');

const authCurrUserMembership = [restoreUser, async (req,res,next)=> {
    const {id} = req.user;
    const {groupId} = req.params;
    const group = req.group;
    const {status} = req.body;
    console.log(status);

    const currUserMembership = await Membership.findOne({
        where: {
            groupId,
            memberId:id
        }
    });

    if (status==='member'){
    //user is automatically a co-host if they are the organizer of the group
        if (currUserMembership && currUserMembership.status==='co-host') {
            return next();
        } else {
            const err = new Error("Forbidden");
            err.status=403;
            err.title = "Permission not granted"
            return next(err);
        }
    }
    if (status === 'co-host') {
        if (req.user.id!==group.organizerId) {
            const err = new Error("Forbidden");
            err.status=403;
            err.title = "Permission not granted"
            return next(err);
        } else {
            return next();
        }
    }
}];

const validateMembershipEdits = [
    check('memberId')
        .exists({ checkFalsy: true })
        .custom (async value => {
            const user = await User.findByPk(value);
            if (!user) {
                throw new Error("User couldn't be found")
            }
            else {
                return true;
            }
    })
        .withMessage("User couldn't be found"),
    check('status')
        .exists({ checkFalsy: true })
        .custom (value => {
            if (value==='pending') {
                return false;
            }
            else {
                return true;
            }
        })
        .withMessage('Cannot change a membership status to pending'),
        handleValidationErrors
  ];

  const validateMembershipDeletion = [
    check('memberId')
        .exists({ checkFalsy: true })
        .custom (async value => {
            const user = await User.findByPk(value);
            if (!user) {
                throw new Error("User couldn't be found")
            }
            else {
                return true;
            }
    })
        .withMessage("User couldn't be found"),
        handleValidationErrors
  ];
module.exports = {authCurrUserMembership,validateMembershipEdits,validateMembershipDeletion}
