import ProfileController from "../controllers/profileController";
import Moleculer from "moleculer";
import MoleculerError = Moleculer.Errors.MoleculerError;
import moment from "moment";
import jwtHelper from "../helpers/jwtHelper";
import { iProfile } from "../types";
import { Security, Mailer, CONSTANTS } from "crm-utilities";
const {
  COMPANY_ROLE, DEPARTMENT: { CALL_CENTER, ENGINEERING }, ROLE,
} = CONSTANTS;
import constants from "../config/constants";
import ENUM from "../config/enums";


const db = require("module-models");
const resetTokenModel = db.public.users.ResetToken;

class ProfileManager {
  private mailer: Mailer;
  private moment;

  public constructor() {
    this.mailer = Mailer;
    this.moment = moment;
    this.getMe = this.getMe.bind(this);
    this.getWorkerById = this.getWorkerById.bind(this);
    this.getWorkersByDepartment = this.getWorkersByDepartment.bind(this);
    this.addWorker = this.addWorker.bind(this);
    this.editWorker = this.editWorker.bind(this);
    this.changeWorkersDepartment = this.changeWorkersDepartment.bind(this);
    this.getWorkers = this.getWorkers.bind(this);
    this.setPassword = this.setPassword.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.resendConfirmationLink = this.resendConfirmationLink.bind(this);
    this.getEngineers = this.getEngineers.bind(this);
    this.searchFilterWorkers = this.searchFilterWorkers.bind(this);
    this.searchWorkers = this.searchWorkers.bind(this);
    this.checkWorkerExists = this.checkWorkerExists.bind(this);
    this.searchOperators = this.searchOperators.bind(this);
    this.searchEngineers = this.searchEngineers.bind(this);
    this.searchConfigWorkers = this.searchConfigWorkers.bind(this);
    this.getProductPermissions = this.getProductPermissions.bind(this);
    this.getProductPermissionsGroups = this.getProductPermissionsGroups.bind(this);
    this.getPermsGroupById = this.getPermsGroupById.bind(this);
    this.makePermissionsGroup = this.makePermissionsGroup.bind(this);
    this.editPermissionsGroup = this.editPermissionsGroup.bind(this);
    this.addPermissionToGroup = this.addPermissionToGroup.bind(this);
    this.deletePermissionFromGroup = this.deletePermissionFromGroup.bind(this);
    this.deleteUnUsedPermissionsGroups = this.deleteUnUsedPermissionsGroups.bind(this);
    this.deletePermissionsGroups = this.deletePermissionsGroups.bind(this);
    this.makeGroupFromWorkerPerms = this.makeGroupFromWorkerPerms.bind(this);
    this.getWorkerMergedPerms = this.getWorkerMergedPerms.bind(this);
    this.getWorkerMergedPermsGroups = this.getWorkerMergedPermsGroups.bind(this);
    this.attachPermissionToWorker = this.attachPermissionToWorker.bind(this);
    this.attachPermissionsGroupToWorker = this.attachPermissionsGroupToWorker.bind(this);
    this.removePermissionFromWorker = this.removePermissionFromWorker.bind(this);
    this.removePermissionsGroupFromWorker = this.removePermissionsGroupFromWorker.bind(this);
    this.getUsersByGroupAndFilterByRegion = this.getUsersByGroupAndFilterByRegion.bind(this);
    this.getUsersFullNames = this.getUsersFullNames.bind(this);
    this.getUpcomingBdays = this.getUpcomingBdays.bind(this);
  }


  public async resendConfirmationLink(ctx: iProfile.ResendCtx) {
    const { email } = ctx.params;

    const user = await ProfileController.getUserByEmail(email);
    if (user && user.isEmailConfirmed) {
      throw new MoleculerError("User with this email already exists.Please do forgot password", 403);
    }

    const resetToken = await Security.generateJwt({ userId: user.id }, "1h");

    await resetTokenModel.upsert({ token: resetToken, userId: user.id, type: "setPassword" });

    await this.mailer.sendSetPasswordEmail(email, resetToken);

    return {
      message: "Please check your email for account confirmation",
    };
  }

