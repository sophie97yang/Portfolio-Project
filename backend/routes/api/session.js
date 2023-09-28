const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

//log in
router.post('/', async (req,res,next) => {
    const { credential, password } = req.body;
    const user = await User.findOne({
        where: {
            [Op.or]: {
                username: credential,
                email:credential
            }
        },
        attributes: {
            include:['id','email','username','hashedPassword']
        }
        });

    if (user && bcrypt.compareSync(password,user.hashedPassword.toString())) {

        await setTokenCookie(res,user);

        return res.json({
            user: {
                id: user.id,
                email: user.email,
                username:user.username
            }});
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
router.get('/', (req,res,next) => {
    const { user } = req;
    //if user is not null, restore session of user
    if (user) {
        const safeUser = {
            id: user.id,
            email: user.email,
            username:user.username
        };
        return res.json({user:safeUser})
    } else {
        return res.json({user:null})
    }
})

module.exports = router;
