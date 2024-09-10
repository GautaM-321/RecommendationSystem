import { expect } from 'chai';
import sinon from 'sinon';
import { io, Socket } from 'socket.io-client';
import readline, { Interface } from 'readline';
import RecommendedApp from '../client/client'
import AdminService from '../service/admin';
import ChefService from '../service/chef';
import CommonService from '../service/commonService';
import EmployeeService from '../service/employee';
import UtilityService from '../utility/utility';
import dbConnection from '../dataBase/db';
import AdminController from '../controller/adminController';
import ChefController from '../controller/chefController';
import EmployeeController from '../controller/employeeController';
import CommonController from '../controller/commonController';
import { afterEach, beforeEach, describe, it } from 'node:test';

describe('RecommendedApp', () => {
  let socketStub: sinon.SinonStubbedInstance<Socket>;
  let rlStub: sinon.SinonStubbedInstance<Interface>;
  let app: RecommendedApp;

  beforeEach(() => {
    socketStub = sinon.createStubInstance(io.Socket);
    rlStub = sinon.createStubInstance(readline.Interface);

    sinon.stub(io, 'io').returns(socketStub as unknown as Socket);
    sinon.stub(readline, 'createInterface').returns(rlStub as unknown as Interface);

    app = new RecommendedApp();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should initialize services and controllers correctly', () => {
    expect(app['adminService']).to.be.instanceOf(AdminService);
    expect(app['chefService']).to.be.instanceOf(ChefService);
    expect(app['commonService']).to.be.instanceOf(CommonService);
    expect(app['employeeService']).to.be.instanceOf(EmployeeService);
    expect(app['utilityService']).to.be.instanceOf(UtilityService);
    expect(app['adminController']).to.be.instanceOf(AdminController);
    expect(app['chefController']).to.be.instanceOf(ChefController);
    expect(app['employeeController']).to.be.instanceOf(EmployeeController);
    expect(app['commonController']).to.be.instanceOf(CommonController);
  });

  it('should set up socket handlers correctly', () => {
    expect(socketStub.on.calledWith('connect', sinon.match.func)).to.be.true;
    expect(socketStub.on.calledWith('disconnect', sinon.match.func)).to.be.true;
    expect(socketStub.on.calledWith('connect_error', sinon.match.func)).to.be.true;
  });

  it('should handle socket connection', async () => {
    const loginStub = sinon.stub(app['commonController'], 'login');

    await app['onConnect']();

    expect(loginStub.calledOnce).to.be.true;
    expect(console.log.calledWith('Connected to the server')).to.be.true;
  });

  it('should handle socket disconnection', () => {
    const consoleLogSpy = sinon.spy(console, 'log');

    app['onDisconnect']();

    expect(consoleLogSpy.calledWith('Disconnected from the server')).to.be.true;
  });

  it('should handle socket connection error', () => {
    const consoleErrorSpy = sinon.spy(console, 'error');

    app['onConnectError']({ message: 'xhr poll error' });

    expect(consoleErrorSpy.calledWith('Client-server connection error')).to.be.true;
  });
});
