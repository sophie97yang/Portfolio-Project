'use strict';

/** @type {import('sequelize-cli').Migration} */

const { Venue, Group, Event } = require('../models');
const options = {};
if (process.env.NODE_ENV === 'production') options.schema = process.env.SCHEMA;

const events = [
{
  groupName:"Fan Club - Taylor's Version",
  venueAdd:'23 Cornelia Street',
  name:"Red (Taylor's Version) Release Party",
  type:'In person',
  capacity:15,
  price:22.00,
  description:"We know this feeling All Too Well! Come join us as Taylor stirs up some Trouble with the release of Red. This will be the moment where Everything Has Changed.",
  startDate:'2021-11-12 22:00:00',
  endDate:'2021-11-12 24:00:00',
},
{
  groupName:"Fan Club - Taylor's Version",
  venueAdd:'23 Cornelia Street',
  name:"1989 (Taylor's Version) Release Party",
  type:'In person',
  capacity:15,
  price:1989.00,
  description:"Our Wildest Dreams have came true! We are now Out of the Woods because Taylor has blessed us with a new album. I Wish You Would come join us!",
  startDate:'2023-10-27 22:00:00',
  endDate:'2023-10-27 24:00:00',
},
{
  groupName:"Fan Club - Taylor's Version",
  venueAdd:'23 Cornelia Street',
  name:'Kansas City Chiefs vs Miami Dolphins',
  type:'Online',
  capacity:100,
  price:0.00,
  description:"Rumor has it, Taylor will be supporting her boyfriend, our very own Travis Kelce on the sidelines in November! Tune in on ESPN!",
  startDate:'2023-11-05 06:30:00',
  endDate:'2023-11-05 09:30:00',
},
{
  groupName:"SD Run Club",
  venueAdd:'1309 Hornblend Street',
  name:'Pre-season Social',
  type:'In person',
  capacity:30,
  price:0.00,
  description:"Come join us for a drink at SD Tap Room to get to know everyone!! You know what they say, running is better with friends :)",
  startDate:"2023-09-13 18:00:00",
  endDate:'2023-09-13 20:00:00'
},
{
  groupName:"SD Run Club",
  venueAdd:'1309 Hornblend Street',
  name:'Pb Run',
  type:'In person',
  capacity:30,
  price:0.00,
  description:"We'll be meeting in front of the Rec Center and running around the beach and bay. Please bring lots of water, sunscreen, and good vibes!",
  startDate:"2023-11-13 18:00:00",
  endDate:'2023-11-13 20:00:00'
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
        [Op.in]: ['In person','Online']
      }
    })
  }
};
