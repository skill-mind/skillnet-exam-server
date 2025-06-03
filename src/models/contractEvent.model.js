export default (sequelize, DataTypes) => {
  const ContractEvent = sequelize.define('ContractEvent', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    contractAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    eventName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    transactionHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    blockNumber: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    blockTimestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    eventData: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    processed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['contractAddress'],
      },
      {
        fields: ['eventName'],
      },
      {
        fields: ['blockNumber'],
      },
      {
        fields: ['processed'],
      },
      {
        unique: true,
        fields: ['transactionHash', 'eventName', 'contractAddress'],
      },
    ],
  });

  return ContractEvent;
};
