const router = require('express').Router();
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth.js');
const {Event,Group,Membership,GroupImage,EventImage} = require('../../db/models');
const sessionRouter = require('./session.js');
const userRouter = require('./users.js');
const groupRouter = require('./groups.js');
const venueRouter = require('./venues.js');
const eventRouter = require('./events.js');


router.use(restoreUser);

router.use('/session',sessionRouter);

router.use('/users',userRouter);

router.use('/groups',groupRouter);

router.use('/venues',venueRouter);

router.use('/events',eventRouter);

router.delete('/group-images/:imageId', requireAuth,async (req,res,next) => {
  const { imageId } = req.params;
  const { id } = req.user;
  const image = await GroupImage.findByPk(imageId, {
    include: {
      model:Group,
      attributes:['organizerId']
    }
  });

  if (!image) {
    const err = new Error("Group Image couldn't be found");
    err.title = "Invalid Image Id"
    err.status=404;
    return next(err);
  }

  const membership = await Membership.findOne({
    where: {
      groupId:image.groupId,
      memberId:id
    }
  });

  if (!membership || !(image.Group.organizerId===id || membership.status==='co-host')) {
    const err = new Error(`User does not have authorization to delete group image.
            User must be the organizer of the group or have a co-host membership status.`);
        err.title = "Permission not granted"
        err.status=403;
        return next(err);
  };

  await image.destroy();


  res.json({message:"Successfully deleted"});

});

router.delete('/event-images/:imageId', requireAuth,async (req,res,next) => {
  const { imageId } = req.params;
  const { id } = req.user;
  const image = await EventImage.findByPk(imageId, {
    include: {
      model:Event,
      attributes:['groupId']
    }
  });

  if (!image) {
    const err = new Error("Event Image couldn't be found");
    err.title = "Invalid Image Id"
    err.status=404;
    return next(err);
  }

  const membership = await Membership.findOne({
    where: {
      groupId:image.Event.groupId,
      memberId:id
    }
  });

  if (!membership || membership.status!=='co-host') {
    const err = new Error(`User does not have authorization to delete event image.
            User must be the organizer of the group or have a co-host membership status.`);
        err.title = "Permission not granted"
        err.status=403;
        return next(err);
  };

  await image.destroy();


  res.json({message:"Successfully deleted"});

})

module.exports = router;
