// Register ts-node to allow Knex to run migrations in TypeScript
// This is no longer needed here as we will configure it in package.json

import path from 'path';
import os from 'os';
import type { Knex } from 'knex';

const appDataDir = path.join(os.homedir(), '.ibge-data-cli');
const defaultDbPath = path.join(appDataDir, 'database.sqlite');

/**
 * Creates a Knex configuration object.
 * @param dbPath - Optional path for the database file.
 * @returns A Knex configuration object.
 */
export function createConfig(dbPath?: string): Knex.Config {
  return {
    client: 'sqlite3',
    connection: {
      filename: dbPath || defaultDbPath,
    },
    migrations: {
      directory: path.resolve(__dirname, './database/migrations'),
      loadExtensions: ['.js']
    },
    useNullAsDefault: true,
  };
}

// Exporta uma configuração padrão para ser usada pelo Knex CLI
// e também a função createConfig para uso programático.
const development = createConfig();

export default development;
