'use strict';

/** @type {import('sequelize-cli').Migration} */
const { Group } = require('../models');

const options = {};
if (process.env.NODE_ENV === 'production') options.schema = process.env.SCHEMA;

const demoGroups = [
  {
    organizerId:1,
    name:'Evening Tennis on the Water',
    about:'Enjoy rounds of tennis with a tight-nit group of people on the water facing the Brooklyn Bridge. Singles or doubles.',
    type:'In person',
    private:true,
    city:'New York',
    state:'NY'
  },
  {
    organizerId:2,
    name:'Afternoon Golf on the Water',
    about:'Enjoy rounds of golf with a tight-nit group of people on the water facing the Coronado Bridge.',
    type:'In person',
    private:true,
    city:'San Diego',
    state:'CA'
  },
  {
    organizerId:3,
    name:'Morning Soccer on the Water',
    about:'Enjoy rounds of soccer with a tight-nit group of people on the water facing the Dusable Bridge.',
    type:'In person',
    private:true,
    city:'Chicago',
    state:'IL'
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
   await Group.bulkCreate(demoGroups,{validate:true});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = 'Groups';
    const {Op} = require('sequelize');
    return queryInterface.bulkDelete(options, {
      name: {
        [Op.in]: ['Evening Tennis on the Water','Afternoon Golf on the Water','Morning Soccer on the Water']
      }
    })
  }
};
