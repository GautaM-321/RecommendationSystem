import { Utility_Queries } from "../constant/dbQueries";
import dbConnection from "../dataBase/db";
import { Pool } from "mysql2/promise";

interface Review {
  itemid: number;
  userid: number;
  rating: string;
  comment: string;
  date: Date;
}

class UtilityService {
  public dbConnection: Pool;

  constructor(dbConnection: Pool) {
    this.dbConnection = dbConnection;
  }

  public async getItemName(itemid: any): Promise<string | undefined> {
    const itemName: any = await this.dbConnection.query(
      Utility_Queries.GET_ITEM_NAME + itemid
    );
    return itemName[0]?.[0]?.itemName;
  }
  public async getItemMealTypeId(itemid: any): Promise<string | undefined> {
    const mealId: any = await this.dbConnection.query(
      Utility_Queries.GET_MEAL_TYPE_ID + itemid
    );
    return mealId[0]?.[0]?.mealTypeId;
  }
  public async getItemMealType(mealId: any): Promise<string | undefined> {
    const mealType: any = await this.dbConnection.query(
      Utility_Queries.GET_MEAL_TYPE + mealId
    );
    return mealType[0]?.[0]?.mealType;
  }

  public getUniqueItemIds(reviews: Review[]): number[] {
    const itemIds = reviews.map((review) => review.itemid);
    return Array.from(new Set(itemIds));
  }

  public calculateAverageRating(itemId: number, reviews: Review[]): number {
    const filteredReviews = reviews.filter(
      (review) => review.itemid === itemId
    );
    const totalRating = filteredReviews.reduce(
      (acc, review) => acc + parseFloat(review.rating),
      0
    );
    return totalRating / filteredReviews.length;
  }

  public async getMostVotedItems() {
    try {
      const [rows] = await dbConnection.query(
        Utility_Queries.GET_MOST_VOTED_TIEMS
      );

      return {
        success: true,
        message: "Top 5 items by vote count:",
        rows: rows,
      };
    } catch (error) {
      return {
        success: false,
        message: "Error occurred while fetching the data",
      };
    }
  }
  public isResultIsEmpty(result:any){
    if(result){
      return true
    }
    else{
      return false
    }
  }
  public concatenateComments(itemId: number, reviews: Review[]): string {
    const filteredReviews = reviews.filter(
      (review) => review.itemid === itemId
    );
    return filteredReviews.map((review) => review.comment).join(" ");
  }
}

export default UtilityService;
