module.exports = (sequelize, DataTypes) => {
    const Question = sequelize.define('Question', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      examId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      question: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    }, {
      timestamps: true,
    });
  
    return Question;
  };