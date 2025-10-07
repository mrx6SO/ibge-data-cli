const knex = require('knex');
const path = require('path');

// The knexfile.js at the project root centralizes connection settings.
// We use path.resolve to ensure the path is found correctly,
// regardless of where the script is executed from.
const config = require(path.resolve(__dirname, '..', '..', 'knexfile.js'));

// We select the 'development' environment configuration.
// In a larger project, this could be dynamic (e.g., process.env.NODE_ENV).
const connection = knex(config.development);

module.exports = connection;
