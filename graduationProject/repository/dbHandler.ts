import { Pool } from "mysql2/promise";

class DBHandler {
  public dbConnection: Pool;

  constructor(dbConnection: Pool) {
    this.dbConnection = dbConnection;
  }

  public async executeQuery(query: string, params: any[]): Promise<any> {
    try {
      const [results] = await this.dbConnection.execute(query, params);
      return results;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }
}

export default DBHandler;
