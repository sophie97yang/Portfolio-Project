'use strict';

/** @type {import('sequelize-cli').Migration} */
const { EventImage, GroupImage, Group , Event } = require('../models');
const options = {};
if (process.env.NODE_ENV === 'production') options.schema = process.env.SCHEMA;

const groupImages = [
  {
    group:'Evening Tennis on the Water',
    url:'https://picsum.photos/200'
  }
]
const eventImages = [
  {
    event:'Soccer First Meet and Greet',
    url:'https://picsum.photos/200'
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
      if (GroupImage) {
        for (let groupImageInfo of groupImages) {
          const { url } = groupImageInfo;
          const foundGroup = await Group.findOne({
            where: { name: groupImageInfo.group}
          });

          await GroupImage.create({
            url,
            groupId: foundGroup.id
          });
        }
      }

      if (EventImage) {
        for (let eventImageInfo of eventImages) {
          const { url } = eventImageInfo;
          const foundEvent = await Event.findOne({
            where: { name: eventImageInfo.event}
          });

          await EventImage.create({
            url,
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
    options.tableName = 'GroupImages';
    const {Op} = require('sequelize');
    await queryInterface.bulkDelete(options, {
      url: {
        [Op.in]: ['https://picsum.photos/200']
      }
    });

    options.tableName = 'EventImages';
    await queryInterface.bulkDelete(options, {
      url: {
        [Op.in]: ['https://picsum.photos/200']
      }
    })
  }
};
