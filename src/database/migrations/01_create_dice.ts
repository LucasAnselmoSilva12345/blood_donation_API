import Knex from 'knex';

export async function up(knex: Knex) {
  return knex.schema.createTable('dice', (table) => {
    table.increments('id').primary();
    table.string('blood').notNullable();
    table.string('convenio').notNullable();

    table
      .integer('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
  });
}

export async function down(knex: Knex) {
  return knex.schema.dropTable('dice');
}
