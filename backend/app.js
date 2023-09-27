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


  module.exports = app;