  public async forgotPassword(ctx: iProfile.ResendCtx) {
    const { email } = ctx.params;

    const user = await ProfileController.getUserByEmail(email);
    if (user && !user.isEmailConfirmed) {
      throw new MoleculerError("User with this email didn't confirm profile, please do resend confirmation", 403);
    }

    const resetToken = await Security.generateJwt({ userId: user.id }, "1h");

    await resetTokenModel.upsert({ token: resetToken, userId: user.id, type: "forgotPassword" });

    await this.mailer.sendSetPasswordEmail(email, resetToken);

    return {
      message: "Reset password link successfully sent",
    };
  }

  public async getMe(ctx: iProfile.GetMeCtx): Promise<{ result: { user: iProfile.RetUsers } }> {
    const { companyId, userId } = ctx.meta.data;

    const user = await ProfileController.getUserByIdWithPerms(userId, companyId, ctx);

    return { result: { user } };
  }

  public async getWorkerById(ctx: iProfile.GetByIdCtx): Promise<{ result: { user: iProfile.RetUsers } }> {
    const { id: userId } = ctx.params;
    const { companyId } = ctx.meta.data;

    const user = await ProfileController.getUserByIdWithPerms(userId, companyId, ctx);

    return { result: { user } };
  }

  public async getWorkersByDepartment(ctx: iProfile.GetByIdLimitOffsetCtx): Promise<iProfile.UserParams[]> {
    const { params } = ctx;
    const { companyId } = ctx.meta.data;

    return await ProfileController.getUserByDepartment(params, companyId);
  }

  public async logOut(ctx: iProfile.LogoutCtx) {
    const { token } = ctx.params;
    // const data = `tokens:${token}`;
    await db.redis.del(`tokens:${token}`);

    return {
      message: "Logout successfully done",
    };
  }

  public async setPassword(ctx: iProfile.SetPassCtx) {
    const { password, repeatPassword, token } = ctx.params;

    if (password !== repeatPassword) {
      throw new MoleculerError("Passwords do not match", 422);
    }

    const resetToken = await ProfileController.getUserAndToken(token);
    const hashedPassword = Security.hashPassword(password);
    await ProfileController.setUserConfirmPassword(resetToken, hashedPassword);

    const user = await ProfileController.getUserById(resetToken.userId);
    const { companyId, companyRole, departmentId, departmentRole, id: userId } = user;
    const auth = { userId, companyId, companyRole, departmentId, departmentRole };
    const genToken = await jwtHelper(auth);

    return { result: { token: genToken } };
  }

  public async addWorker(ctx: iProfile.AddWorkerCtx): Promise<{ message: string; worker: { email: string } }> {
    console.log("START AddWorker with params", ctx.params);
    const { params, params: { departmentId, departmentRole, idCardNumber, regionId, socialCardNumber } } = ctx;
    const email = params.email.toLowerCase();
    const { data: { companyId } } = ctx.meta;

    await ProfileController.getDepartmentById(departmentId);
    await ProfileController.checkUserByEmailCompany(email, companyId);
    if (idCardNumber || socialCardNumber) {
      await ProfileController.checkUserByIdSocialCards(idCardNumber, socialCardNumber, companyId);
    }
    if (departmentId === ENGINEERING.ID && departmentRole === ROLE.HEAD) {
      await ProfileController.checkEngHeadByRegion(regionId, companyId);
    }

    const createdWorker = await ProfileController.createWorker(params, companyId, email);
    const resetToken = Security.generateJwt({ userId: createdWorker.id }, "1h");

    await resetTokenModel.upsert({ token: resetToken, userId: createdWorker.id, type: "setPassword" });
    this.mailer.sendInviteWorker(email, resetToken);

    await ProfileController.checkRoleAttachPermsAndGroups(createdWorker, departmentId, departmentRole);

    console.log("END AddWorker");
    return {
      message: "Invitation successfully sent",
      worker: { email },
    };
  }

