const axios = require('axios');
const logger = require('../utils/logger');
const fs = require('fs/promises');
const path = require('path');

// Cache Configuration 
const CACHE_DIR = path.resolve(__dirname, '..', 'database', 'cache');
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Ensures the cache directory exists.
 */
const ensureCacheDir = async () => {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    logger.error('Failed to create cache directory.', error);
  }
};

/**
 * Reads data from a cache file if it's valid (not expired).
 * @param {string} cacheFile The path to the cache file.
 * @returns {Promise<object|null>} The cached data or null if not found or expired.
 */
const readFromCache = async (cacheFile) => {
  try {
    const stats = await fs.stat(cacheFile);
    const isExpired = (new Date().getTime() - stats.mtime.getTime()) > CACHE_TTL;
    if (isExpired) {
      logger.info(`Cache expired for ${path.basename(cacheFile)}. Fetching fresh data.`);
      return null;
    }

    const data = await fs.readFile(cacheFile, 'utf-8');
    logger.info(`Serving from cache: ${path.basename(cacheFile)}`);
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist, which is a normal cache miss.
    return null;
  }
};

// We create an axios instance with the base URL of the IBGE API.
// This avoids repetition and simplifies maintenance.
const apiClient = axios.create({
  baseURL: 'https://servicodados.ibge.gov.br/api/v1/localidades',
});

/**
 * Formats the raw state data from the API into the structure used by our database.
 * @param {Array} rawData The raw data array from the IBGE API.
 * @returns {Array} The formatted data array.
 */
const formatStatesData = (rawData) => rawData.map(state => ({
  id: state.id,
  uf: state.sigla,
  nome: state.nome,
  regiao_nome: state.regiao.nome,
}));

/**
 * Busca todos os estados na API do IBGE.
 * @returns {Promise<Array>} Uma promessa que resolve para um array de objetos de estado.
 */ // Fetches all states from the IBGE API.
const getStates = async () => {
  try {
    await ensureCacheDir();
    const cacheFile = path.join(CACHE_DIR, 'states.json');
    const cachedData = await readFromCache(cacheFile);
    if (cachedData) {
      return formatStatesData(cachedData);
    }

    logger.info('Fetching states from IBGE API (cache miss)...');
    // We order by name for consistency
    const response = await apiClient.get('/estados?orderBy=nome');
    const data = response.data;

    await fs.writeFile(cacheFile, JSON.stringify(data, null, 2)); // Save raw data to cache
    return formatStatesData(data); // Format before returning
  } catch (error) {
    logger.error('Error fetching states from IBGE API.', { message: error.message });
    throw error; // Propagate the error for the service layer to handle
  }
};

/**
 * Formats the raw city data from the API into the structure used by our application.
 * @param {Array} rawData The raw data array from the IBGE API.
 * @returns {Array} The formatted data array.
 */
const formatCitiesData = (rawData) => rawData.map(city => ({
  id: city.id,
  nome: city.nome,
}));

/**
 * Fetches all municipalities for a given state (UF).
 * @param {string} uf The state's abbreviation (e.g., 'SP', 'RJ').
 * @returns {Promise<Array>} A promise that resolves to an array of city objects.
 */
const getCitiesByState = async (uf) => {
  if (!uf) throw new Error("The state's abbreviation (UF) is required.");

  try {
    await ensureCacheDir();
    const cacheFile = path.join(CACHE_DIR, `cities_${uf}.json`);
    const cachedData = await readFromCache(cacheFile);
    if (cachedData) {
      return formatCitiesData(cachedData);
    }

    logger.info(`Fetching municipalities for state ${uf} (cache miss)...`);
    const response = await apiClient.get(`/estados/${uf}/municipios`);
    const data = response.data;

    await fs.writeFile(cacheFile, JSON.stringify(data, null, 2));
    return formatCitiesData(data);
  } catch (error) {
    logger.error(`Error fetching municipalities for state ${uf}.`, { message: error.message });
    throw error;
  }
};

module.exports = {
  getStates,
  getCitiesByState,
};
