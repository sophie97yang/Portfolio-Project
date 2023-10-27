'use strict';

/** @type {import('sequelize-cli').Migration} */
const {User} = require('../models');
const bcrypt = require('bcryptjs');

const options = {};
if (process.env.NODE_ENV === 'production') options.schema = process.env.SCHEMA;

const demoUsers = [
  {
    firstName:'Alix',
    lastName:'Earle',
    email:'aearle679@gmail.com',
    username:'the_real_alix',
    hashedPassword:bcrypt.hashSync('miami123')
  },
  {
    firstName:'Taylor',
    lastName:'Swift',
    email:'tswift22@yahoo.com',
    username:'t.swizzle',
    hashedPassword:bcrypt.hashSync('ihatejohnm')
  },
  {
    firstName:'Beyonce',
    lastName:'Knowles',
    email:'slayqueenpop@aol.com',
    username:'queen.energy',
    hashedPassword:bcrypt.hashSync('werq567')
  },
  {
    firstName:'Demo',
    lastName:'User',
    email:'demoUser@gmail.com',
    username:'demo-user',
    hashedPassword:bcrypt.hashSync('password')
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

   await User.bulkCreate(demoUsers,{validate:true})
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = 'Users';
    const {Op} = require('sequelize');
    return queryInterface.bulkDelete(options);
    // return queryInterface.bulkDelete(options, {
    //   username: {
    //     [Op.in]: ['theRealAlix','tSwizzle','queenEnergy','demoUser']
    //   }
    // })
}
};