  public async editWorker(ctx: iProfile.EditWorkerCtx): Promise<{ message: string }> {
    const { params, params: { departmentId, departmentRole, id, idCardNumber, regionId, socialCardNumber } } = ctx;
    const email = params.email.toLowerCase();
    const { data: { companyId } } = ctx.meta;

    const user = await ProfileController.getUserById(id);
    await ProfileController.getDepartmentById(departmentId);
    await ProfileController.checkUserByEmailCompany(email, companyId, id);
    if (idCardNumber || socialCardNumber) {
      await ProfileController.checkUserByIdSocialCards(idCardNumber, socialCardNumber, companyId, id);
    }

    if (regionId !== user.regionId || departmentId !== user.departmentId || departmentRole !== user.departmentRole) {
      const requests: iProfile.RetRequest[] = await ctx.call("v1.requestService.getWorkerNotFinishedRequests", { id });
      if (requests.length > 0) {
        throw new MoleculerError("Worker has not finished requests.", 409);
      }
      if (departmentId === ENGINEERING.ID && departmentRole === ROLE.HEAD) {
        await ProfileController.checkEngHeadByRegion(regionId, companyId);
      }
    }

    await ProfileController.editWorker(params, companyId, email);
    if (departmentId !== user.departmentId || departmentRole !== user.departmentRole) {
      await ProfileController.checkRoleAttachPermsAndGroups(user, departmentId, departmentRole);
    }

    return {
      message: "Worker successfully updated.",
    };
  }

  public async changeWorkersDepartment(ctx: iProfile.ChangeWorkersDepartmentCtx): Promise<{ existsWorkers: number[]; notExistsWorkers: number[] }> {
    const { departmentId, regionId, role, workersId } = ctx.params;
    const { companyId } = ctx.meta.data;

    await ProfileController.getDepartmentById(departmentId);
    const findWorkers = await ProfileController.getWorkersByIds(workersId, companyId);

    if (departmentId === ENGINEERING.ID && role === ROLE.HEAD) {
      await ProfileController.checkEngHeadByRegion(regionId, companyId);
    }

    const { existsWorkers, notExistsWorkers } = ProfileController.checkWorkersExists(findWorkers, workersId);

    await ProfileController.updateWorkersDepRoleRegion(existsWorkers, departmentId, role, regionId);

    return { existsWorkers, notExistsWorkers };
  }

  public async getWorkers(ctx: iProfile.GetMeCtx) {
    const { companyId } = ctx.meta.data;
    await ProfileController.getCompanyById(companyId);
    const users = await ProfileController.getWorkers(companyId);
    return {
      result: { workers: users },
    };
  }

  public async getEngineers(ctx: iProfile.GetMeCtx): Promise<iProfile.RetUsers> {
    const { companyId, regionId } = ctx.meta.data;
    return ProfileController.getEngineersByRegion(companyId, regionId);
  }

  public async searchFilterWorkers(ctx: iProfile.SearchFilterWorkersCtx): Promise<iProfile.RetUsers> {
    const { params } = ctx;
    const { companyId } = ctx.meta.data;
    params.companyId = companyId;

    return await ProfileController.searchFilterWorkers(params, ctx);
  }

  public async searchWorkers(ctx: iProfile.SearchWorkersCtx): Promise<iProfile.RetUsers> {
    const { params } = ctx;
    const { companyId } = ctx.meta.data;

    return await ProfileController.searchWorkers(params, companyId, ctx);
  }

  public async checkWorkerExists(ctx: iProfile.CheckEngineerExistsCtx): Promise<iProfile.UserParams> {
    const { companyId, departmentId, id: userId, regionId } = ctx.params;
    return await ProfileController.getWorkerByIds(userId, departmentId, companyId, regionId);
  }

  public async searchOperators(ctx: iProfile.SearchOperatorsCtx): Promise<iProfile.RetUsers> {
    const { params } = ctx;
    const { companyId } = ctx.meta.data;

    return await ProfileController.searchOperators(params, companyId, CALL_CENTER.ID);
  }

