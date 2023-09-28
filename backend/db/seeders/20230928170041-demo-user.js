'use strict';

/** @type {import('sequelize-cli').Migration} */
const {User} = require('../models');
const bcrypt = require('bcryptjs');

const options = {};
if (process.env.NODE_ENV === 'production') options.schema = process.env.SCHEMA;

const demoUsers = [
  {
    email:'test1@gmail.com',
    username:'test1',
    hashedPassword:bcrypt.hashSync('password')
  },
  {
    email:'test2@gmail.com',
    username:'test2',
    hashedPassword:bcrypt.hashSync('password2')
  },
  {
    email:'test3@gmail.com',
    username:'test3',
    hashedPassword:bcrypt.hashSync('password3')
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
    return queryInterface.bulkDelete(options, {
      username: {
        [Op.in]: ['test1','test2','test3']
      }
    })
}
};
