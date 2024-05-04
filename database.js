const Datastore = require("nedb-promise");

const db = {};
db.users = new Datastore({
  filename: "./collections/users.db",
  autoload: true,
});
db.notes = new Datastore({
  filename: "./collections/notes.db",
  autoload: true,
});
db.logins = new Datastore({
  filename: "./collections/logins.db",
  autoload: true,
});

module.exports = db;