  public async searchEngineers(ctx: iProfile.SearchOperatorsCtx): Promise<iProfile.RetUsers> {
    const { params } = ctx;
    const { companyId, filterByRegion } = ctx.meta.data;
    let regionId;

    if (filterByRegion) {
      regionId = ctx.meta.data.regionId;
    }

    return await ProfileController.searchEngineers(params, companyId, regionId);
  }

  public async searchConfigWorkers(ctx: iProfile.SearchOperatorsCtx): Promise<iProfile.RetUsers> {
    const { params } = ctx;
    const { companyId } = ctx.meta.data;

    return await ProfileController.searchConfigWorkers(params, companyId);
  }

  public async getProductPermissions(ctx: iProfile.GetPermsAndGroupsCtx): Promise<iProfile.RetPermissions> {
    const { params } = ctx;
    return await ProfileController.getProductPermissions(params);
  }

  public async getProductPermissionsGroups(ctx: iProfile.GetPermsAndGroupsCtx): Promise<iProfile.RetPermissionsGroup> {
    const { params } = ctx;
    return await ProfileController.getProductsPermissionsGroups(params);
  }

  public async getPermsGroupById(ctx: iProfile.GetPermsGroupByIdCtx): Promise<iProfile.PermissionsGroupParams> {
    const { params, params: { group: permissionsGroupId, id: productId } } = ctx;
    const permsGroup = await ProfileController.getPermsGroupByIdExcludePerms(permissionsGroupId, productId);
    const permissions = await ProfileController.getPermsGroupMergedPermissions(params);
    permsGroup.permissions = permissions;
    return permsGroup;
  }

  public async makePermissionsGroup(ctx: iProfile.MakeGroupCtx): Promise<{ message: string }> {
    const { id: productId, name, permissions: permissionsIds } = ctx.params;

    await ProfileController.checkPermissionsGroupName(name);
    const existsPermissions = await ProfileController.getPermissionsByIds(permissionsIds, productId);
    const permissions = existsPermissions.map((permission) => {
      const { departmentId, id, name } = permission;
      return { id, name, departmentId };
    });
    await ProfileController.createPermissionsGroup(productId, name, "worker", permissions);
    return {
      "message": "PermissionsGroup successfully created.",
    };
  }

  public async editPermissionsGroup(ctx: iProfile.EditGroupCtx): Promise<{ message: string }> {
    const { id: productId, name } = ctx.params;
    const permissionsGroupId = Number(ctx.params.group);

    ProfileController.checkEditablePermsGroup(permissionsGroupId);
    await ProfileController.getPermsGroupByIdExcludePerms(permissionsGroupId, productId);
    await ProfileController.checkPermissionsGroupName(name, permissionsGroupId);
    await ProfileController.updatePermissionsGroupName(name, permissionsGroupId, productId);

    return {
      "message": "PermissionsGroup successfully updated.",
    };
  }

  public async addPermissionToGroup(ctx: iProfile.AddDelPermFromGroupCtx): Promise<{ message: string }> {
    const { id: productId, permission: permissionId } = ctx.params;
    const permissionsGroupId = Number(ctx.params.group);

    ProfileController.checkEditablePermsGroup(permissionsGroupId);
    await ProfileController.getPermsGroupByIdExcludePerms(permissionsGroupId, productId);

    const existsPermission = await ProfileController.getPermissionByIds(permissionId, productId);
    const permission = {
      id: existsPermission.id,
      name: existsPermission.name,
      departmentId: existsPermission.departmentId,
    };
    await ProfileController.addPermissionToGroup(permission, permissionsGroupId);
    return {
      "message": "PermissionsGroup successfully added.",
    };
  }

