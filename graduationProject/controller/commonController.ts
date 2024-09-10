import { Interface } from "readline";
import CommonService from "../service/commonService";
import AdminController from "../controller/adminController";
import ChefController from "../controller/chefController";
import EmployeeController from "../controller/employeeController";
import UtilityService from "../utility/utility";

class CommonController {
  private commonService: CommonService;
  private rl: Interface;
  private adminController: AdminController;
  private chefController: ChefController;
  private employeeController: EmployeeController;
  utilityService: UtilityService;

  constructor(commonService: CommonService, rl: Interface, adminController: AdminController, chefController: ChefController, employeeController: EmployeeController,utilityService:UtilityService) {
    this.commonService = commonService;
    this.rl = rl;
    this.adminController = adminController;
    this.chefController = chefController;
    this.employeeController = employeeController;
    this.utilityService=utilityService
  }

  public login() {
    this.rl.question("Enter your name: ", (name) => {
      this.rl.question("Enter your password: ", async (password) => {
        const userResponse: any = await this.commonService.authenticateUser({ name, password });
        if ( userResponse.user) {
          const { roleId, userName } = userResponse.user;
          console.log(`${userName} has successfully logged in`);
          const roleResponse: any = await this.commonService.getRole(roleId);
          this.promptUser(roleResponse.roleName);
        } else {
          console.log(userResponse.message);
          this.login();
        }
      });
    });
  }

  private  promptUser (role: string) {
    switch (role) {
      case "admin":
        this.adminController.promptAdmin();
        
        break;
      case "chef":
        this.chefController.promptChef();
     
        break;
      case "employee":
         this.employeeController.promptEmployee();
        
        
        break;
        
      default:
        console.log("Invalid role");
        
        break;
    }
    
  }
}

export default CommonController;
