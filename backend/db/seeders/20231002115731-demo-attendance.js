'use strict';

/** @type {import('sequelize-cli').Migration} */
const { Attendance, User, Event } = require('../models');
const options = {};
if (process.env.NODE_ENV === 'production') options.schema = process.env.SCHEMA;

const attendances = [
  {
    event:'Tennis First Meet and Greet',
    username:'test2',
    status:'pending'
  },
  {
    event:'Golf First Meet and Greet',
    username:'test3',
    status:'waitlist'
  },
  {
    event:'Soccer First Meet and Greet',
    username:'test1',
    status:'attending'
  }

]
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    try {
      if (Attendance) {
        for (let attendanceInfo of attendances) {
          const { status } = attendanceInfo;
          const foundUser = await User.findOne({
            where: { username: attendanceInfo.username}
          });
          const foundEvent = await Event.findOne({
            where: { name: attendanceInfo.event }
          });

          await Attendance.create({
            status,
            userId: foundUser.id,
            eventId: foundEvent.id
          });
        }
      }
    } catch(err) {
      console.error(err);
      throw err;
    }
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = 'Attendances';
    const {Op} = require('sequelize');
    return queryInterface.bulkDelete(options, {
      status: {
        [Op.in]: ['attending','waitlist','pending']
      }
    })
  }
};
