'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Event.belongsTo(
        models.Venue,
        { foreignKey: 'venueId' }
      );

      Event.belongsTo(
        models.Group,
        { foreignKey: 'groupId' }
      );

      Event.belongsToMany(
        models.User,
          { through: models.Attendance,
            foreignKey: 'eventId',
            otherKey: 'userId'
          }
      );

      Event.hasMany(
        models.EventImage,
          { foreignKey: 'eventId', onDelete: 'CASCADE',  hooks: true }
      );

    }
  }
  Event.init({
    venueId: {
      type:DataTypes.INTEGER,
      // allowNull:false
    },
    groupId: {
      type:DataTypes.INTEGER,
      allowNull:false
    },
    name: {
      type:DataTypes.STRING,
      allowNull:false,
      unique:true,
      validate: {
        len:[5,100]
      }
    },
    description: {
      type:DataTypes.TEXT,
      allowNull:false
    },
    type: {
      type:DataTypes.ENUM(['Online','In person']),
      allowNull:false
    },
    capacity: {
      type:DataTypes.INTEGER,
      allowNull:false
    },
    price: {
      type:DataTypes.FLOAT(4,2),
      allowNull:false
    },
    startDate: {
      type:DataTypes.DATE,
      allowNull:false,
      validate: {
        isDate:true,
        isAfter(value) {
          if (new Date(value)< new Date()) {
            throw new Error('Start date must be in the future')
          }
        }
      }
    },
    endDate: {
      type:DataTypes.DATE,
      allowNull:false,
      validate: {
        isDate:true,
        isAfter(value) {
          if (new Date(value)< new Date(this.startDate)) {
            throw new Error('End date must be after start date')
          }
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Event',
    defaultScope: {
      attributes: {
        exclude:['createdAt','updatedAt','capacity','price','description']
      }
    }
  });
  return Event;
};
