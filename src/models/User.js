module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,

      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,

      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: 'requester'
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: true
      },
      date_of_birth: {
        type: DataTypes.DATE,
        allowNull: true
      },
      preferred_language: {
        type: DataTypes.STRING,
        allowNull: true
      },
      residential_address: {
        type: DataTypes.STRING,
        allowNull: true
      },
      preferred_currency: {
        type: DataTypes.STRING,
        allowNull: true
      },
      reset_token: {
        type: DataTypes.STRING
      },
    },
    { },
  );
  User.associate = (models) => {
    User.hasMany(models.Request, {
      foreignKey: 'userId'
    });
  };
  return User;
};
