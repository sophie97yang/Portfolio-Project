'use strict';

/** @type {import('sequelize-cli').Migration} */
const { EventImage, GroupImage, Group , Event } = require('../models');
const options = {};
if (process.env.NODE_ENV === 'production') options.schema = process.env.SCHEMA;

const groupImages = [
  {
    group:"Fan Club - Taylor's Version",
    url:'https://i.pinimg.com/originals/0f/65/65/0f656523dd5232d4b12e7fac56824b54.jpg',
    preview:true
  },
  {
    group:'University of Miami Class of 2022',
    url:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Miami_Hurricanes_logo.svg/1200px-Miami_Hurricanes_logo.svg.png',
    preview:true
  },
  {
    group:'SD Run Club',
    url:'https://picsum.photos/id/108/2000/1333.jpg',
    preview:true
  }
]
const eventImages = [
  {
    event:"Red (Taylor's Version) Release Party",
    url:'https://upload.wikimedia.org/wikipedia/en/4/47/Taylor_Swift_-_Red_%28Taylor%27s_Version%29.png',
    preview:true
  },
  {
    event:"1989 (Taylor's Version) Release Party",
    url:'https://www.rollingstone.com/wp-content/uploads/2023/10/1989-album-review.jpg',
    preview:true
  },
  {
    event:'Kansas City Chiefs vs Miami Dolphins',
    url:'https://www.billboard.com/wp-content/uploads/2023/09/travis-kelce-taylor-swift-kc-chiefs-924-2023-billboard-1548.jpg',
    preview:true
  },
  {
    event:'Pre-season Social',
    url:'https://images.squarespace-cdn.com/content/v1/647e44913fcd1f300e34b84d/1694985523446-S5KPPDTHZ33OMOQAT7NB/sdtaproom-happy-hour.jpeg',
    preview:true
  },
  {
    event:'Pb Run',
    url:'https://picsum.photos/id/156/2177/3264.jpg',
    preview:true
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
          const { url,preview } = groupImageInfo;
          const foundGroup = await Group.findOne({
            where: { name: groupImageInfo.group}
          });

          await GroupImage.create({
            url,
            groupId: foundGroup.id,
            preview
          });
        }
      }

      if (EventImage) {
        for (let eventImageInfo of eventImages) {
          const { url,preview } = eventImageInfo;
          const foundEvent = await Event.findOne({
            where: { name: eventImageInfo.event}
          });

          await EventImage.create({
            url,
            eventId: foundEvent.id,
            preview
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
      preview: {
        [Op.in]: ['true','false']
      }
    });

    options.tableName = 'EventImages';
    await queryInterface.bulkDelete(options, {
      preview: {
        [Op.in]: ['true','false']
      }
    })
  }
};
