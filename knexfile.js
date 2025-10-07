const path = require('path');
const os = require('os');

// Define a base directory in the user's home folder for the application data
const appDataDir = path.resolve(os.homedir(), '.ibge-data-cli');

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      // The database file will be created in a dedicated folder in the user's home directory
      filename: path.resolve(appDataDir, 'database.sqlite')
    },
    migrations: {
      // Migrations are read from the installation directory
      directory: path.resolve(__dirname, 'src', 'database', 'migrations')
    },
    seeds: {
      directory: path.resolve(__dirname, 'src', 'database', 'seeds')
    },
    // Necessary for SQLite to handle default values correctly
    useNullAsDefault: true,
  },

  test: {
    client: 'sqlite3',
    connection: {
      // In-memory database for tests
      filename: ':memory:'
    },
    migrations: {
      directory: path.resolve(__dirname, 'src', 'database', 'migrations')
    },
    seeds: {
      directory: path.resolve(__dirname, 'src', 'database', 'seeds')
    },
    useNullAsDefault: true,
  },

};