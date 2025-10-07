const axios = require('axios');
const fs = require('fs/promises');
const { getStates, getCitiesByState } = require('../../src/api/ibgeClient');

// Mock the 'axios' module to isolate tests from the network
jest.mock('axios');
// Mock the 'fs/promises' module to isolate tests from the filesystem
jest.mock('fs/promises');

describe('IBGE API Client', () => {
  // Clear all mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStates', () => {
    it('should fetch and format states correctly', async () => {
      // Mocked API response, now including the 'regiao' object
      const mockStates = [
        { id: 1, sigla: 'SP', nome: 'São Paulo', regiao: { nome: 'Sudeste' } },
        { id: 2, sigla: 'RJ', nome: 'Rio de Janeiro', regiao: { nome: 'Sudeste' } },
      ];
      // Configure the axios mock to return the mocked data
      axios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockStates }),
      });

      const states = await getStates();

      // Check if the result is in the expected format, now including 'regiao_nome'
      expect(states).toEqual([
        { id: 1, uf: 'SP', nome: 'São Paulo', regiao_nome: 'Sudeste' },
        { id: 2, uf: 'RJ', nome: 'Rio de Janeiro', regiao_nome: 'Sudeste' },
      ]);
    });

    it('should fetch and format states correctly from cache', async () => {
      // Mocked raw API data, as it would be stored in the cache file
      const mockCachedStates = [
        { id: 1, sigla: 'SP', nome: 'São Paulo', regiao: { nome: 'Sudeste' } },
      ];

      // Simulate that the cache file exists and is valid
      fs.stat.mockResolvedValue({ mtime: new Date() });
      fs.readFile.mockResolvedValue(JSON.stringify(mockCachedStates));

      const states = await getStates();

      // Check if the result is in the expected format after being read from cache
      expect(states).toEqual([
        { id: 1, uf: 'SP', nome: 'São Paulo', regiao_nome: 'Sudeste' },
      ]);

      // Ensure axios was NOT called because the cache was hit
      expect(axios.create().get).not.toHaveBeenCalled();
    });

    it('should throw an error if the API call fails', async () => {
      // Configure the mock to simulate an error
      axios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(new Error('Network Error')),
      });

      // Check if the function throws an exception
      await expect(getStates()).rejects.toThrow('Network Error');
    });
  });

  describe('getCitiesByState', () => {
    it('should fetch and format cities for a given state', async () => {
      const mockCities = [
        { id: 10, nome: 'Campinas' },
        { id: 11, nome: 'São Paulo' },
      ];
      axios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockCities }),
      });

      const cities = await getCitiesByState('SP');

      expect(cities).toEqual([
        { id: 10, nome: 'Campinas' },
        { id: 11, nome: 'São Paulo' },
      ]);
      // Check if the correct endpoint was called
      expect(axios.create().get).toHaveBeenCalledWith('/estados/SP/municipios');
    });

    it('should fetch and format cities correctly from cache', async () => {
      // Mocked raw API data, as it would be stored in the cache file
      const mockCachedCities = [
        { id: 10, nome: 'Campinas' },
        { id: 11, nome: 'São Paulo' },
      ];

      // Simulate that the cache file exists and is valid
      fs.stat.mockResolvedValue({ mtime: new Date() });
      fs.readFile.mockResolvedValue(JSON.stringify(mockCachedCities));

      const cities = await getCitiesByState('SP');

      // Check if the result is in the expected format after being read from cache
      expect(cities).toEqual([
        { id: 10, nome: 'Campinas' },
        { id: 11, nome: 'São Paulo' },
      ]);

      // Ensure axios was NOT called because the cache was hit
      expect(axios.create().get).not.toHaveBeenCalled();
    });

    it('should throw an error if UF is not provided', async () => {
      await expect(getCitiesByState(null)).rejects.toThrow("The state's abbreviation (UF) is required.");
    });
  });
});