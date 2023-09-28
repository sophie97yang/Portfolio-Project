const router = require('express').Router();
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth.js');
const { User } = require('../../db/models');


router.use(restoreUser);

module.exports = router;