  public async deletePermissionFromGroup(ctx: iProfile.AddDelPermFromGroupCtx): Promise<{ message: string }> {
    const { id: productId, permission: permissionId } = ctx.params;
    const permissionsGroupId = Number(ctx.params.group);

    ProfileController.checkEditablePermsGroup(permissionsGroupId);
    await ProfileController.getPermsGroupByIdExcludePerms(permissionsGroupId, productId);
    const existsPermission = await ProfileController.getPermissionByIds(permissionId, productId);
    const permission = {
      id: existsPermission.id,
      name: existsPermission.name,
      departmentId: existsPermission.departmentId,
    };
    await ProfileController.deletePermissionFromGroup(permission, permissionsGroupId);
    return {
      "message": "PermissionsGroup successfully removed.",
    };
  }

  public async deleteUnUsedPermissionsGroups(ctx: iProfile.DeletePermissionsGroupsCtx): Promise<iProfile.RetDeleteUnUsedPermGroups> {
    const { id: productId, permissionsGroups: permissionsGroupsIds } = ctx.params;
    const {
      allowDelPermissionsGroups,
      notAllowDelPermissionsGroups,
    } = ProfileController.checkDeletablePermsGroup(permissionsGroupsIds);

    const findPermissionsGroups = await ProfileController.getPermissionsGroupsByIds(productId, allowDelPermissionsGroups);
    const {
      assignedPermissionsGroups,
      deletedPermissionsGroups,
      notExistsPermissionsGroups,
    } = ProfileController.checkPermissionsGroupsExists(allowDelPermissionsGroups, findPermissionsGroups);
    await ProfileController.deletePermissionsGroups(deletedPermissionsGroups, productId);
    return {
      deletedPermissionsGroups,
      notExistsPermissionsGroups,
      assignedPermissionsGroups,
      notAllowDelPermissionsGroups,
    };
  }

  public async deletePermissionsGroups(ctx: iProfile.DeletePermissionsGroupsCtx): Promise<{ notAllowDelPermissionsGroups: number[] }> {
    const { id: productId, permissionsGroups: permissionsGroupsIds } = ctx.params;
    const {
      allowDelPermissionsGroups,
      notAllowDelPermissionsGroups,
    } = ProfileController.checkDeletablePermsGroup(permissionsGroupsIds);

    await ProfileController.deletePermissionsGroups(allowDelPermissionsGroups, productId);
    return {
      notAllowDelPermissionsGroups,
    };
  }

  public async makeGroupFromWorkerPerms(ctx: iProfile.MakeGroupFromWorkerPermsCtx): Promise<{ message: string }> {
    const { id: productId, name, worker: userId } = ctx.params;

    await ProfileController.checkPermissionsGroupName(name);

    const user = await ProfileController.getUserWithPermissions(userId);
    if (user.permissions.length === 0) {
      console.log("ERROR makeGroupFromWorkerPerms", "Can't make group without permissions.");
      throw new MoleculerError("Can't make group without permissions.", 409);
    }
    const permissions = user.permissions.map((permission) => {
      const { departmentId, id, name } = permission;
      return { id, name, departmentId };
    });

    await ProfileController.createPermissionsGroup(productId, name, "worker", permissions);
    return {
      "message": "PermissionsGroup successfully created.",
    };
  }

  public async getWorkerMergedPerms(ctx: iProfile.GetWorkerPermsAndGroupsCtx): Promise<iProfile.RetPermissions> {
    const { params } = ctx;
    return await ProfileController.getWorkerMergedPerms(params);
  }

  public async getWorkerMergedPermsGroups(ctx: iProfile.GetWorkerPermsAndGroupsCtx): Promise<iProfile.RetPermissionsGroup> {
    const { params } = ctx;
    return await ProfileController.getWorkerMergedPermsGroups(params);
  }


  public async attachPermissionToWorker(ctx: iProfile.AttachRemovePermCtx): Promise<{ message: string }> {
    const { id: userId } = ctx.params;
    const permission = Number(ctx.params.permission);

    const user = await ProfileController.getUserById(userId);
    if (user.companyRole === COMPANY_ROLE.OWNER || user.companyRole === COMPANY_ROLE.ADMIN) {
      throw new MoleculerError("Not allowed to set permission and group", 403);
    }
    await ProfileController.attachPermission(user, permission);

    return {
      message: "Permission successfully attached",
    };
  }

