const router = require('express').Router();
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth.js');
const {Event,Group,Membership,GroupImage,EventImage} = require('../../db/models');
const sessionRouter = require('./session.js');
const userRouter = require('./users.js');
const groupRouter = require('./groups.js');
const venueRouter = require('./venues.js');
const eventRouter = require('./events.js');
const { authorizeCurrentUser } = require('../../utils/venue_helper-functions.js');
const {checkGroupImageExistence,checkEventImageExistence} = require('../../utils/image_helper-functions.js')

router.use(restoreUser);

router.use('/session',sessionRouter);

router.use('/users',userRouter);

router.use('/groups',groupRouter);

router.use('/venues',venueRouter);

router.use('/events',eventRouter);

router.delete('/group-images/:gimageId', requireAuth,checkGroupImageExistence,authorizeCurrentUser,async (req,res,next) => {
  const image = req.groupImage;

  await image.destroy();

  res.json({message:"Successfully deleted"});

});

router.delete('/event-images/:eimageId', requireAuth,checkEventImageExistence,authorizeCurrentUser,async (req,res,next) => {
  const image = req.eventImage;


  await image.destroy();


  res.json({message:"Successfully deleted"});

})

module.exports = router;
