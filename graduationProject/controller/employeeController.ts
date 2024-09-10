import readline from "readline";
import CommonService from "../service/commonService";
import EmployeeService from "../service/employee";
import UtilityService from "../utility/utility";

class EmployeeController {
  private rl: readline.Interface;
  private commonService: CommonService;
  private employeeService: EmployeeService;
  private utilityService: UtilityService;

  constructor(
    commonService: CommonService,
    employeeService: EmployeeService,
    rl: readline.Interface,
    utilityService: UtilityService
  ) {
    this.commonService = commonService;
    this.employeeService = employeeService;
    this.rl = rl;
    this.utilityService = utilityService;
  }

  promptEmployee() {
    console.log("\nChoose an operation for role: employee");
    console.log("1. View Menu");
    console.log("2. View Rolled out Menu ");
    console.log("3. Submit Feedback");
    console.log("4. View Notifications");
    console.log("5. Vote for menu");
    console.log("6. Submit food prefrence");
    console.log("7. See preferred food");
    console.log("8. Logout");

    this.rl.question("Enter your choice: \n", (choice) => {
      this.handleEmployeeChoice(choice);
    });
  }

  private async handleEmployeeChoice(choice: string) {
    const userDetails: any = await this.commonService.getUserDetails();
    const { userID, userName }: any = userDetails || {};
    switch (choice) {
      case "1":
        const menu: any = await this.commonService.viewMenu();
        menu.success
          ? console.table(menu.menuItems)
          : console.log(menu.message);
        this.promptEmployee();
        break;
      case "2":
        this.employeeService.viewRolledOutItems().then((response) => {
          console.table(response?.rolledOutItems);
          this.promptEmployee();
        });

        break;
      case "3":
        this.rl.question(
          "Enter item ID to give feedback on: ",
          async (itemId) => {
            const itemName: any = await this.utilityService.getItemName(itemId);
            if (!itemName) {
              console.log(
                "this itemid doesnt exist .........., please enter a valid id"
              );

              this.promptEmployee();
            } else {
              console.log(`item name is:${itemName}`);
              this.rl.question("Enter your comment: ", (comment) => {
                this.rl.question("Enter your rating (1-5): ", (rating) => {
                  this.commonService
                    .giveFeedback({
                      userId: parseInt(userID),
                      itemId: parseInt(itemId),
                      comment,
                      rating: parseInt(rating),
                    })
                    .then((response) => {
                      response.success
                        ? console.log(`Feedback submitted successfully`)
                        : console.log(
                            "Some error occurred while sending feedback"
                          );
                      this.promptEmployee();
                    });
                });
              });
            }
          }
        );

        break;
      case "4":
        this.commonService.notifyUser().then((response: any) => {
          response.success
            ? response.notifications
              ? console.table(response.notifications)
              : console.log("No notifications for you right now")
            : console.log(response.message);
          this.promptEmployee();
        });
        break;
      case "5":
        this.rl.question("Enter the itemid", async (itemId) => {
          const itemName: any = await this.utilityService.getItemName(itemId);
          if (itemName) {
            console.log(`item name is ${itemName}`);
            this.employeeService
              .voteForItems({ itemId })
              .then((response: any) => {
                console.log(response.message);
                this.promptEmployee();
              });
          } else {
            console.log(`Item doesnt exist with item id ${itemId}`);
            this.promptEmployee();
          }
        });

        break;
      case "6":
        console.log("Please submit your preference", userName);
        const isUpdate: any = await this.commonService.isUserHadPrefrence();
        this.rl.question("Do you like spicy food(0/1):", (spicy) => {
          this.rl.question("What cuisine do you like:", (cuisine) => {
            this.rl.question("Are you a sweettooth(1/0):", (sweettooth) => {
              this.rl.question("Are you vegetarian(1/0)", (isveg) => {
                this.employeeService
                  .submitFoodPreference({
                    isUpdate,
                    userID,
                    spicy,
                    cuisine,
                    sweettooth,
                    isveg,
                  })
                  .then((response) => {
                    console.log(response?.message);
                    this.promptEmployee();
                  });
              });
            });
          });
        });

        break;

      case "7":
        this.commonService.getPrefferedTable().then((response: any) => {
          response.success
            ? (console.log(response.message),
              response.preferences
                ? console.table(response.preferences)
                : console.log(response.message))
            : console.log(response.message);
          this.promptEmployee();
        });
        break;
      case "8":
        this.rl.close();

        console.log("Goodbye!");

        break;
      default:
        console.log("Invalid choice, please try again.");
        this.promptEmployee();
        break;
    }
  }
}

export default EmployeeController;
