const { validationResult } = require('express-validator');

module.exports = {
    handleValidationErrors: (req,res,next)=> {
    const errors = validationResult(req);
    const hasErrors = !errors.isEmpty();

    if (hasErrors) {
        const errorObj = {};
        errors.array().forEach(error => {
            errorObj[error.path] = error.msg;
        });

        const err = new Error('Bad request!');
        err.errors = errorObj;
        err.status = 400;
        err.title = 'Bad request!';
        next(err);
    } else {
        next();
    }
}
}
