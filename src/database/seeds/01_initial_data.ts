import { Knex } from 'knex';
import path from 'path';
import fs from 'fs/promises';

// Define a interface para os dados do estado
interface State {
  id: number;
  uf: string;
  nome: string;
}

// Define a interface para os dados da cidade
interface City {
  id: number;
  nome: string;
  estado_id: number;
}

export async function seed(knex: Knex): Promise<void> {
  // Deleta todos os registros existentes
  await knex('cidades').del();
  await knex('estados').del();

  // Define o caminho para o diretório de cache
  const cacheDir = path.resolve(__dirname, '../cache');

  // Lê os dados dos estados do arquivo JSON
  const statesPath = path.join(cacheDir, 'states.json');
  const statesData = await fs.readFile(statesPath, 'utf-8');
  const states: State[] = JSON.parse(statesData);

  // Insere os estados no banco de dados
  await knex('estados').insert(states);

  // Itera sobre cada estado para popular as cidades
  for (const state of states) {
    const citiesPath = path.join(cacheDir, `cities_${state.uf}.json`);
    try {
      const citiesData = await fs.readFile(citiesPath, 'utf-8');
      const cities: City[] = JSON.parse(citiesData);

      // Adiciona o estado_id a cada cidade
      const citiesWithStateId = cities.map(city => ({ ...city, estado_id: state.id }));

      // Insere as cidades em lotes para evitar sobrecarga
      if (citiesWithStateId.length > 0) {
        await knex.batchInsert('cidades', citiesWithStateId, 100);
      }
    } catch (error) {
      // Se o arquivo de cidades não existir, apenas loga um aviso
      console.warn(`Could not find cities for state ${state.uf}. Skipping.`);
    }
  }
}
