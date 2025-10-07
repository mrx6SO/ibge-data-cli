const path = require('path');
const os = require('os');

// Define a base directory in the user's home folder for application data.
// This ensures the database is stored in a consistent, user-writable location.
const appDataDir = path.join(os.homedir(), '.ibge-data-cli');

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      // The database file will be created in a dedicated folder in the user's home directory.
      // Using path.join is safer for constructing paths across different OS.
      filename: path.join(appDataDir, 'database.sqlite')
    },
    migrations: {
      // Migrations are read from the installation directory.
      // __dirname ensures the path is always relative to this config file.
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