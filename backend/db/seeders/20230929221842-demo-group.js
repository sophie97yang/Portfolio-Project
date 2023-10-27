'use strict';

/** @type {import('sequelize-cli').Migration} */
const { Group } = require('../models');

const options = {};
if (process.env.NODE_ENV === 'production') options.schema = process.env.SCHEMA;

const demoGroups = [
  {
    organizerId:1,
    name:'University of Miami Class of 2022',
    about:"IT'S ALL ABOUT THE U! If you're a Miami Hurricane CO' 2023 and looking to keep the school spirit and party alive, look no further! ",
    type:'In person',
    private:true,
    city:'Miami',
    state:'FL'
  },
  {
    organizerId:2,
    name:"Fan Club - Taylor's Version",
    about:"Welcome to Taylor Swift's Fan Club aka the Swifties! If you want the inside scoop on all things Taylor, the group has a Blank Space made just for you. We're very Enchanted to meet you.You Belong With Us <3",
    type:'Online',
    private:true,
    city:'New York',
    state:'NY'
  },
  {
    organizerId:4,
    name:'SD Run Club',
    about:'For people who hate,like,love to run, all are welcome! Come join us as we jog around the beautiful and sunny SD, the happiest place on earth! Beautiful views, wonderful people, what more could you ask for?!',
    type:'In person',
    private:true,
    city:'San Diego',
    state:'CA'
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
    return queryInterface.bulkDelete(options);
  //   return queryInterface.bulkDelete(options, {
  //     name: {
  //       [Op.in]: ['University of Miami Class of 2022',"Taylor's Version",'PB Run Club']
  //     }
    // })
  }
};
