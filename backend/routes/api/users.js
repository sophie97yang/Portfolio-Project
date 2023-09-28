const express = require('express');
const bcrypt = require('bcryptjs');
const {setTokenCookie, requireAuth} = require('../../utils/auth.js');
const {User} = require('../../db/models');


const router = express.Router();

router.post('/',async (req,res,next)=> {
   const {firstName,lastName,email,username,password} = req.body;
   const saltedAndHashed = bcrypt.hashSync(password);
   const newUser = await User.create({email,username,hashedPassword:saltedAndHashed});
   const safeUser = {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username
    };
   await setTokenCookie(res,safeUser);
   res.json({
    user:safeUser
});
})


module.exports = router;
