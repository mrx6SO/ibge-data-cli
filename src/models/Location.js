const db = require('../config/database');

/**
 * Fetches all states registered in the database.
 * @returns {Promise<Array>} A list of all states.
 */
const findAllStates = () => {
  return db('estados').select('*').orderBy('nome');
};

/**
 * Fetches all cities of a given state (by UF).
 * @param {string} uf The state's abbreviation (e.g., 'SP').
 * @returns {Promise<Array>} A list of cities for the specified state.
 */
const findCitiesByStateUF = (uf) => {
  if (!uf) {
    throw new Error("The state's abbreviation (UF) is required.");
  }

  return db('cidades')
    .join('estados', 'cidades.estado_id', '=', 'estados.id')
    .where('estados.uf', uf.toUpperCase())
    .select('cidades.id', 'cidades.nome')
    .orderBy('cidades.nome');
};

/**
 * Fetches a city by its name.
 * Since city names can be repeated in different states,
 * the result can be a list.
 * @param {string} cityName The name of the city to search for.
 * @returns {Promise<Array>} A list of cities that match the name.
 */
const findCityByName = (cityName) => {
  if (!cityName) {
    throw new Error('The city name is required.');
  }

  return db('cidades')
    .join('estados', 'cidades.estado_id', '=', 'estados.id')
    .where('cidades.nome', 'like', `%${cityName}%`)
    .select(
      'cidades.id as cidade_id',
      'cidades.nome as cidade_nome',
      'estados.uf as estado_uf'
    )
    .orderBy('estados.uf', 'cidades.nome');
};

module.exports = {
  findAllStates,
  findCitiesByStateUF,
  findCityByName,
};