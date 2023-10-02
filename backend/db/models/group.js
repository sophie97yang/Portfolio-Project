'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Group.belongsTo(
        models.User,
        {foreignKey:'organizerId'}
      );

      Group.belongsToMany(
        models.User,
          { through: models.Membership,
            foreignKey: 'groupId',
            otherKey: 'memberId'
          }
          );

      Group.hasMany(
        models.Venue,
        {foreignKey:'groupId',onDelete:'CASCADE',hooks: true }
      );

      Group.hasMany(
        models.Event,
        {foreignKey:'groupId',onDelete:'CASCADE',hooks: true }
      );

      Group.hasMany(
        models.GroupImage,
          { foreignKey: 'groupId', onDelete: 'CASCADE',  hooks: true }
      );

    }
  }
  Group.init({
    organizerId: {
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING,
      allowNull:false,
      unique:true,
      validate: {
        len:[2,60]
      }
    },
    about: {
      type: DataTypes.TEXT,
      allowNull:false,
      validate: {
        len:[50,2500]
      }
    },
    type: {
      type:DataTypes.ENUM(['Online','In person']),
      allowNull:false
    },
    private: {
      type: DataTypes.BOOLEAN,
      allowNull:false
    },
    city: {
      type: DataTypes.STRING,
      allowNull:false
    },
    state: {
      type: DataTypes.STRING,
      allowNull:false
    }
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};
