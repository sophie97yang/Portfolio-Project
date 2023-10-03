const router = require('express').Router();
const {Group,User,Venue,Membership} = require('../../db/models');
const {requireAuth } = require('../../utils/auth.js');
const {Op} = require('sequelize');

router.put('/:venueId',requireAuth,async (req,res,next)=> {
    const {id} = req.user;
    const {venueId} = req.params;
    const {address,city,state,lat,lng} = req.body;

    const venue = await Venue.findByPk(venueId);
    const currUserMembership = await Membership.findOne({
        where: {
            groupId:venue.groupId,
            memberId:id
        }
    });

    if (!venue) {
        const err = new Error("Venue couldn't be found");
        err.title = "Invalid Venue Id"
        err.status=404;
        return next(err);
    }

    if (currUserMembership.status!=='co-host') {
        const err = new Error(`User does not have authorization to edit venue info.
            User must be the organizer of the group or have a co-host membership status.`);
        err.title = "Permission not granted"
        err.status=403;
        return next(err);
    }

    if (address!==undefined) venue.address=address;
    if (city!==undefined) venue.city=city;
    if (state!== undefined) venue.state=state;
    if (lat !==undefined) venue.lat=lat;
    if (lng !==undefined) venue.lng=lng;

    await venue.save();

    res.json({
        id:venue.id,
        groupId:venue.groupId,
        city:venue.city,
        state:venue.state,
        lat:venue.lat,
        lng:venue.lng
    });

});


module.exports =router;
