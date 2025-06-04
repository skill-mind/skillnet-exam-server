export default (sequelize, DataTypes) => {
    const Option = sequelize.define('Option', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      questionId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      isCorrect: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      order: {
        type: DataTypes.STRING(1), // A, B, C, D
        allowNull: false,
      },
    }, {
      timestamps: true,
    });
  
    Option.associate = function(models) {
      Option.belongsTo(models.Question);
    };
  
    return Option;
  };