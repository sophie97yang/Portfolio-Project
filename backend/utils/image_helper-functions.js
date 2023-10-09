const {Op} = require('sequelize');
const {EventImage,GroupImage} = require('../db/models');
const { handleValidationErrors } = require('./validation.js');
const { check } = require('express-validator');
const {restoreUser} = require('./auth.js');

const checkGroupImageExistence = async (req,res,next) => {
    const {gimageId} = req.params;
    const image = await GroupImage.findByPk(gimageId);

    if (!image) {
      const err = new Error("Group Image couldn't be found");
      err.title = "Invalid Image Id"
      err.status=404;
      next(err);
    } else {
        req.groupImage=image;
        next();
    }
};
const checkEventImageExistence = async (req,res,next) => {
    const {eimageId} = req.params;
    const image = await EventImage.findByPk(eimageId);

    if (!image) {
      const err = new Error("Event Image couldn't be found");
      err.title = "Invalid Image Id"
      err.status=404;
      next(err);
    } else {
        req.eventImage=image;
        next();
    }
};

module.exports = {checkGroupImageExistence,checkEventImageExistence};
