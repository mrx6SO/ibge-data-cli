/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('estados', function(table) {
      // Use the ID from IBGE itself as the primary key
      table.integer('id').primary();
      table.string('uf', 2).notNullable().unique();
      table.string('nome').notNullable();
      table.string('regiao_nome').notNullable();

      // Automatically adds 'created_at' and 'updated_at' fields
      table.timestamps(true, true);
    })
    .createTable('cidades', function(table) {
      table.integer('id').primary();
      table.string('nome').notNullable();

      // Foreign key to relate with the 'estados' table
      table.integer('estado_id')
        .notNullable()
        .references('id')
        .inTable('estados')
        .onDelete('CASCADE'); // If a state is deleted, its cities will be too.

      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // The removal order is the reverse of creation to respect foreign keys
  return knex.schema
    .dropTable('cidades')
    .dropTable('estados');
};