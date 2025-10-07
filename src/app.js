#!/usr/bin/env node
const { syncAllData } = require('./services/dataSyncService');
const logger = require('./utils/logger');
const { Command } = require('commander');
const { findCitiesByStateUF, findAllStates } = require('./models/Location');
const { Parser } = require('json2csv');
const fs = require('fs/promises');
const path = require('path');
const db = require('./config/database'); // Import db after other modules

/**
 * Ensures the database directory exists and runs the latest migrations.
 * This makes the database ready before any command is executed.
 */
const initializeDatabase = async () => {
  const dbPath = db.client.config.connection.filename;
  const dbDir = path.dirname(dbPath);
  await fs.mkdir(dbDir, { recursive: true });
  await db.migrate.latest();
};

/**
 * Main function that processes command-line arguments.
 */
const main = async () => {
  const program = new Command();

  program
    .name('ibge-cli')
    .description('A CLI tool to interact with IBGE location data.')
    .version('1.0.21');

  // Ensures the database is ready before any command runs.
  program.hook('preAction', initializeDatabase);

  program
    .command('import-data')
    .description('Syncs IBGE data (states and cities) with the local database.')
    .action(async () => {
      logger.info('Executing data import command...');
      try {
        await syncAllData();
      } catch (error) {
        logger.error('Data import failed. Check the logs above for more details.');
        // Exits the process with an error code to indicate failure.
        // We set exitCode to allow the process to exit gracefully after cleanup.
        process.exitCode = 1;
      }
    });

  program
    .command('list-cities <uf>')
    .description('Lists all cities for a given state UF from the local database.')
    .action(async (uf) => {
      logger.info(`Listing cities for state: ${uf.toUpperCase()}`);
      try {
        const cities = await findCitiesByStateUF(uf);
        if (cities.length === 0) {
          logger.warn(`No cities found for UF "${uf}". Please check the UF or run import-data first.`);
          process.exitCode = 1;
          return;
        }
        console.table(cities);
      } catch (error) {
        logger.error('Failed to list cities.', error);
        process.exitCode = 1;
      }
    });

  program
    .command('export-csv <filename>')
    .description('Exports all states and their cities to a single CSV file.')
    .action(async (filename) => {
      logger.info(`Exporting all data to ${filename}...`);
      try {
        // Fetch all data with a single efficient query
        const allData = await db('estados')
          .join('cidades', 'estados.id', '=', 'cidades.estado_id')
          .select(
            'estados.id as estado_id',
            'estados.uf as estado_uf',
            'estados.nome as estado_nome',
            'cidades.id as cidade_id',
            'cidades.nome as cidade_nome'
          )
          .orderBy('estados.uf', 'cidades.nome');
        
        const parser = new Parser();
        const csv = parser.parse(allData);
        await fs.writeFile(filename, csv);
        logger.info(`Data successfully exported to ${filename}`);
      } catch (error) {
        logger.error('Failed to export data.', error);
        process.exitCode = 1;
      }
    });

  await program.parseAsync(process.argv);
};

// Executes the main function and ensures the database connection is closed at the end.
main()
  .then(() => {
    logger.info('Operation completed.');
    // Knex keeps the connection open, so we need to destroy it for the script to exit.
    return db.destroy();
  })
  .catch((err) => {
    logger.error('An unexpected error occurred in the application:', err);
    // Ensures the connection is closed even in case of an error.
    db.destroy();
    process.exit(1);
  });
