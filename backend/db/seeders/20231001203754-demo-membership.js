'use strict';
/** @type {import('sequelize-cli').Migration} */
const { Membership, User, Group } = require('../models');
const options = {};
if (process.env.NODE_ENV === 'production') options.schema = process.env.SCHEMA;

const memberships = [
{
  username:'the_real_alix',
  group: 'University of Miami Class of 2022',
  status:'co-host'
},
{
  username:'t.swizzle',
  group: "Fan Club - Taylor's Version",
  status:'co-host'
},
{
  username:'demo-user',
  group: 'SD Run Club',
  status:'co-host'

},
{
  username:'queen.energy',
  group: "Fan Club - Taylor's Version",
  status:'co-host'

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
      if (Membership) {
        for (let membershipInfo of memberships) {
          const { status } = membershipInfo;
          const foundUser = await User.findOne({
            where: { username: membershipInfo.username}
          });
          const foundGroup = await Group.findOne({
            where: { name: membershipInfo.group}
          });

          await Membership.create({
            status,
            memberId: foundUser.id,
            groupId: foundGroup.id
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
    options.tableName = 'Memberships';
    const {Op} = require('sequelize');
    return queryInterface.bulkDelete(options, {
      status: {
        [Op.in]: ['co-host','member','pending']
      }
    })

  }
};
