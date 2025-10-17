import { createObjectCsvWriter } from 'csv-writer';
import { getDbConnection } from '../database/connection';
import logger from '../utils/logger';

// Interface sugerida para tipar os dados da cidade
interface City {
  id: number;
  nome: string;
  estado_id: number;
  // Adicione aqui outros campos relevantes da sua query de cidades
}

/**
 * Fetches all cities for a given state UF from the database.
 * @param uf The state's UF (e.g., 'SP').
 * @param dbPath Optional path to the database file.
 * @returns A promise that resolves to an array of city objects.
 */
export async function listCitiesByUF(uf: string, dbPath?: string): Promise<City[]> {
  const db = await getDbConnection(dbPath);
  try {
    const state = await db('estados').where('uf', uf.toUpperCase()).first();
    if (!state) {
      logger.warn(`State with UF "${uf}" not found.`);
      return [];
    }
    // O retorno deve ser tipado como um array de City
    const cities = await db('cidades').where('estado_id', state.id).orderBy('nome');
    return cities as City[];
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
    // ... restante da lógica de exportação ...
    // Note que todos os parâmetros (outputFilePath e dbPath) estão tipados como string/opcional
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
