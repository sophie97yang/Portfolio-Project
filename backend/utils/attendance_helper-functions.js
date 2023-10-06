const {Op} = require('sequelize');
const {Group,Venue,Membership,Event,User} = require('../db/models');
const { handleValidationErrors } = require('./validation.js');
const { check } = require('express-validator');
const {restoreUser} = require('./auth.js');

const validateAttendanceEdits = [
    check('userId')
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
        .withMessage('Cannot change attendance status to pending'),
        handleValidationErrors
  ];
  const validateAttendanceDeletion = [
    check('userId')
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

  module.exports = {validateAttendanceEdits,validateAttendanceDeletion};
