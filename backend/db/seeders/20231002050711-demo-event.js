'use strict';

/** @type {import('sequelize-cli').Migration} */

const { Venue, Group, Event } = require('../models');
const options = {};
if (process.env.NODE_ENV === 'production') options.schema = process.env.SCHEMA;

const events = [
{
  groupName:'Evening Tennis on the Water',
  venueAdd:'92 Ludlow St',
  name:'Tennis First Meet and Greet',
  type:'In person',
  capacity:15,
  price:30.00,
  description:"The first meet and greet for our group! Come say hello!",
  startDate:'2024-01-01 20:00:00',
  endDate:'2024-01-01 22:00:00',
},
{
  groupName:'Afternoon Golf on the Water',
  venueAdd:'11480 N Torrey Pines Rd',
  name:'Golf First Meet and Greet',
  type:'In person',
  capacity:15,
  price:30.00,
  description:"The first meet and greet for our group! Come say hello!",
  startDate:'2024-01-01 20:00:00',
  endDate:'2024-01-01 22:00:00',
},
{
  groupName:'Morning Soccer on the Water',
  venueAdd:'5801 S Ellis Ave',
  name:'Soccer First Meet and Greet',
  type:'In person',
  capacity:15,
  price:30.00,
  description:"The first meet and greet for our group! Come say hello!",
  startDate:'2024-01-01 20:00:00',
  endDate:'2024-01-01 22:00:00',
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
    try{
      if (Event) {
        for (let eventInfo of events) {
          const { name,type,capacity,price,description,startDate,endDate } = eventInfo;
          const foundGroup = await Group.findOne({
            where: { name: eventInfo.groupName}
          });

          const foundVenue = await Venue.findOne({
            where: { address: eventInfo.venueAdd}
          });

          await Event.create({
            groupId: foundGroup.id,
            venueId:foundVenue.id,
            name,type,capacity,price,description,startDate,endDate
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
    options.tableName = 'Events';
    const {Op} = require('sequelize');
    return queryInterface.bulkDelete(options, {
      type: {
        [Op.in]: ['In person']
      }
    })
  }
};
