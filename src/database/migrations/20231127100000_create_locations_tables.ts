import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('estados', (table) => {
    table.integer('id').primary();
    table.string('uf', 2).notNullable().unique();
    table.string('nome').notNullable();
  });

  await knex.schema.createTable('cidades', (table) => {
    table.integer('id').primary();
    table.string('nome').notNullable();
    table.integer('estado_id').unsigned().notNullable().references('id').inTable('estados');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('cidades');
  await knex.schema.dropTableIfExists('estados');
}
