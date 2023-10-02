'use strict';

/** @type {import('sequelize-cli').Migration} */
const { Attendance, User, Event } = require('../models');
const options = {};
if (process.env.NODE_ENV === 'production') options.schema = process.env.SCHEMA;

const attendances = [
  {
    event:'Evening Tennis on the Water',
    username:'test2',
    status:'pending'
  },
  {
    event:'Afternoon Golf on the Water',
    username:'test3',
    status:'waitlist'
  },
  {
    event:'Morning Soccer on the Water',
    username:'test1',
    status:'accepted'
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

          await Membership.create({
            status,
            memberId: foundUser.id,
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
        [Op.in]: ['accepted','waitlist','pending']
      }
    })
  }
};
