export const Employee_Queries = {
  VOTE_ITEMS: `INSERT INTO voteTable (itemid,  votecount)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE
          votecount = votecount + 1;`,

  VIEW_ROLLED_OUT_ITEMS: "SELECT * FROM rolledoutitems",
  UPDATE_FOOD_PREFERENCE: `REPLACE INTO preference (user_id, spicy, cuisine, sweettooth, isveg)
VALUES (?, ?, ?, ?, ?);`,
  INSERT_FOOD_PREFERENCE: `insert into preference(user_id,spicy,cuisine,sweettooth,isveg) Values(?,?,?,?,?);`,
};

export const Common_Queries = {
  CHECK_USER_SUBMITTED_PREFERENCE: `SELECT CASE 
  WHEN EXISTS (SELECT 1 FROM preference WHERE user_id = ?) 
  THEN true 
  ELSE false 
END AS user_status`,
  GET_ROLE: `SELECT roleName FROM roles WHERE roleId = ?`,
  VIEW_MENU: `SELECT * FROM foodItems WHERE itemAvailabilityStatus = "available"`,
  GIVE_FEEDBACK: `INSERT INTO reviews (itemid,userid, rating, comment, date) VALUES (?, ?, ?, ?,?)`,
  AUTHENTICATE_USER: `SELECT * FROM users WHERE userName = ? AND userPassword = ?`,
  GET_FEEDBACK_RESULT: `SELECT * FROM reviews`,
  NOTIFY_USER: `SELECT message, notification_date FROM notification WHERE roleId = ?`,
  GET_USER_PREFERENCE: `Select * from preference WHERE user_id=?`,
  GET_PREFERED_TABLE: `SELECT *,
  ( (spicy = ?) +
    (cuisine = ?+2) +
    (isSweet = ?) +
    (isveg = ?) +3) AS match_count
FROM rolledoutitems
ORDER BY match_count DESC, spicy DESC, cuisine, isSweet DESC, isveg DESC;`,
  EVENT_SCHEDULER: "SET GLOBAL event_scheduler = ON;",
  INSERT_NOTIFICATION:
    "INSERT INTO notification (roleId, message, notification_date) VALUES (?, ?, ?)",
};

export const Chef_Queries = {
  VIEW_MONTHLY_FEEDBACK: "this is the monthly feedback report",
  FILL_ROLLED_OUT_ITEMS: `INSERT INTO rolledoutitems(itemid, spicy, cuisine,isSweet,isveg) VALUES (?, ?, ?,?,?) `,
  SEE_AVAILABLE_STATUS: `SELECT itemId, itemName, itemPrice, itemAvailabilityStatus, mealTypeId
         FROM foodItems
         WHERE itemAvailabilityStatus = 'available'`,
};

export const Admin_Queries = {
  VIEW_MENU:
    'SELECT * FROM foodItems WHERE itemAvailabilityStatus = "available"',
  ADD_MENU_ITEM:
    "INSERT INTO foodItems(itemName, itemPrice, itemAvailabilityStatus, mealTypeId) VALUES (?, ?, ?, ?)",
  UPDATE_MENU_ITEM:
    "UPDATE foodItems SET itemName = ?, itemPrice = ?, itemAvailabilityStatus = ? WHERE itemId = ?",
};
export const Delete_Queries = {
  DELETE_MENU_ITEM: "DELETE FROM foodItems WHERE itemId = ?",
  DELETE_FROM_FOOD_ITEMS: "DELETE FROM foodItems WHERE itemId = ?",
  DELETE_FROM_REVIEWS: `DELETE FROM reviews WHERE itemid = ?`,
  DELETE_FROM_ROLLED_OUT_TABLE: "DELETE FROM rolledoutitems where itemid=?",
  DELETE_FROM_VOTE_TABLE: " DELETE FROM votetable where itemid=?",
  DELETE_FROM_NOTIFICATIONS: `Delete FROM notification`,
  SCHEDULE_DELETE_Notifications: `
           CREATE EVENT delete_old_notification
ON SCHEDULE EVERY 1 DAY
DO
    DELETE FROM notification
    WHERE notification_date < NOW() - INTERVAL 1 DAY;
        `,
        SCHEDULE_REVIEWS_DELETE:`CREATE EVENT delete_old_review
ON SCHEDULE EVERY 1 DAY
DO
    DELETE FROM reviews
    WHERE  date < NOW() - INTERVAL 1 DAY;`
};

export const Utility_Queries = {
  GET_MOST_VOTED_TIEMS: ` SELECT itemid, votecount
          FROM votetable
          ORDER BY votecount DESC
          LIMIT 10`,
  GET_ITEM_NAME: `SELECT itemName FROM fooditems WHERE itemid=`,
  GET_MEAL_TYPE_ID: `SELECT  mealTypeId FROM fooditems WHERE itemid=`,
  GET_MEAL_TYPE: `SELECT  mealType FROM fooditems WHERE mealtypeID=`,
};
