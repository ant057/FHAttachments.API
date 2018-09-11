const sql = require("mssql")

const dbConfig = {
    user:  "test",
    password: "test123!",
    database: "FHARGO",
    server: "localhost",
    port: "1434",
    connectionTimeout: 100000,
    requestTimeout : 100000
};

const dbConfig2 = {
  user:  "filehandleremer",
  password: "filehandleremer",
  database: "FHARGO",
  server: "agii-sqltw06",
  connectionTimeout: 100000,
  requestTimeout : 10000
};

const pool = new sql.ConnectionPool(dbConfig2)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL')
    return pool
  })
  .catch(err => console.error('Database Connection Failed!', err))

module.exports = {
    sql, pool 
}