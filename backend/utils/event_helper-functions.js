const {Op} = require('sequelize');
const {Event,Venue,Membership,Attendance} = require('../db/models');
const { handleValidationErrors } = require('./validation.js');
const { check } = require('express-validator');
const {restoreUser} = require('./auth.js');

const getEventDetails = async (events) => {
    const eventList = [];

    events.forEach(event => eventList.push(event.toJSON()));

    for (let event of eventList) {
        const users = event.Users;
        const images = event.EventImages;
        if (images.length>=1) {
            let previewImage = images[0];
            event.previewImage = previewImage.url;
        } else {
            event.previewImage = 'Preview image is not available'
        }
        event.numAttending = users.length;
        delete event.Users;
        delete event.EventImages;
    }

    return eventList;
};

const checkEventExistence = async (req,res,next) => {
    const {eventId} = req.params;
    const event = await Event.findByPk(eventId);
    if (!event) {
        const err = new Error("Event couldn't be found");
        err.title = "Invalid Event Id"
        err.status=404;
        next(err);
    } else {
        req.event=event;
        next();
    }
};

const validateEventCreation = [
    check('venueId')
      .optional({values:null})
      .custom(async value => {
        const venueExistence = await Venue.findByPk(value);
        if (!venueExistence) {
            throw new Error('Venue does not exist')
        } else {
            return true
        }
    })
    .withMessage('Venue does not exist'),
    check('name')
      .exists({checkFalsy:true})
      .isLength({min:5})
      .withMessage('Name must be at least 5 characters'),
      check('type')
      .exists({checkFalsy:true})
      .custom( value => {
        if (!(value==='Online'|| value==='In person')) return false;
        else return true;
      })
      .withMessage("Type must be 'Online' or 'In person'"),
    check('capacity')
      .exists({values:"null"})
      .isInt()
      .withMessage('Capacity must be an integer'),
    check('description')
      .exists({ checkFalsy: true })
      .withMessage('Description is required'),
    handleValidationErrors
  ];

  const validateEventEdits = [
    check('venueId')
      .optional({values:null})
      .custom(async value => {
        const venueExistence = await Venue.findByPk(value);
        if (!venueExistence) {
            throw new Error('Venue does not exist')
        } else {
            return true
        }
    })
    .withMessage('Venue does not exist'),
    check('name').optional({values:null})
      .exists({checkFalsy:true})
      .isLength({min:5})
      .withMessage('Name must be at least 5 characters'),
      check('type')
      .exists({checkFalsy:true})
      .custom( value => {
        if (!(value==='Online'|| value==='In person')) return false;
        else return true;
      })
      .withMessage("Type must be 'Online' or 'In person'"),
    check('capacity').optional({values:null})
      .exists({values:"null"})
      .isInt()
      .withMessage('Capacity must be an integer'),
    check('description').optional({values:null})
      .exists({ checkFalsy: true })
      .withMessage('Description is required'),
    handleValidationErrors
  ];

  const authorizeCurrentUserAttendance = [restoreUser, async (req,res,next)=> {
    const {id} = req.user;
    let {eventId} = req.params;
    const event = req.event;

    const membership = await Membership.findOne({
        where: {
            memberId:id,
            groupId:event.groupId
        }
    });

    const attendance = await Attendance.findOne({
        where: {
            userId:id,
            eventId
        }
    });

    if ((membership && membership.status==='co-host') || (attendance && attendance.status==='attending')) {
        return next();
    }else {
        const err = new Error(`User does not have authorization to add an image to the event.
            User must have a co-host membership status or must be an attendee of the event.`);
        err.title = "Permission not granted"
        err.status=403;
        return next(err);
    }
    }];

    // let regex = new RegExp(/^([0-9]{4})-((01|02|03|04|05|06|07|08|09|10|11|12|(?:J(anuary|u(ne|ly))|February|Ma(rch|y)|A(pril|ugust)|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)|(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)|(September|October|November|December)|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)))|(january|february|march|april|may|june|july|august|september|october|november|december))-([0-3][0-9])\s([0-1][0-9]|[2][0-3]):([0-5][0-9]):([0-5][0-9])$/)

    const validateQueryParams = [
        check('page')
          .optional({values:null})
          .isInt({min:1})
        .withMessage('Page must be greater than or equal to 1'),
        check('size')
          .optional({values:null})
          .isInt({min:1})
        .withMessage('Size must be greater than or equal to 1'),
        check('name')
          .optional({values:null})
          .isString()
        .withMessage('Name must be a string'),
        check('type')
        .optional({values:null})
        .custom(value => {
            if (!(value==='"Online"'|| value==='"In person"')) {
                return false
            }
            else {
                return true
            }
          })
        .withMessage("Type must be 'Online' or 'In person'"),
        // check('startDate')
        // .optional({values:null})
        // // .isDate()
        // .matches(regex)
        // .withMessage("Start date must be a valid datetime"),
    handleValidationErrors
      ];
module.exports = {getEventDetails,checkEventExistence,validateEventCreation,authorizeCurrentUserAttendance,validateEventEdits,validateQueryParams}
