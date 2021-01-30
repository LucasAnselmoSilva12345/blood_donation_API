import Knex from 'knex';

export async function up(knex: Knex) {
  return knex.schema.createTable('dice_plus', (table) => {
    table.increments('id').primary();
    table.integer('week_day').notNullable();
    table.integer('horario').notNullable();
    table.integer('to').notNullable();

    table
      .integer('dice_id')
      .notNullable()
      .references('id')
      .inTable('dice')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
  });
}

export async function down(knex: Knex) {
  return knex.schema.dropTable('dice_plus');
}
