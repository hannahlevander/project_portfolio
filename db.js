const sqlite3 = require("sqlite3");

const db = new sqlite3.Database("hannah-portfolio-database.db");

db.run(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS faqs (
    id INTEGER PRIMARY KEY,
    question TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS allFaqs (
    id INTEGER PRIMARY KEY,
    question TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS guestbook (
    id INTEGER PRIMARY KEY,
    name TEXT,
    post TEXT,
    date TEXT
  )
`);

// exports.getAllProjects = function (callback) {
//   const query = `SELECT * FROM projects`;

//   db.all(query, function (error, projects) {
//     callback(error, projects);
//   });
// };

function getAllProjects(callback) {
  const query = `SELECT * FROM projects`;

  db.all(query, function (error, projects) {
    callback(error, projects);
  });
}
