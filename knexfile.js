const path = require('path');

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      // The database file will be created at this path
      filename: path.resolve(__dirname, 'src', 'database', 'database.sqlite')
    },
    migrations: {
      // Directory where migrations will be stored
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