import { Socket } from "socket.io";
import { Pool } from "mysql2/promise";
import dbConnection from "../dataBase/db";
import Sentiment from "sentiment";
import UtilityService from "../utility/utility";
import DBHandler from "../repository/dbHandler";
import { Common_Queries, Delete_Queries } from "../constant/dbQueries";

interface LoginPayload {
  name: string;
  password: string;
}

interface User {
  userId: number;
  userName: string;
  userPassword: string;
}

const sentiment = new Sentiment();
let userDetails = {};
class CommonService {
  public dbConnection: Pool;
  private utilityService: UtilityService;
  dbHandler: DBHandler;
  constructor(dbConnection: Pool) {
    this.dbConnection = dbConnection;
    this.utilityService = new UtilityService(dbConnection);
    this.dbHandler = new DBHandler(dbConnection);
  }

  public setupSocketHandlers(socket: Socket) {
    socket.on("getRole", this.getRole.bind(this));
    socket.on("viewMenu", this.viewMenu.bind(this));
    socket.on("login", this.authenticateUser.bind(this));
  }

  public async getRole(roleId: number) {
    console.log("fetching role...");
    try {
      const rows: any[] = await this.dbHandler.executeQuery(
        Common_Queries.GET_ROLE,
        [roleId]
      );

      return { success: true, roleName: rows[0]?.roleName };
    } catch (err) {
      console.error("invalid roleid:", err);
      return { success: false };
    }
  }

  public async viewMenu() {
    console.log("Viewing menu...");
    try {
      const [rows]: any[] = await this.dbConnection.query(
        Common_Queries.VIEW_MENU
      );
      return { success: true, menuItems: rows };
    } catch (err) {
      console.error("Error viewing menu:", err);
      return { success: false };
    }
  }

  public async giveFeedback({ userId, itemId, comment, rating }: any) {
    try {
      const feedbackDate = new Date();

      await dbConnection.query(Common_Queries.GIVE_FEEDBACK, [
        itemId,
        userId,
        rating,
        comment,
        feedbackDate,
      ]);
      return { success: true };
    } catch (err: any) {
      console.error(
        "Error giving feedback:",
        err?.sqlMessage === "Duplicate entry '1' for key 'reviews.PRIMARY'"
          ? "User has already submitted for today"
          : err?.sqlMessage
      );
      return { success: false };
    }
  }

  public async authenticateUser({ name, password }: LoginPayload) {
    try {
      const [rows] = await this.dbConnection.query(
        Common_Queries.AUTHENTICATE_USER,
        [name, password]
      );
      const users = rows as User[];
      if (users[0]) {
        userDetails = users[0];
        return { success: true, user: users[0] };
      } else {
        return { success: false, message: "error:User doesnt exist" };
      }
    } catch (err) {
      console.error("Error logging in:", err);
      return { success: false, message: "Error occured while logging in...." };
    }
  }

  public getUserDetails() {
    return userDetails;
  }

  public async getFeedbackResult() {
    let resultedArray: any = [];
    const [rows]: any[] = await dbConnection.query(
      Common_Queries.GET_FEEDBACK_RESULT
    );

    const uniqueItemIds: any = this.utilityService.getUniqueItemIds(rows);

    resultedArray = await Promise.all(
      uniqueItemIds?.map(async (itemid: any) => {
        const itemName: any = await this.utilityService.getItemName(itemid);
        const averageRating = this.utilityService.calculateAverageRating(
          itemid,
          rows
        );
        const concatenatedComments = this.utilityService.concatenateComments(
          itemid,
          rows
        );

        return {
          itemid: itemid,
          itemName: itemName,
          averageRating: averageRating,
          concatenatedComments: concatenatedComments,
        };
      })
    );

    return resultedArray;
  }

  public async inserNotificaiton(roleId: any, message: string) {
    const date = new Date();
    await this.dbConnection.query(Common_Queries.INSERT_NOTIFICATION, [
      roleId,
      message,
      date,
    ]);
    return { success: true, message: "Notification inserted successfully" };
  }
  public async notifyUser() {
    try {
      const { roleId }: any = userDetails || {};
      const [notifications]: any = await this.dbConnection.query(
        Common_Queries.NOTIFY_USER,
        [roleId]
      );
      return { success: true, notifications: notifications };
    } catch {
      return { success: false, message: "eror occured" };
    }
  }
  public async startRecommendationEngine() {
    console.log("starting recommendation engine");
    const feedbackResult: any = await this.getFeedbackResult();
    await this.getRecommendedTable(feedbackResult);
    await this.getDiscardedTable(feedbackResult);
  }
  public async setEventScheduler() {
    try {
      await dbConnection.query(Common_Queries.EVENT_SCHEDULER);
      console.log("Event scheduler enabled successfully.");

      await dbConnection.query(Delete_Queries.SCHEDULE_DELETE_Notifications);
      await dbConnection.query(Delete_Queries.SCHEDULE_REVIEWS_DELETE);
    } catch (error) {
      console.error("Error clearing table:", error);
    }
  }

  public async getRecommendedTable(feedbackResult: any) {
    const recommendedTable = await Promise.all(
      feedbackResult
        ?.filter((foodItem: any) => {
          const sentiments = sentiment.analyze(foodItem?.concatenatedComments);
          return sentiments?.score > 7 || foodItem?.averageRating > 3.5;
        })
        .map((foodItem: any) => {
          return {
            itemid: foodItem?.itemid,
            foodName: foodItem?.itemName,
          };
        })
    );

    return recommendedTable;
  }

  public async getUserPreference() {
    try {
      const { userID }: any = userDetails || {};

      const [rows]: any = await dbConnection.query(
        Common_Queries.GET_USER_PREFERENCE,
        [userID]
      );
      return rows[0];
    } catch (error) {}
  }
  public async getPrefferedTable() {
    try {
      if (await this.isUserHadPrefrence()) {
        console.log("userexists");
        const preferences = await this.getUserPreference();

        const { spicy, cuisine, sweettooth, isveg } = preferences;

        const [rows]: any = await dbConnection.query(
          Common_Queries.GET_PREFERED_TABLE,
          [spicy, cuisine, sweettooth, isveg]
        );
        return {
          success: true,
          preferences: rows,
          message: "Here is your preferred food in sorted way....",
        };
      } else {
        return {
          success: false,
          message:
            "you dont have any preference, Please submit your preferences....",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "Error occured while fetching the preferred food items",
      };
    }
  }
  public async isUserHadPrefrence() {
    const { userID }: any = userDetails || {};

    const [isUserSubmittedPreference]: any = await this.dbConnection.query(
      Common_Queries.CHECK_USER_SUBMITTED_PREFERENCE,
      [userID]
    );

    return isUserSubmittedPreference[0]?.user_status;
  }
  public async getDiscardedTable(feedbackResult: any) {
    const discardedTable = await Promise.all(
      feedbackResult
        ?.filter((foodItem: any) => {
          const sentiments = sentiment.analyze(foodItem?.concatenatedComments);
          return sentiments?.score < 4 || foodItem?.averageRating < 3.5;
        })
        .map((foodItem: any) => {
          return {
            itemid: foodItem?.itemid,
            foodName: foodItem?.itemName,
          };
        })
    );

    return discardedTable;
  }
}

export default CommonService;
