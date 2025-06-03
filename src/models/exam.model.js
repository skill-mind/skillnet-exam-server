export default (sequelize, DataTypes) => {
    const Exam = sequelize.define('Exam', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      category: {
        type: DataTypes.ENUM(
          'Javascript',
          'Data Science',
          'AI Development',
          'Frontend',
          'Cairo',
          'Solidity',
          'NextJS',
          'Others',
          // Add more categories as needed
        ),
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      duration: {
        type: DataTypes.INTEGER, // in minutes
        allowNull: false,
      },
      certification: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      passingScore: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      format: {
        type: DataTypes.STRING,
        defaultValue: 'Multichoice',
      },
      topicsCovered: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      benefits: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      instructions: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
    }, {
      timestamps: true,
    });
  
    return Exam;
  };