  public async attachPermissionsGroupToWorker(ctx: iProfile.AttachRemovePermGroupCtx): Promise<{ message: string }> {
    const { id: userId } = ctx.params;
    const permissionsGroup = Number(ctx.params.group);

    const user = await ProfileController.getUserById(userId);
    if (user.companyRole === COMPANY_ROLE.OWNER || user.companyRole === COMPANY_ROLE.ADMIN) {
      throw new MoleculerError("Not allowed to set permission and group", 403);
    }
    await ProfileController.attachPermissionsGroup(user, permissionsGroup);

    return {
      message: "Permission successfully attached",
    };
  }

  public async removePermissionFromWorker(ctx: iProfile.AttachRemovePermCtx): Promise<{ message: string }> {
    const { id: userId } = ctx.params;
    const permission = Number(ctx.params.permission);

    const user = await ProfileController.getUserById(userId);
    if (user.companyRole === COMPANY_ROLE.OWNER || user.companyRole === COMPANY_ROLE.ADMIN) {
      throw new MoleculerError("Not allowed to remove permission and group", 403);
    }
    await ProfileController.removePermission(user, permission);

    return {
      message: "Permission successfully removed",
    };
  }

  public async removePermissionsGroupFromWorker(ctx: iProfile.AttachRemovePermGroupCtx): Promise<{ message: string }> {
    const { id: userId } = ctx.params;
    const permissionsGroup = Number(ctx.params.group);

    const user = await ProfileController.getUserById(userId);
    if (user.companyRole === COMPANY_ROLE.OWNER || user.companyRole === COMPANY_ROLE.ADMIN) {
      throw new MoleculerError("Not allowed to remove permission and group", 403);
    }
    await ProfileController.removePermissionsGroup(user, permissionsGroup);

    return {
      message: "Permission successfully removed",
    };
  }

  public async getUsersByGroupAndFilterByRegion(ctx: iProfile.GetUsersByGroupCtx): Promise<iProfile.RetUsers[]> {
    const { group, regionId } = ctx.params;

    const names: string[] = Object.keys(constants.group).map(key => {
      return constants.group[key].name;
    });

    if (!names.includes(group)) {
      throw new MoleculerError("Invalid group", 403);
    }
    return await ProfileController.getUsersByGroupAndRegionId({ regionId, group });
  }

  public async getUsersFullNames(ctx: iProfile.GetUsersFullNamesCtx): Promise<iProfile.RetUsers[]> {
    return ProfileController.getUsersFullNames(ctx.params);
  }

  public async getUpcomingBdays(ctx: iProfile.BaseCtx): Promise<{ users: iProfile.UserParams[]; count: number; allUserIds: number[]}> {
    try {
      const existsUsers = await ProfileController.getWorkers(ctx.meta.data.companyId);
      if (!existsUsers?.length) {
        return { users: [], count: 0, allUserIds: [] };
      }

      const userIds = [];
      const users = [];
      for (const existUser of existsUsers) {
        userIds.push(existUser.id);
        if (existUser.birthday) {
          const thisYear = new Date().getFullYear();
          const bdayThisYear = new Date(existUser.birthday).setFullYear(thisYear);

          const today = this.moment();
          const upcomingBday = this.moment(bdayThisYear);

          const daysLeft = upcomingBday.diff(today, "days");
          if (daysLeft >= 0 && daysLeft <= ENUM.DAYS_LEFT) {
            users.push({ ...existUser, upcomingBday });
          }
        }
      }
      users.sort(function(a, b) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        return new Date(a.upcomingBday) - new Date(b.upcomingBday);
      });
      return { users, count: users.length, allUserIds: userIds };
    } catch (err) {
      throw new MoleculerError("Try again.", 409);
    }
  }
}

export default new ProfileManager();
