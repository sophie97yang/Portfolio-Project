const jwt = require('jsonwebtoken');
const {jwtConfig} = require('../config');
const {User} = require('../db/models');
const { secret, expiresIn } = jwtConfig;

//setting a cookie after a user is logged in or signed up
const setTokenCookie = (res,user) => {
    const payload = {
        id:user.id,
        email: user.email,
        username:user.username
    };

    const token = jwt.sign({data: payload},secret,{expiresIn:parseInt(expiresIn)});

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('token',token, {
        maxAge: expiresIn * 1000,
        httpOnly: true,
        secure:isProduction,
        sameSite: isProduction && "Lax"
    });

    return token;
};

//restores session user based on contents of JWT cookie
const restoreUser = (req,res,next)=> {
    const { token } = req.cookies;
    req.user = null;

    return jwt.verify(token, secret, null, async (err,jwtPayload)=> {
        if (err) {
            return next();
        }

        try {
            const { id } = jwtPayload.data;
            req.user = await User.findByPk(id, {
                attributes: {
                    include: ['email','createdAt','updatedAt']
                }
            });
        } catch(e) {
            res.clearCookie('token');
            return next();
        }

        if (!req.user) res.clearCookie('token');

        return next();
    });
};


//requires session user to be authenticated before accessing a route
const requireAuth = [restoreUser, (req,res,next)=> {
    if(req.user) return next();
    else {
        const err = new Error('Authentication required!');
        err.title = 'Authenetication required';
        err.errors = { message: 'Authentication required'};
        err.status = 401;
        return next(err);
    }
}];

module.exports = { setTokenCookie, restoreUser, requireAuth };
