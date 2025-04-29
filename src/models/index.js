const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

// Define models
const User = require('./user.model')(sequelize, DataTypes);
const Exam = require('./exam.model')(sequelize, DataTypes);
const Registration = require('./registration.model')(sequelize, DataTypes);
const Result = require('./result.model')(sequelize, DataTypes);
const Question = require('./question.model')(sequelize, DataTypes);
const Option = require('./option.model')(sequelize, DataTypes);
const Notification = require('./notification.model')(sequelize, DataTypes);
const ExamBanner = require('./examBanner.model')(sequelize, DataTypes);
const ExamRecording = require('./examRecording.model')(sequelize, DataTypes);
const ContractEvent = require('./contractEvent.model')(sequelize, DataTypes);

// Define associations
User.hasMany(Registration, { foreignKey: 'userId' });
Registration.belongsTo(User, { foreignKey: 'userId' });

Exam.hasMany(Registration, { foreignKey: 'examId' });
Registration.belongsTo(Exam, { foreignKey: 'examId' });

Exam.hasMany(Question, { foreignKey: 'examId' });
Question.belongsTo(Exam, { foreignKey: 'examId' });

Question.hasMany(Option, { foreignKey: 'questionId' });
Option.belongsTo(Question, { foreignKey: 'questionId' });

Registration.hasOne(Result, { foreignKey: 'registrationId' });
Result.belongsTo(Registration, { foreignKey: 'registrationId' });

User.hasMany(Result, { foreignKey: 'userId' });
Result.belongsTo(User, { foreignKey: 'userId' });

Exam.hasMany(Result, { foreignKey: 'examId' });
Result.belongsTo(Exam, { foreignKey: 'examId' });

// New associations
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

Exam.hasMany(ExamBanner, { foreignKey: 'examId' });
ExamBanner.belongsTo(Exam, { foreignKey: 'examId' });

Exam.hasMany(ExamRecording, { foreignKey: 'examId' });
ExamRecording.belongsTo(Exam, { foreignKey: 'examId' });

// Sync all models with database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing models:', error);
  }
};

module.exports = {
  sequelize,
  User,
  Exam,
  Registration,
  Result,
  Question,
  Option,
  Notification,
  ExamBanner,
  ExamRecording,
  ContractEvent,
  syncDatabase,
};
