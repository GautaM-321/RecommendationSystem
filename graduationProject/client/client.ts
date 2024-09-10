import { io, Socket } from "socket.io-client";
import readline, { Interface } from "readline";
import AdminService from "../service/admin";
import ChefService from "../service/chef";
import CommonService from "../service/commonService";
import dbConnection from "../dataBase/db";
import AdminController from "../controller/adminController";
import ChefController from "../controller/chefController";
import EmployeeController from "../controller/employeeController";
import CommonController from "../controller/commonController";
import EmployeeService from "../service/employee";
import UtilityService from "../utility/utility";
import DBHandler from "../repository/dbHandler";

class RecommendedApp {
  private socket: Socket;
  private rl: Interface;
  private adminService: AdminService;
  private chefService: ChefService;
  private employeeService: EmployeeService;
  private commonService: CommonService;
  private utilityService: UtilityService;
  private adminController: AdminController;
  private chefController: ChefController;
  private employeeController: EmployeeController;
  private commonController: CommonController;
  dbHandler: DBHandler;

  constructor() {
    this.socket = io("http://localhost:1234");
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.dbHandler=new DBHandler(dbConnection);
    this.adminService = new AdminService(dbConnection, this.socket);
    this.chefService = new ChefService(dbConnection, this.socket);
    this.commonService = new CommonService(dbConnection);
    this.employeeService = new EmployeeService(dbConnection);
    this.utilityService = new UtilityService(dbConnection);
    this.adminController = new AdminController(
      this.adminService,
      this.commonService,
      this.rl,
      this.utilityService,
    );
    this.chefController = new ChefController(
      this.chefService,
      this.commonService,
      this.utilityService,
      this.rl
    );

    this.employeeController = new EmployeeController(
      this.commonService,
      this.employeeService,

      this.rl,
      this.utilityService
    );
    this.commonController = new CommonController(
      this.commonService,
      this.rl,
      this.adminController,
      this.chefController,
      this.employeeController,
      this.utilityService
    );

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.socket.on("connect", this.onConnect.bind(this));
    this.socket.on("disconnect", this.onDisconnect.bind(this));
    this.socket.on("connect_error", this.onConnectError.bind(this));
  }

  private async onConnect() {
    console.log("Connected to the server");
    this.commonController.login();
  }

  private onDisconnect() {
    console.log("Disconnected from the server");
  }

  private onConnectError(error: any) {
    if (error.message === "xhr poll error") {
      console.error("Client-server connection error");
    }
  }
}
export default RecommendedApp;

new RecommendedApp();
