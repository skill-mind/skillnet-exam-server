export default (sequelize, DataTypes) => {
  const ExamBanner = sequelize.define('ExamBanner', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    examId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Exams',
        key: 'id',
      },
    },
    buttonText: {
      type: DataTypes.STRING,
      defaultValue: 'Learn More',
    },
    buttonLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    }
  }, {
    timestamps: true,
  });

  ExamBanner.associate = (models) => {
    ExamBanner.belongsTo(models.Exam, {
      foreignKey: 'examId',
      as: 'exam',
    });
  };

  return ExamBanner;
};
