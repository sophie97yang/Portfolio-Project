const {Op} = require('sequelize');
const {Group,Venue,Membership,Event,GroupImage,EventImage} = require('../db/models');
const { handleValidationErrors } = require('./validation.js');
const { check } = require('express-validator');
const {restoreUser} = require('./auth.js');

const checkVenueExistence = async (req,res,next) => {
    const {venueId} = req.params;
    const venue = await Venue.findByPk(venueId);
    if (!venue) {
        const err = new Error("Venue couldn't be found");
        err.title = "Invalid Venue Id"
        err.status=404;
        next(err);
    } else {
        req.venue=venue;
        next();
    }
};

const authorizeCurrentUser = [restoreUser, async (req,res,next)=> {
    const {id} = req.user;
    let {groupId,venueId,eventId,gimageId,eimageId} = req.params;

    if (venueId) {
        const venue = await Venue.findByPk(venueId,{attributes:['groupId']});
        groupId = venue.groupId
    }
    if (eventId) {
      const event = await Event.findByPk(eventId,{attributes:['groupId']});
      groupId = event.groupId
    }
    if (gimageId) {
      const image = await GroupImage.findByPk(gimageId, {
        attributes:['groupId']
      });
      groupId = image.groupId;
    }
    if (eimageId) {
      const image = await EventImage.findByPk(eimageId, {include: {
        model:Event,
        attributes:['groupId']
      }});
      groupId = image.Event.groupId;
    }

    const currUserMembership = await Membership.findOne({
        where: {
            groupId,
            memberId:id
        }
    });

    //user is automatically a co-host if they are the organizer of the group
    if (currUserMembership && currUserMembership.status==='co-host') {
        return next();
    } else {
        const err = new Error("User does not have authorization to do this. User must be the organizer of the group or have a co-host membership status.");
        err.status=403;
        err.title = "Permission not granted"
        return next(err);
    }
}];

const validateVenueCreation = [
    check('address')
      .exists({ checkFalsy: true })
      .withMessage('Street address is required'),
    check('city')
      .exists({checkFalsy:true})
      .withMessage('City is required'),
      check('state')
      .exists({checkFalsy:true})
      .withMessage("State is required"),
    check('lat')
      .exists({values:"null"})
      .custom( value => {
        if (value>90 || value<-90) return false;
        else return true;
      })
      .withMessage('Latitude is not valid'),
      check('lng')
      .exists({values:"null"})
      .custom( value => {
        if (value>180 || value<-180) return false;
        else return true;
      })
      .withMessage('Longitude is not valid'),
    handleValidationErrors
  ];

  const validateVenueEdits = [
    check('address').optional({values:null})
      .exists({ checkFalsy: true })
      .withMessage('Street address is required'),
    check('city').optional({values:null})
      .exists({checkFalsy:true})
      .withMessage('City is required'),
      check('state').optional({values:null})
      .exists({checkFalsy:true})
      .withMessage("State is required"),
    check('lat').optional({values:null})
      .exists({values:"null"})
      .custom( value => {
        if (value>90 || value<-90) return false;
        else return true;
      })
      .withMessage('Latitude is not valid'),
      check('lng').optional({values:null})
      .exists({values:"null"})
      .custom( value => {
        if (value>180 || value<-180) return false;
        else return true;
      })
      .withMessage('Longitude is not valid'),
    handleValidationErrors
  ];

module.exports = {authorizeCurrentUser,validateVenueCreation,checkVenueExistence,validateVenueEdits}
