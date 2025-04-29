/**
 * Apibara-based Contract Event Indexer for Starknet
 * Indexes Starknet blockchain events using the Apibara streaming service
 */

const { StreamClient, v1alpha2 } = require('@apibara/protocol');
const { FieldElement, Filter, StarkNetCursor, v1alpha2: starknet } = require('@apibara/starknet');
const { ContractEvent } = require('../models');
const { apibaraConfig, indexerConfig, contracts, eventSelectors } = require('./config');
const logger = require('../utils/logger');

class ApibaraIndexer {
  constructor() {
    this.isRunning = false;
    this.contracts = contracts;
    this.eventHandlers = require('./handlers');

    // Initialize the Apibara Stream Client
    this.client = new StreamClient({
      url: apibaraConfig.server,
      clientOptions: {
        "grpc.max_receive_message_length": 100 * 1024 * 1024, // 100MB
      },
      token: apibaraConfig.token || "",
    });

    // Create filters based on contract config
    this.filter = this.createFilter();

    logger.info('Apibara Starknet indexer initialized');
  }

  _getFinality() {
    // Return the appropriate finality enum value
    switch (apibaraConfig.finality) {
      case 'DATA_STATUS_PENDING':
        return v1alpha2.DataFinality.DATA_STATUS_PENDING;
      case 'DATA_STATUS_ACCEPTED':
        return v1alpha2.DataFinality.DATA_STATUS_ACCEPTED;
      case 'DATA_STATUS_FINALIZED':
        return v1alpha2.DataFinality.DATA_STATUS_FINALIZED;
      default:
        return v1alpha2.DataFinality.DATA_STATUS_ACCEPTED;
    }
  }

  createFilter() {
    // Create a base filter with header
    const filter = Filter.create().withHeader({ weak: true });

    // Add event filters for each contract and their events
    this.contracts.forEach(contract => {
      // Add events from this contract
      contract.events.forEach(eventName => {
        const eventSelector = eventSelectors[eventName];
        if (eventSelector) {
          // Add filter for this specific event
          filter.addEvent((event) => {
            const eventFilter = event
              .withFromAddress(contract.address);

            // Add key if we have a selector
            if (eventSelector) {
              eventFilter.withKeys([FieldElement.fromBigInt(BigInt(eventSelector))]);
            }

            return eventFilter;
          });
        }
      });
    });

    return filter;
  }

  async initialize() {
    logger.info('Initializing Apibara Starknet blockchain indexer');
    try {
      // Check for the latest indexed block in our database
      const latestEvent = await ContractEvent.findOne({
        order: [['blockNumber', 'DESC']],
      });

      // Configure the client with our filter
      this.client.configure({
        filter: this.filter.encode(),
        batchSize: apibaraConfig.batchSize,
        finality: this._getFinality(),
        cursor: latestEvent
          ? StarkNetCursor.createWithBlockNumber(Number(latestEvent.blockNumber) + 1)
          : StarkNetCursor.createWithBlockNumber(apibaraConfig.startingBlock || 0),
      });

      logger.info(`Indexing will ${latestEvent ? 'resume from' : 'start at'} block ${
        latestEvent ? Number(latestEvent.blockNumber) + 1 : apibaraConfig.startingBlock || 0
      }`);

      return true;
    } catch (error) {
      logger.error(`Error initializing Apibara indexer: ${error.message}`);
      return false;
    }
  }

