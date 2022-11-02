const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('mysql://root@127.0.0.1/ratings_reviews');

const Review = sequelize.define(
  'review',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    summary: {
      type: DataTypes.STRING(60),
    },
    recommend: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    body: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    reviewer_name: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    reviewer_email: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    helpfulness: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    reported: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
  },
  { underscored: true }
);

const Photo = sequelize.define(
  'photo',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    review_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Review,
        key: 'id',
      },
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { underscored: true, timestamps: false }
);

const CharacteristicName = sequelize.define(
  'characteristic_name',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    characteristic: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { underscored: true, timestamps: false }
);

const Characteristic = sequelize.define(
  'characteristic',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    characteristic_name_id: {
      type: DataTypes.INTEGER,
      references: {
        model: CharacteristicName,
        key: 'id',
      },
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  { underscored: true, timestamps: false }
);

const CharacteristicValue = sequelize.define(
  'characteristic_value',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    review_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Review,
        key: 'id',
      },
    },
    characteristic_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Characteristic,
        key: 'id',
      },
    },
    value: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  { underscored: true, timestamps: false }
);

/*
 * ASSOCIATIONS
 */

Review.hasMany(Photo, {
  foreignKey: {
    allowNull: false,
  },
});
Photo.belongsTo(Review);

Review.hasMany(CharacteristicValue, {
  foreignKey: {
    allowNull: false,
  },
});
CharacteristicValue.belongsTo(Review);

Characteristic.hasMany(CharacteristicValue, {
  foreignKey: {
    allowNull: false,
  },
});
CharacteristicValue.belongsTo(Characteristic);

CharacteristicName.hasMany(Characteristic, {
  foreignKey: {
    allowNull: false,
  },
});
Characteristic.belongsTo(CharacteristicName);

sequelize.sync();

module.exports = { Review, Photo, Characteristic, CharacteristicName, CharacteristicValue };
