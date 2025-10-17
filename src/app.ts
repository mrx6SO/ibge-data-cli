#!/usr/bin/env node
import { Command } from 'commander';
import logger from './utils/logger';
import { syncAllData } from './services/dataSyncService';
import { listCitiesByUF, exportToCSV } from './services/dataQueryService';

/**
 * Main function that processes command-line arguments.
 */
const main = async () => {
  const program = new Command();

  program
    .name('ibge-data-cli')
    .description('A CLI tool to fetch, store, and query Brazilian location data from the IBGE API.')
    .version('1.0.23')
    .option('--db-path <path>', 'Specify a custom path for the database file');

  program
    .command('import-data')
    .description('Syncs IBGE data (states and cities) with the local database.')
    .action(async () => {
      const options = program.opts();
      logger.info('Executing data import command...');
      try {
        await syncAllData(options.dbPath);
      } catch (error) {
        logger.error('Data import failed. Check the logs above for more details.');
        process.exitCode = 1;
      }
    });

  program
    .command('list-cities <uf>')
    .description('Lists all cities for a given state UF from the local database.')
    .action(async (uf) => {
      const options = program.opts();
      logger.info(`Listing cities for state: ${uf.toUpperCase()}`);
      try {
        const cities = await listCitiesByUF(uf, options.dbPath);
        if (cities.length === 0) {
          logger.warn(`No cities found for UF "${uf}". Please check the UF or run import-data first.`);
          return;
        }
        console.table(cities);
      } catch (error) {
        logger.error(`Failed to list cities for ${uf}.`, error);
        process.exitCode = 1;
      }
    });

  program
    .command('export-csv <filename>')
    .description('Exports all states and their cities from the database to a CSV file.')
    .action(async (filename) => {
      const options = program.opts();
      logger.info(`Exporting all data to ${filename}...`);
      try {
        await exportToCSV(filename, options.dbPath);
      } catch (error) {
        logger.error('Failed to export data.', error);
        process.exitCode = 1;
      }
    });

  try {
    await program.parseAsync(process.argv);
    logger.info('Operation completed.');
  } catch (err) {
    logger.error('An unexpected error occurred in the application:', err);
    process.exit(1);
  }
};

main();
