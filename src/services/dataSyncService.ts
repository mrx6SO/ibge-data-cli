import * as ibgeClient from '../api/ibgeClient';
import logger from '../utils/logger';
import { getDbConnection } from '../database/connection';
import type { Knex } from 'knex';

/**
 * Inserts states into the database, ignoring duplicates.
 * @param {Array<object>} states - Array of state objects to insert.
 * @param {Knex} db - The Knex database instance.
 */
const insertStates = async (states: any[], db: Knex) => {
  logger.info(`Inserting ${states.length} states into the database...`);
  // Using 'orIgnore' for SQLite to prevent errors on duplicate primary keys
  await db('estados').insert(states).onConflict('id').ignore();
  logger.info('States inserted successfully.');
};

/**
 * Inserts cities for a specific state into the database, ignoring duplicates.
 * @param {Array<object>} cities - Array of city objects.
 * @param {number} estadoId - The ID of the state these cities belong to.
 * @param {Knex} db - The Knex database instance.
 */
const insertCities = async (cities: any[], estadoId: number, db: Knex) => {
  if (cities.length === 0) {
    logger.warn(`No cities found for state ID ${estadoId}. Skipping insertion.`);
    return;
  }

  const citiesWithStateId = cities.map(city => ({
    ...city,
    estado_id: estadoId,
  }));

  logger.info(`Inserting ${cities.length} cities for state ID ${estadoId}...`);

  // Chunk the inserts to avoid SQLite limits
  const chunkSize = 100;
  for (let i = 0; i < citiesWithStateId.length; i += chunkSize) {
    const chunk = citiesWithStateId.slice(i, i + chunkSize);
    await db('cidades').insert(chunk).onConflict('id').ignore();
  }
};

/**
 * Fetches all states and their respective cities from the IBGE API
 * and syncs them with the local database.
 * @param {string} [dbPath] - Optional path to the database file.
 */
export const syncAllData = async (dbPath?: string) => {
  const db = await getDbConnection(dbPath);
  try {
    logger.info('Starting data synchronization process...');
    // Garante que as migrações foram executadas antes de qualquer operação
    await db.migrate.latest();

    const states = await ibgeClient.getStates();
    await insertStates(states, db);

    for (const state of states) {
      logger.info(`--- Fetching cities for ${state.uf} ---`);
      const cities = await ibgeClient.getCitiesByState(state.uf);
      await insertCities(cities, state.id, db);
    }

    logger.info('Data synchronization completed successfully!');
  } catch (error) {
    logger.error('An error occurred during the data synchronization process.', error);
  } finally {
    await db.destroy();
  }
};