/**
 * Configuration file for the Starknet L2 indexer using Apibara
 * Contains contract addresses, ABIs, and other settings
 */

import 'dotenv/config';
import logger from '../utils/logger.js';

// Starknet Contract ABIs
const examContractABI = [
  {
    "type": "event",
    "name": "ExamCreated",
    "keys": [
      {
        "name": "examId",
        "type": "felt"
      },
      {
        "name": "creator",
        "type": "felt"
      }
    ],
    "data": [
      {
        "name": "name",
        "type": "felt"
      }
    ]
  },
  {
    "type": "event",
    "name": "UserRegistered",
    "keys": [
      {
        "name": "examId",
        "type": "felt"
      },
      {
        "name": "user",
        "type": "felt"
      }
    ],
    "data": []
  },
  {
    "type": "event",
    "name": "ExamCompleted",
    "keys": [
      {
        "name": "examId",
        "type": "felt"
      },
      {
        "name": "user",
        "type": "felt"
      }
    ],
    "data": [
      {
        "name": "score",
        "type": "felt"
      },
      {
        "name": "passed",
        "type": "felt"
      }
    ]
  },
  {
    "type": "event",
    "name": "CertificateIssued",
    "keys": [
      {
        "name": "examId",
        "type": "felt"
      }
    ],
    "data": [
      {
        "name": "certificateURI",
        "type": "felt"
      }
    ]
  }
];

// Define event types and their handlers
const eventHandlers = {
  ExamCreated: "handleExamCreated",
  UserRegistered: "handleUserRegistered",
  ExamCompleted: "handleExamCompleted",
  CertificateIssued: "handleCertificateIssued"
};

// Event selectors mapping (hash to event name)
const eventSelectors = {
  // Example format - you need to replace with actual hash values from your contracts
  "0x123abc": "ExamCreated",
  "0x456def": "UserRegistered",
  "0x789ghi": "ExamCompleted",
  "0xabcdef": "CertificateIssued"
};

// Contract configuration
const contracts = [
  {
    name: 'SkillNetExam',
    address: process.env.STARKNET_EXAM_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000000000000000000000000000',
    startBlock: parseInt(process.env.INDEXER_START_BLOCK || '0', 10),
    abi: examContractABI,
    events: Object.keys(eventHandlers),
    eventSelectors: eventSelectors
  }
];

// Apibara network configuration
const apibaraConfig = {
  server: process.env.APIBARA_SERVER_URL || 'https://sepolia.starknet.a5a.ch',
  streamId: process.env.APIBARA_STREAM_ID || 'starknet',
  batchSize: parseInt(process.env.APIBARA_BATCH_SIZE || '10', 10),
  finality: process.env.APIBARA_FINALITY || 'DATA_STATUS_ACCEPTED',
  pollingInterval: parseInt(process.env.APIBARA_POLLING_INTERVAL || '5000', 10),
  startingBlock: parseInt(process.env.INDEXER_START_BLOCK || '0', 10),
};

// Network configuration
const networks = {
  mainnet: {
    rpcUrl: process.env.STARKNET_MAINNET_RPC_URL || 'https://starknet-mainnet.public.blastapi.io',
    chainId: 'SN_MAIN',
    blockTime: 30, // in seconds, Starknet block time is typically longer
  },
  goerli: { // Starknet testnet
    rpcUrl: process.env.STARKNET_SEPOLIA_RPC_URL || 'https://starknet-sepolia.public.blastapi.io',
    chainId: 'SN_SEPOLIA',
    blockTime: 30,
  },
  sepolia: {
    rpcUrl: process.env.STARKNET_SEPOLIA_RPC_URL || 'https://starknet-sepolia.public.blastapi.io',
    chainId: 'SN_SEPOLIA',
    blockTime: 30,
  },
  development: {
    rpcUrl: process.env.STARKNET_DEV_RPC_URL || 'http://localhost:5050',
    chainId: 'SN_DEV',
    blockTime: 5,
  }
};

// Indexer configuration
const indexerConfig = {
  batchSize: parseInt(process.env.INDEXER_BATCH_SIZE || '50', 10), // Smaller batch for Starknet
  pollInterval: parseInt(process.env.INDEXER_POLL_INTERVAL || '60000', 10), // Longer poll for Starknet (1 minute)
  confirmations: parseInt(process.env.INDEXER_CONFIRMATIONS || '5', 10), // Fewer confirmations for Starknet
  maxRetries: parseInt(process.env.INDEXER_MAX_RETRIES || '3', 10),
  retryDelay: parseInt(process.env.INDEXER_RETRY_DELAY || '5000', 10), // 5 seconds
  network: process.env.STARKNET_NETWORK || 'sepolia',
  contracts,
  eventHandlers
};

// Log the configuration
logger.info(`Starknet indexer configured for network: ${indexerConfig.network}`);
logger.info(`Monitoring ${contracts.length} Starknet contracts`);

export {
  indexerConfig,
  apibaraConfig,
  networks,
  contracts,
  eventHandlers,
  eventSelectors
};
