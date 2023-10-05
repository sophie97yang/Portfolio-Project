const router = require('express').Router();
const {Group,User,Venue,Membership} = require('../../db/models');
const {requireAuth } = require('../../utils/auth.js');
const {Op} = require('sequelize');
const {authorizeCurrentUser,validateVenueCreation,checkVenueExistence,validateVenueEdits} = require('../../utils/venue_helper-functions');

router.put('/:venueId',requireAuth,checkVenueExistence,authorizeCurrentUser,validateVenueEdits,async (req,res,next)=> {
    const {address,city,state,lat,lng} = req.body;
    let venue = req.venue;

    if (address!==undefined) venue.address=address;
    if (city!==undefined) venue.city=city;
    if (state!== undefined) venue.state=state;
    if (lat !==undefined) venue.lat=lat;
    if (lng !==undefined) venue.lng=lng;

    await venue.save();

    venue = venue.toJSON();
    delete venue.updatedAt;

    res.json(venue);

});


module.exports =router;
