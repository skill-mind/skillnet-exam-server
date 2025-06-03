export default (sequelize, DataTypes) => {
  const ExamRecording = sequelize.define('ExamRecording', {
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
    recordingUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER, // in seconds
      allowNull: true,
    },
    examId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Exams',
        key: 'id',
      },
    },
    presenter: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    recordedOn: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    }
  }, {
    timestamps: true,
  });

  ExamRecording.associate = (models) => {
    ExamRecording.belongsTo(models.Exam, {
      foreignKey: 'examId',
      as: 'exam',
    });
  };

  return ExamRecording;
};
