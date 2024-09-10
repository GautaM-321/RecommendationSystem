import mysql, { ResultSetHeader } from "mysql2";
import { Socket } from "socket.io";
import { Admin_Queries, Delete_Queries } from "../constant/dbQueries";
import CommonService from "./commonService";

class AdminService {
  public dbConnection: mysql.Connection;
  public socket: Socket;

  constructor(dbConnection: any, socket: any) {
    this.dbConnection = dbConnection;
    this.socket = socket;
  }

  public async handleViewMenu() {
    console.log("Viewing menu...");
    try {
      const [rows]: any = await this.dbConnection.query(
        Admin_Queries.VIEW_MENU
      );

      const menuItems: any = rows;
      return { success: true, menuItems };
    } catch (err) {
      console.error("Error viewing menu:", err);
      return { success: false };
    }
  }
  public async handleAddMenuItem({
    name,
    price,
    availability,
    mealTypeId,
  }: any) {
    try {
      const [results]: any = await this.dbConnection.query(
        Admin_Queries.ADD_MENU_ITEM,
        [name, price, availability, mealTypeId]
      );
      const result = results as ResultSetHeader;

      return { success: true, message: "Item added successfully" };
    } catch (err) {
      console.error("Error adding menu item:", err);
      return { success: false, message: "error occured while adding item" };
    }
  }

  public async handleUpdateMenuItem({ id, name, price, availability }: any) {
    try {
      await this.dbConnection.query(
        "UPDATE foodItems SET itemName = ?, itemPrice = ?, itemAvailabilityStatus = ? WHERE itemId = ?",
        [name, price, availability, id]
      );
      
      
      return { success: true, message: "item updated successfully" };
    } catch (err) {
      console.error("Error updating menu item:", err);
      return { success: false, message: "error occurred while updating" };
    }
  }

  public async handleDeleteMenuItem(id: number) {
    try {
      await this.dbConnection.query(Delete_Queries.DELETE_MENU_ITEM, [id]);
      await this.dbConnection.query(Delete_Queries.DELETE_FROM_REVIEWS, [id]);
      await this.dbConnection.query(Delete_Queries.DELETE_FROM_ROLLED_OUT_TABLE, [id]);
      await this.dbConnection.query(Delete_Queries.DELETE_FROM_VOTE_TABLE, [id]);
      return { success: true, message: "item has successfully deleted" };
    } catch (err) {
      console.error("Error deleting menu item:", err);
      return {
        success: false,
        message: "error occured id to delete item doesn't exist",
      };
    }
  }
}

export default AdminService;
