export default (sequelize, DataTypes) => {
    const Result = sequelize.define('Result', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      registrationId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      examId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      score: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      passed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      answers: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      completedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    }, {
      timestamps: true,
    });
  
    return Result;
  };