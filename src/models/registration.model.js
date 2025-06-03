import crypto from 'crypto';

export default (sequelize, DataTypes) => {
  const Registration = sequelize.define('Registration', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    examId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      defaultValue: 'pending',
    },
    examCode: {
      type: DataTypes.STRING,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM('registered', 'completed'),
      defaultValue: 'registered',
    },
  }, {
    timestamps: true,
    hooks: {
      beforeCreate: (registration) => {
        if (!registration.examCode) {
          registration.examCode = crypto.randomBytes(6).toString('hex').toUpperCase();
        }
      }
    }
  });

  return Registration;
};