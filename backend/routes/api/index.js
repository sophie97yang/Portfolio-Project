const router = require('express').Router();
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth.js');
const { User } = require('../../db/models');
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

router.get('/group-images/:imageId', requireAuth,async (req,res,next) => {

})

module.exports = router;
