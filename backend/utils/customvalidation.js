const {User} = require('../db/models');
const { validationResult } = require('express-validator');
const { check } = require('express-validator');

const customValidationErrors = (req,res,next)=> {
    const errors = validationResult(req);
    const hasErrors = !errors.isEmpty();

    if (hasErrors) {
        const errorObj = {};
        errors.array().forEach(error => {
            errorObj[error.path] = error.msg;
        });

        const err = new Error('User already exists');
        err.errors = errorObj;
        err.status = 500;
        err.title = 'Bad request!';
        next(err);
    } else {
        next();
    }
};

module.exports =  {
    checkUsernameAndEmail: [
        check('username')
            .custom(async value => {
            const existingUser = await User.findOne({
                where: {
                  username:value
            }});

            if (existingUser) {
                return false
            } else {
                return true
            }
        })
            .withMessage('User already exists'),
        check('email')
            .custom(async value => {
                const existingUser = await User.findOne({
                  where: {
                    email:value
                }});
                if (existingUser) {
                  return false
              }else {
                return true
              }
            })
              .withMessage('User already exists'),
              customValidationErrors
        ]
};
