import { syncAllData } from './services/dataSyncService'; // .ts is inferred
import { listCitiesByUF, exportToCSV } from './services/dataQueryService';

/**
 * Interface para o objeto de Estado, conforme retornado pelas funções da API.
 */
export interface Estado {
  id: number;
  uf: string;
  nome: string;
  regiao_nome: string;
}

/**
 * Interface para o objeto de Município, conforme retornado pelas funções da API.
 */
export interface Municipio {
  id: number;
  nome: string;
  estado_id: number;
}

/**
 * Opções de configuração para a API programática.
 */
export interface IBGEDataCLIOptions {
  /**
   * Caminho para o diretório onde o banco de dados SQLite será armazenado.
   * Se não for fornecido, o padrão é `~/.ibge-data-cli/`.
   */
  dbPath?: string;
}

/**
 * Sincroniza todos os dados de estados e municípios da API do IBGE
 * para o banco de dados local.
 * @param options - Opções de configuração, como o caminho do banco de dados.
 */
async function importData(options: IBGEDataCLIOptions = {}): Promise<void> {
  return syncAllData(options.dbPath);
}

/**
 * Lista todos os municípios de um determinado estado (UF).
 * @param uf - A sigla do estado (ex: 'SP', 'RJ').
 * @param options - Opções de configuração, como o caminho do banco de dados.
 * @returns Uma promessa que resolve para um array de objetos de município.
 */
async function getCitiesByUF(uf: string, options: IBGEDataCLIOptions = {}): Promise<Municipio[]> {
  return listCitiesByUF(uf, options.dbPath);
}

/**
 * Exporta todos os estados e municípios para um arquivo CSV.
 * @param outputFilePath - O caminho do arquivo CSV a ser criado.
 * @param options - Opções de configuração, como o caminho do banco de dados.
 */
async function exportDataToCSV(outputFilePath: string, options: IBGEDataCLIOptions = {}): Promise<void> {
  return exportToCSV(outputFilePath, options.dbPath);
}

export { importData, getCitiesByUF, exportDataToCSV };