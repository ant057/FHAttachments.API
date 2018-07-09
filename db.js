const sql = require("mssql")

const dbConfig = {
    user:  "test",
    password: "test123!",
    database: "FHARGO",
    server: "localhost",
    port: "1434"
};

const pool = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL')
    return pool
  })
  .catch(err => console.error('Database Connection Failed!', err))

module.exports = {
    sql, pool
}