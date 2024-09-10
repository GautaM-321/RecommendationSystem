import { createPool } from "mysql2/promise";
import { config } from "../constant/config";

const dbConnection = createPool({
  host: config.HOST_NAME,
  user: config.USER_NAME,
  password: config.PASSWORD,
  database: config.DATABASE,

  connectionLimit: 100,
});

dbConnection
  .getConnection()
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err.stack);
  });
export default dbConnection;
