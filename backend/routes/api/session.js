const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const validateLogin = [
    check('credential')
      .exists({ checkFalsy: true })
      .notEmpty()
      .withMessage('Please provide a valid email or username.'),
    check('password')
      .exists({ checkFalsy: true })
      .withMessage('Please provide a password.'),
    handleValidationErrors
  ];

const router = express.Router();

//log in
router.post('/', validateLogin, async (req,res,next) => {
    const { credential, password } = req.body;
    const user = await User.findOne({
        where: {
            [Op.or]: {
                username: credential,
                email:credential
            }
        },
        attributes: {
            include:['id','email','firstName','lastName','username','hashedPassword']
        }
        });

    if (user && bcrypt.compareSync(password,user.hashedPassword.toString())) {

        const safeUser = {
            id: user.id,
            firstName:user.firstName,
            lastName:user.lastName,
            email: user.email,
            username:user.username
        }

        await setTokenCookie(res,safeUser);

        return res.json({
            user: safeUser
        });
    } else {
        const error = new Error('Login failed');
        error.status = 401;
        error.title = 'Login failed';
        error.errors = {
            credential: 'The provided credentials were invalid.'
        }
        return next(error);
    }

});

///log out
router.delete('/', (req,res,next)=> {
    res.clearCookie('token');
    return res.json({message:'Success!'})
});

//get session
router.get('/', async (req,res,next) => {
    const { user } = req;
    //if user is not null, restore session of user
    if (user) {
        const username = await User.findByPk(user.id,{attributes:['username']});
        const safeUser = {
            id: user.id,
            firstName:user.firstName,
            lastName:user.lastName,
            email: user.email,
            username:username.username
        };
        return res.json({user:safeUser})
    } else {
        return res.json({user:null})
    }
})

module.exports = router;
