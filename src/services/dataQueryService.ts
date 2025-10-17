import { createObjectCsvWriter } from 'csv-writer';
import { getDbConnection } from '../database/connection';
import logger from '../utils/logger';
import { Estado } from '../index'; // Reutilizando a interface já definida

interface City {
  id: number;
  nome: string;
  estado_id: number;
}

/**
 * Fetches all states from the database.
 * @param dbPath Optional path to the database file.
 * @returns A promise that resolves to an array of state objects.
 */
export async function listStates(dbPath?: string): Promise<Estado[]> {
  const db = await getDbConnection(dbPath);
  try {
    const states = await db('estados').select('id', 'nome', 'uf', 'regiao_nome').orderBy('nome');
    return states;
  } finally {
    await db.destroy();
  }
}

/**
 * Fetches all cities for a given state UF from the database.
 * @param uf The state's UF (e.g., 'SP').
 * @param dbPath Optional path to the database file.
 * @returns A promise that resolves to an array of city objects.
 */
export async function listCitiesByUF(uf: string, dbPath?: string): Promise<any[]> {
  const db = await getDbConnection(dbPath);
  try {
    const state = await db('estados').where('uf', uf.toUpperCase()).first();
    if (!state) {
      logger.warn(`State with UF "${uf}" not found.`);
      return [];
    }
    const cities = await db('cidades').where('estado_id', state.id).select('id', 'nome').orderBy('nome');
    return cities;
  } finally {
    await db.destroy();
  }
}

/**
 * Exports all states and their cities from the database to a CSV file.
 * @param outputFilePath The path where the CSV file will be saved.
 * @param dbPath Optional path to the database file.
 */
export async function exportToCSV(outputFilePath: string, dbPath?: string): Promise<void> {
  const db = await getDbConnection(dbPath);
  try {
    const data: any[] = await db('estados') // Tipagem temporária para 'data' se a estrutura for complexa
      .join('cidades', 'estados.id', '=', 'cidades.estado_id')
      .select('estados.uf', 'estados.nome as estado_nome', 'cidades.nome as cidade_nome')
      .orderBy('estados.uf', 'cidades.nome');

    const csvWriter = createObjectCsvWriter({
      path: outputFilePath,
      header: [
        { id: 'uf', title: 'ESTADO_UF' },
        { id: 'estado_nome', title: 'ESTADO_NOME' },
        { id: 'cidade_nome', title: 'CIDADE_NOME' },
      ],
    });

    await csvWriter.writeRecords(data);
    logger.info(`Data successfully exported to ${outputFilePath}`);
  } finally {
    await db.destroy();
  }
}
