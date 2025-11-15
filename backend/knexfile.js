// knexfile.js

module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: "./data/tasks.db3", // database එක හැදෙන තැනයි නමයි
    },
    useNullAsDefault: true,
    migrations: {
      directory: "./data/migrations", // database table හදන files තියෙන තැන
    },
  },
};
