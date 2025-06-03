export default (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      walletAddress: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user',
      },
    }, {
      timestamps: true,
    });
    return User;
  };