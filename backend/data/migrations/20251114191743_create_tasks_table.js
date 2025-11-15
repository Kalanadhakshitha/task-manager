// The file inside data/migrations (e.g., 20251114_..._create_tasks_table.js)

exports.up = function (knex) {
  return knex.schema.createTable("tasks", (tbl) => {
    tbl.increments("id");
    tbl.string("title", 255).notNullable();
    tbl.text("description");
    tbl.boolean("is_completed").defaultTo(false);
  });
};

exports.down = function (knex) {
  // table delete code
  return knex.schema.dropTableIfExists("tasks");
};
