const knex = require('knex');
const knexConfig = require('../../knexfile');
const ibgeClient = require('../api/ibgeClient');
const logger = require('../utils/logger');

const db = knex(knexConfig.development);

/**
 * Ensures that the directory for the database file exists.
 */
const ensureDatabaseDirectoryExists = async () => {
  const dbPath = knexConfig.development.connection.filename;
  const dbDir = path.dirname(dbPath);
  // Use fs.promises for async file system operations
  const fs = require('fs/promises');
  await fs.mkdir(dbDir, { recursive: true });
};

/**
 * Inserts states into the database, ignoring duplicates.
 * @param {Array<object>} states - Array of state objects to insert.
 */
const insertStates = async (states) => {
  logger.info(`Inserting ${states.length} states into the database...`);
  // Using 'orIgnore' for SQLite to prevent errors on duplicate primary keys
  await db('estados').insert(states).onConflict('id').ignore();
  logger.info('States inserted successfully.');
};

/**
 * Inserts cities for a specific state into the database, ignoring duplicates.
 * @param {Array<object>} cities - Array of city objects.
 * @param {number} estadoId - The ID of the state these cities belong to.
 */
const insertCities = async (cities, estadoId) => {
  if (cities.length === 0) {
    logger.warn(`No cities found for state ID ${estadoId}. Skipping insertion.`);
    return;
  }

  const citiesWithStateId = cities.map(city => ({
    ...city,
    estado_id: estadoId,
  }));

  logger.info(`Inserting ${cities.length} cities for state ID ${estadoId}...`);
  await db('cidades').insert(citiesWithStateId).onConflict('id').ignore();
};

/**
 * Fetches all states and their respective cities from the IBGE API
 * and syncs them with the local database.
 */
const syncAllData = async () => {
  try {
    logger.info('Starting data synchronization process...');
    const states = await ibgeClient.getStates();
    await insertStates(states);

    for (const state of states) {
      logger.info(`--- Fetching cities for ${state.uf} ---`);
      const cities = await ibgeClient.getCitiesByState(state.uf);
      await insertCities(cities, state.id);
    }

    logger.info('Data synchronization completed successfully!');
  } catch (error) {
    logger.error('An error occurred during the data synchronization process.', error);
  } finally {
    await db.destroy(); // Close the database connection
  }
};

module.exports = { syncAllData };