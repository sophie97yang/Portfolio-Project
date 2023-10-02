const express = require('express');
require('express-async-errors');
//morgan is a logging middleware - helps debug
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
//helmet is a middleware that adds/removes headers to comply with web security standards
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { environment } = require('./config');
const isProduction = environment === 'production';
const app = express();
const routes = require('./routes');
const { ValidationError } = require('sequelize');

app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());

//security middleware
if (!isProduction) {
    // enable cors only in development
    app.use(cors());
  }

  app.use(
    helmet.crossOriginResourcePolicy({
      policy: "cross-origin"
    })
  );

  // Set the _csrf token and create req.csrfToken method
  app.use(
    csurf({
      cookie: {
        secure: isProduction,
        sameSite: isProduction && "Lax",
        httpOnly: true
      }
    })
  );

  app.use(routes);

  app.use((err,req,res,next)=> {
    if (err instanceof ValidationError) {
      let errors = {};
      for (let error of err.errors) {
        errors[error.path] = error.message;
      }
      err.title = 'Validation error';
      err.status = 400;
      err.errors = errors;
    }
    next(err);
  });

  app.use((req,res,next)=> {
    const err = new Error(`The requested resource couldn't be found.`);
    err.title = "Resource Not Found";
    err.errors = { message: "The requested resource couldn't be found." };
    err.status = 404;
    next(err);
  });

  app.use((err,req,res,next)=> {
    res.status(err.status || 500);
    console.error(err);
    res.json({
      title: err.title || 'Server Error',
      message: err.message,
      errors: err.errors,
      stack: isProduction ? null : err.stack
  });
  })




  module.exports = app;
