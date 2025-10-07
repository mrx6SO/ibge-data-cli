const knex = require('knex');
const config = require('../../knexfile');
const { findAllStates, findCitiesByStateUF } = require('../../src/models/Location');

// Use the test configuration from knexfile (in-memory database)
const db = knex(config.test);

describe('Location Model', () => {
  // Before all tests, run the migrations
  beforeAll(async () => {
    await db.migrate.latest();
  });

  // Before each test, insert sample data
  beforeEach(async () => {
    await db('estados').insert([
      { id: 1, uf: 'SP', nome: 'São Paulo', regiao_nome: 'Sudeste' },
      { id: 2, uf: 'RJ', nome: 'Rio de Janeiro', regiao_nome: 'Sudeste' },
    ]);
    await db('cidades').insert([
      { id: 10, nome: 'São Paulo', estado_id: 1 },
      { id: 11, nome: 'Campinas', estado_id: 1 },
      { id: 20, nome: 'Rio de Janeiro', estado_id: 2 },
    ]);
  });

  // After each test, clean the tables
  afterEach(async () => {
    await db('cidades').del();
    await db('estados').del();
  });

  // After all tests, close the database connection
  afterAll(async () => {
    await db.destroy();
  });

  it('should find all states ordered by name', async () => {
    const states = await findAllStates();
    expect(states).toHaveLength(2);
    expect(states[0].nome).toBe('Rio de Janeiro');
    expect(states[1].nome).toBe('São Paulo');
  });

  it('should find all cities for a given state UF', async () => {
    const cities = await findCitiesByStateUF('SP');
    expect(cities).toHaveLength(2);
    expect(cities.map(c => c.nome)).toContain('Campinas');
    expect(cities.map(c => c.nome)).toContain('São Paulo');
  });

  it('should return an empty array for a state with no cities', async () => {
    const cities = await findCitiesByStateUF('MG'); // Unregistered state
    expect(cities).toHaveLength(0);
  });
});
