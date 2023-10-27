'use strict';

/** @type {import('sequelize-cli').Migration} */
const { Venue, Group } = require('../models');
const options = {};
if (process.env.NODE_ENV === 'production') options.schema = process.env.SCHEMA;

const venues = [
{
  group: 'University of Miami Class of 2022',
  address:'1320 S Dixie Hwy',
  city:'Coral Gables',
  state:'FL',
  lat:40.7184,
  lng:-73.9890
},
{
  group: "Fan Club - Taylor's Version",
  address:'23 Cornelia Street',
  city:'New York',
  state:'NY',
  lat:32.9047,
  lng:-117.2446
},
{
  group: 'SD Run Club',
  address:'1309 Hornblend Street',
  city:'San Diego',
  state:'CA',
  lat:41.7886,
  lng:-87.5987
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
    if (Venue) {
      for (let venueInfo of venues) {
        const { address,city,state,lat,lng } = venueInfo;
        const foundGroup = await Group.findOne({
          where: { name: venueInfo.group}
        });

        await Venue.create({
          groupId: foundGroup.id,
          address,city,state,lat,lng
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
    options.tableName = 'Venues';
    const {Op} = require('sequelize');
    return queryInterface.bulkDelete(options, {
      city: {
        [Op.in]: ['New York','San Diego','Coral Gables','Chicago']
      }
    })
  }
};
