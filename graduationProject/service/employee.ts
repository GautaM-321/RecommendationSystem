import { Pool } from "mysql2/promise";
import DBHandler from "../repository/dbHandler";
import { Employee_Queries } from "../constant/dbQueries";

class EmployeeService {
  private dbConnection: Pool;
  dbHandler: DBHandler;

  constructor(dbConnection: Pool) {
    this.dbConnection = dbConnection;
    this.dbHandler = new DBHandler(dbConnection);
  }

  public async voteForItems({ itemId }: { itemId: any }) {
    try {
      await this.dbHandler.executeQuery(Employee_Queries.VOTE_ITEMS, [
        +itemId,
        1,
      ]);

      return { success: true, message: "Successfully voted" };
    } catch (err) {
      console.error("Error voting for items:", err);
      return { success: false, message: "Error occured while voting" };
    }
  }

  public async viewRolledOutItems() {
    try {
      const [rows] = await this.dbConnection.query(
        Employee_Queries.VIEW_ROLLED_OUT_ITEMS
      );
      return { success: true, rolledOutItems: rows };
    } catch (err) {
      console.error("Error viewing rolled-out items:", err);
      return { success: false, message: "failed to fetch the data" };
    }
  }

  public async submitFoodPreference({
    isUpdate,
    userID,
    spicy,
    cuisine,
    sweettooth,
    isveg,
  }: {
    isUpdate: any;
    userID: any;
    spicy: any;
    cuisine: any;
    sweettooth: any;
    isveg: any;
  }) {
    try {
      
      if (isUpdate === 1) {
     
        await this.dbConnection.query(
          Employee_Queries.UPDATE_FOOD_PREFERENCE,
            [userID,spicy,cuisine,sweettooth,isveg]
        );
        return { success: true, message: "preference updated successfully" };
    } else {
        await this.dbConnection.query(
            Employee_Queries.INSERT_FOOD_PREFERENCE,
            [userID, spicy, cuisine, sweettooth, isveg]
        );
        return { success: true, message: "preference submitted successfully" };
    }
    
      
    } catch (error) {
      return {
        success: false,
        message: `error occured while submitting${error}`,
      };
    }
  }
}

export default EmployeeService;
