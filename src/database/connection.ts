import knex, { Knex } from 'knex';
import path from 'path';
import fs from 'fs/promises';
// Importa a função de criação de config do knexfile
import { createConfig } from '../knexfile';

/**
 * Cria e retorna uma instância do Knex. Garante que o diretório do banco de dados exista.
 * @param customDbPath - Caminho opcional para o arquivo de banco de dados. Se não for fornecido, usa o padrão.
 * @returns Uma instância do Knex.
 */
export async function getDbConnection(customDbPath?: string): Promise<Knex> {
  // Gera a configuração usando a lógica centralizada
  const config = createConfig(customDbPath);

  // Verificação de tipo para garantir que a conexão é um objeto com 'filename'.
  // Isso satisfaz o compilador TypeScript e torna o código mais robusto.
  if (typeof config.connection !== 'object' || !config.connection || !('filename' in config.connection)) {
    throw new Error('Invalid database configuration: connection object with filename is required.');
  }

  // Agora o TypeScript sabe que config.connection é um objeto com a propriedade 'filename'.
  const dbPath = config.connection.filename as string;
  const dbDir = path.dirname(dbPath);

  // Garante que o diretório exista ANTES de continuar.
  await fs.mkdir(dbDir, { recursive: true });

  return knex(config);
}