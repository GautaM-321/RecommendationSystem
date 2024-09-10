import readline from "readline";
import AdminService from "../service/admin";
import CommonController from "./commonController";
import CommonService from "../service/commonService";
import UtilityService from "../utility/utility";
class AdminController {
  private rl: readline.Interface;
  private adminService: AdminService;
  private commonService: CommonService;
  private utilityService: UtilityService;
  public commonController = CommonController;
  
  constructor(
    adminService: AdminService,
    commonSevice: CommonService,
    rl: readline.Interface,
    utilityService:UtilityService,
  ) {
    this.adminService = adminService;
    this.commonService = commonSevice;
    this.rl = rl;
    this.utilityService=utilityService;
    
  }

  promptAdmin() {
    console.log("\nChoose an operation for role: admin");
    console.log("1. View Menu");
    console.log("2. Add food into Menu Item");
    console.log("3. Update Menu Item");
    console.log("4. Delete Menu Item");
    console.log("5. logout");

    this.rl.question("Enter your choice: ", (choice) => {
      this.handleAdminChoice(choice);
    });
  }

  private async handleAdminChoice(choice: string) {
    switch (choice) {
      case "1":
        const result: any = await this.adminService.handleViewMenu();
        
        console.table(result.menuItems);
        this.promptAdmin();
        break;
      case "2":
        this.rl.question("Enter item name: ", (name) => {
          this.rl.question("Enter item price: ", (price) => {
            this.rl.question("Is the item available: ", (availability) => {
              this.rl.question("enter meal type id:", async (mealTypeId) => {
                const result = await this.adminService.handleAddMenuItem({
                  name,
                  price,
                  availability,
                  mealTypeId,
                });
                console.log(`${result.message}`);
                await this.commonService.inserNotificaiton(
                  2,
                  `Item with item name ${name} has been added`
                );
                this.promptAdmin();
              });
            });
          });
        });
        break;
      case "3":
        this.rl.question("Enter item ID to update: ", async(id) => {
         const itemName= await this.utilityService.getItemName(id)
         if (itemName) {
          console.log(`item name ${itemName}`);
        } else {
          console.log('no item');
          
          
        }
           
        
          this.rl.question("Enter new item name: ", (name) => {
            this.rl.question("Enter new item price: ", (price) => {
              this.rl.question(
                "Is the item available (available/not available): ",
                async (availability) => {
                  const result: any =
                    await this.adminService.handleUpdateMenuItem({
                      id,
                      name,
                      price,
                      availability,
                    });
                  console.log(result.message);
                  await this.commonService.inserNotificaiton(
                    2,
                    `Item with item name ${name} has been updated`
                  );
                  this.promptAdmin();
                }
              );
            });
          });
        });
        break;
      case "4":
        this.rl.question("Enter item ID to delete: ", async (id: any) => {
          const result = await this.adminService.handleDeleteMenuItem(id);
          console.log(result.message);
          await this.commonService.inserNotificaiton(
            2,
            `Item with itemid ${id} has been deleted`
          );
          this.promptAdmin();
        });
        break;
      case "5":
        this.rl.close();

        console.log("Goodbye!");
        break;
      default:
        console.log("Invalid choice, please try again.");
        this.promptAdmin();
        break;
    }
  }
}

export default AdminController;
