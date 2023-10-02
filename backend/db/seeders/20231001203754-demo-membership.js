'use strict';
/** @type {import('sequelize-cli').Migration} */
const { Membership, User, Group } = require('../models');
const options = {};
if (process.env.NODE_ENV === 'production') options.schema = process.env.SCHEMA;

const memberships = [
{
  username:'test2',
  group: 'Evening Tennis on the Water',
  status:'member'
},
{
  username:'test3',
  group: 'Afternoon Golf on the Water',
  status:'member'
},
{
  username:'test1',
  group: 'Morning Soccer on the Water',
  status:'pending'

},
{
  username:'test1',
  group: 'Afternoon Golf on the Water',
  status:'member'

},
{
  username:'test1',
  group: 'Evening Tennis on the Water',
  status:'co-host'

},
{
  username:'test2',
  group: 'Afternoon Golf on the Water',
  status:'co-host'

},
{
  username:'test3',
  group: 'Morning Soccer on the Water',
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
