const knex = require('knex');
const knexConfig = require('../../knexfile');
const { getStates, getCitiesByState } = require('../api/ibgeClient');
const logger = require('../utils/logger');

const db = knex(knexConfig.development);

/**
 * Orchestrates fetching data from the IBGE API and persisting it to the database.
 * Uses transactions to ensure data consistency.
 */
const syncAllData = async () => {
  logger.info('Starting IBGE data synchronization...');

  const trx = await db.transaction(); // Start a transaction

  try {
    // 1. Fetch and save the states
    const states = await getStates();
    if (!states || states.length === 0) {
      throw new Error('No states found in the IBGE API.');
    }

    // Insert or update the states.
    // 'onConflict' and 'merge' ensure that if a state with the same 'id' already exists,
    // it will be updated. This makes the operation idempotent.
    await trx('estados').insert(states).onConflict('id').merge();
    logger.info(`${states.length} states were saved/updated.`);

    // 2. For each state, fetch and save its cities
    for (const state of states) {
      const cities = await getCitiesByState(state.uf);
      if (!cities || cities.length === 0) {
        logger.warn(`No cities found for state ${state.uf}.`);
        continue; // Skip to the next state
      }

      // Add the 'estado_id' foreign key to each city object
      const citiesWithStateId = cities.map(city => ({
        ...city,
        estado_id: state.id,
      }));

      // To avoid the "SQLITE_ERROR: too many terms in compound SELECT" error
      // in states with many cities, we split the insertion into chunks.
      const chunkSize = 250; // A safe batch size, well below the SQLite limit.
      for (let i = 0; i < citiesWithStateId.length; i += chunkSize) {
        const chunk = citiesWithStateId.slice(i, i + chunkSize);
        // Insert or update the current batch of cities
        await trx('cidades').insert(chunk).onConflict('id').merge();
      }

      logger.info(`  - ${cities.length} cities saved for ${state.uf}.`);
    }

    await trx.commit(); // Commit the transaction if everything was successful
    logger.info('Synchronization completed successfully!');
  } catch (error) {
    await trx.rollback(); // Rollback the transaction in case of an error
    logger.error('Error during synchronization. Transaction has been rolled back.', error);
    throw error; // Propagate the error to the calling layer
  }
};

module.exports = {
  syncAllData,
};