  async start() {
    if (this.isRunning) {
      logger.warn('Apibara indexer is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting Apibara Starknet blockchain indexer');

    try {
      await this.initialize();
      this.startProcessing();
    } catch (error) {
      this.isRunning = false;
      logger.error(`Error starting Apibara indexer: ${error.message}`);
    }
  }

  async startProcessing() {
    try {
      // Process incoming data in an async loop
      for await (const message of this.client) {
        if (!this.isRunning) {
          break;
        }

        if (message.message === "data") {
          const { data } = message.data || {};
          if (!data) continue;

          for (const item of data) {
            const block = starknet.Block.decode(item);
            await this.processBlock(block);
          }
        }
      }
    } catch (error) {
      logger.error(`Error in Apibara indexer processing: ${error.message}`);
      if (this.isRunning) {
        setTimeout(() => this.startProcessing(), indexerConfig.retryDelay);
      }
    }
  }

  async stop() {
    if (!this.isRunning) {
      logger.warn('Apibara indexer is not running');
      return;
    }

    logger.info('Stopping Apibara Starknet blockchain indexer');
    this.isRunning = false;

    try {
      await this.client.close();
    } catch (error) {
      logger.error(`Error stopping Apibara indexer: ${error.message}`);
    }
  }

  async processBlock(block) {
    const blockNumber = Number(block.header.blockNumber);
    const blockTimestamp = new Date(Number(block.header.timestamp) * 1000);
    logger.debug(`Processing Starknet block ${blockNumber} with timestamp ${blockTimestamp}`);

    // Process each event in the block
    for (const eventData of block.events) {
      if (eventData.event) {
        await this.processEvent(eventData.event, eventData.transaction, blockNumber, blockTimestamp);
      }
    }
  }

  async processEvent(event, tx, blockNumber, blockTimestamp) {
    // Get the contract address
    const contractAddress = event.fromAddress;
    if (!contractAddress) return;

    // Convert the address to a hex string for comparison
    const contractAddressHex = FieldElement.toHex(contractAddress);

    // Find the matching contract config
    const contractConfig = this.contracts.find(c => {
      const configAddress = c.address.startsWith('0x') ? c.address.toLowerCase() : '0x' + c.address.toLowerCase();
      return configAddress === contractAddressHex.toLowerCase();
    });

    if (!contractConfig) {
      return; // Not one of our contracts
    }

    // Determine event name from the first key (event selector)
    let eventName = null;
    if (event.keys && event.keys.length > 0) {
      const eventKey = FieldElement.toHex(event.keys[0]);
      eventName = eventSelectors[eventKey];
    }

    if (!eventName || !contractConfig.events.includes(eventName)) {
      logger.debug(`Unknown event from contract ${contractConfig.name}: ${eventKey}`);
      return;
    }

    try {
      // Store transaction hash if available
      const transactionHash = tx ? FieldElement.toHex(tx.transactionHash) : '';

      // Parse the event data
      const eventData = this.parseEventData(event, eventName, contractConfig);

      // Store the event in the database
      const [contractEvent, created] = await ContractEvent.findOrCreate({
        where: {
          transactionHash: transactionHash,
          eventName: eventName,
          contractAddress: contractConfig.address,
        },
        defaults: {
          blockNumber,
          blockTimestamp,
          eventData,
          processed: false,
        },
      });

      if (created) {
        logger.info(`Indexed Starknet ${eventName} event in block ${blockNumber}`);

        // Process the event with its handler if available
        const handlerName = indexerConfig.eventHandlers[eventName];

        if (handlerName && this.eventHandlers[handlerName]) {
          try {
            await this.eventHandlers[handlerName](contractEvent);
            await contractEvent.update({
              processed: true,
              processedAt: new Date()
            });
            logger.info(`Processed Starknet ${eventName} event: ${transactionHash}`);
          } catch (handlerError) {
            logger.error(`Handler error for Starknet ${eventName} event: ${handlerError.message}`);
          }
        }
      }
    } catch (error) {
      logger.error(`Error processing event in block ${blockNumber}: ${error.message}`);
    }
  }

  parseEventData(event, eventName, contractConfig) {
    // Parse event data according to the ABI definition
    const eventData = {};

    try {
      // Find the event definition in the ABI
      const eventDef = contractConfig.abi.find(item =>
        item.type === 'event' && item.name === eventName
      );

      if (!eventDef) {
        logger.warn(`Event definition not found for ${eventName}`);
        return {
          rawKeys: event.keys ? event.keys.map(key => FieldElement.toHex(key)) : [],
          rawData: event.data ? event.data.map(data => FieldElement.toHex(data)) : []
        };
      }

      // Map keys based on the event definition
      if (eventDef.keys && event.keys) {
        eventDef.keys.forEach((param, index) => {
          if (index < event.keys.length) {
            const value = event.keys[index];
            eventData[param.name] = FieldElement.toBigInt(value);
          }
        });
      }

      // Map data based on the event definition
      if (eventDef.data && event.data) {
        eventDef.data.forEach((param, index) => {
          if (index < event.data.length) {
            const value = event.data[index];
            eventData[param.name] = FieldElement.toBigInt(value);
          }
        });
      }

      return eventData;
    } catch (error) {
      logger.warn(`Error parsing event data: ${error.message}`);
      // Return raw data if parsing fails
      return {
        rawKeys: event.keys ? event.keys.map(key => FieldElement.toHex(key)) : [],
        rawData: event.data ? event.data.map(data => FieldElement.toHex(data)) : []
      };
    }
  }
}

const indexer = new ApibaraIndexer();

module.exports = indexer;
