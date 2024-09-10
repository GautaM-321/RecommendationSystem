import readline from "readline";
import ChefService from "../service/chef";
import CommonService from "../service/commonService";
import UtilityService from "../utility/utility";
class ChefController {
  private rl: readline.Interface;
  private chefService: ChefService;
  private commonService: CommonService;
  private utilityService: UtilityService;
  constructor(
    chefService: ChefService,
    commonService: CommonService,
    utilityService: UtilityService,
    rl: readline.Interface
  ) {
    this.chefService = chefService;
    this.commonService = commonService;
    this.utilityService = utilityService;
    this.rl = rl;
  }

  promptChef() {
    console.log("\nChoose an operation for role: chef");
    console.log("1. View Top Recommendation");
    console.log("2. View Notifications");
    console.log("3. Give rolled out items");
    console.log("4. See available food items");
    console.log("5. View discarded Menu");
    console.log("6. Remove Discarded Menu Item");
    console.log("7. View monthly feedback report");
    console.log("8.View most Voted Items for rolled out items");
    console.log("9. logout");

    this.rl.question("Enter your choice: \n", (choice) => {
      this.handleChefChoice(choice);
    });
  }

  private async handleChefChoice(choice: string) {
    switch (choice) {
      case "1":
        const feedbackTable = await this.commonService.getFeedbackResult();
        const recommendedTable = await this.commonService.getRecommendedTable(
          feedbackTable
        );

        console.table(recommendedTable);

        this.promptChef();

        break;
      case "2":
        this.commonService.notifyUser().then((response: any) => {
          response.success
            ? response.notifications.length !== 0
              ? console.table(response.notifications)
              : console.log("No Notifcations for chef")
            : console.log(response.message);

          this.promptChef();
        });

        break;

      case "3":
        this.rl.question("Enter item id:", async (itemid: any) => {
          const itemName: any = await this.utilityService.getItemName(itemid);
          if (!itemName) {
            console.log("Item with this item id doesnt exist");

            this.promptChef();
          }
          console.log("Item name is", itemName);
          this.rl.question("Is this food is spicy(0/1):", (isSpicy) => {
            this.rl.question(
              "What is the cuisine for this item:",
              (cuisine) => {
                this.rl.question(
                  "Is this food is sweet or not(0/1):",
                  (isSweet) => {
                    this.rl.question("Is this food is veg(0/1):", (isVeg) => {
                      this.chefService
                        .handleFillRolledItems({
                          itemid,
                          isSpicy,
                          cuisine,
                          isSweet,
                          isVeg,
                        })
                        .then(async (response) => {
                          console.log(response.message);
                          await this.commonService.inserNotificaiton(
                            1,
                            `Item with itemName ${itemName} has been rolled out by chef`
                          );
                          this.promptChef();
                        });
                    });
                  }
                );
              }
            );
          });
        });

        break;
      case "4":
        this.chefService.handleSeeAvailabilityStatus().then((response) => {
          response.success
            ? console.table(response.foodItems)
            : console.log("error occurred");
          this.promptChef();
        });
        break;
      case "5":
        const reviewTable = await this.commonService.getFeedbackResult();
        const discardedTable = await this.commonService.getDiscardedTable(
          reviewTable
        );
        discardedTable.length
          ? console.table(discardedTable)
          : "No item is present in discarded table";

        this.promptChef();
        break;
      case "6":
        this.rl.question(
          "Enter the item id to discard from menu: ",
          async (itemid) => {
            const itemName: any = await this.utilityService.getItemName(itemid);
            console.log("Item name is", itemName);
            const response: any =
              await this.chefService.handledeleteDiscardedItem(itemid);

            response.success
              ? console.log(response.message)
              : console.log(response.message);
            this.promptChef();
          }
        );

        break;
      case "7":
        const feedback: any = this.chefService.handleViewMonthlyFeedback();
        console.log(feedback.message);
        this.promptChef();
        break;
      case "8":
        this.utilityService.getMostVotedItems().then((response) => {
          response?.success
            ? (console.log(response.message), console.table(response?.rows))
            : console.log(response?.message);
          this.promptChef();
        });
        break;
      case "9":
        this.rl.close();
        console.log("Goodbye!");

        break;
      default:
        console.log("Invalid choice, please try again.");
        this.promptChef();

        break;
    }
  }
}

export default ChefController;
