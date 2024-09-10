import mysql from "mysql2";
import { Socket } from "socket.io";
import { Chef_Queries, Delete_Queries } from "../constant/dbQueries";

interface MenuItem {
  itemId: number;
  itemName: string;
  itemPrice: number;
  itemAvailabilityStatus: "available" | "unavailable";
  mealTypeId: number;
}

class ChefService {
  public dbConnection: mysql.Connection;
  public socket: Socket;

  constructor(dbConnection: any, socket: any) {
    this.dbConnection = dbConnection;
    this.socket = socket;
  }

  public handleViewMonthlyFeedback() {
    try {
      return { success: true, message: Chef_Queries.VIEW_MONTHLY_FEEDBACK };
    } catch (err) {
      return {
        success: false,
        message: "Error while fetching the monthly feedback",
      };
    }
  }

  public async handleFillRolledItems({
    itemid,
    isSpicy,
    cuisine,
    isSweet,
    isVeg,
  }: any) {
    try {
       await this.dbConnection.query(
        Chef_Queries.FILL_ROLLED_OUT_ITEMS,
        [itemid, isSpicy, cuisine, isSweet, isVeg]
      );
      return {
        success: true,
        message: "rolled out item is successfully submited",
      };
    } catch (err) {
      return {
        success: false,
        message: `Error filling rolled out items:${err}`,
      };
    }
  }

  public async handledeleteDiscardedItem(itemid: any) {
    try {
      await this.dbConnection.query(Delete_Queries.DELETE_MENU_ITEM, [itemid]);
      await this.dbConnection.query(Delete_Queries.DELETE_FROM_REVIEWS, [itemid]);
      await this.dbConnection.query(Delete_Queries.DELETE_FROM_ROLLED_OUT_TABLE, [itemid]);
      await this.dbConnection.query(Delete_Queries.DELETE_FROM_VOTE_TABLE, [itemid]);

      return { success: true, message: "item has successfully deleted" };
    } catch (err) {
      console.error("Error deleting menu item:", err);
      return {
        success: false,
        message: "error occured id to delete item doesn't exist",
      };
    }
  }

  public async handleSeeAvailabilityStatus() {
    try {
      const [rows]: any = await this.dbConnection.query(
        Chef_Queries.SEE_AVAILABLE_STATUS
      );
      const foodItems: MenuItem[] = rows;
      return { success: true, foodItems };
    } catch (err) {
      console.error("Error fetching availability status:", err);
      return { success: false };
    }
  }
}

export default ChefService;
