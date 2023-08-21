import Moleculer from "moleculer";

import generator from "generate-password";
import { createFullName } from "../helpers/helper";
import { iProfile } from "../types";
import constants from "../config/constants";

import { CONSTANTS } from "crm-utilities";
import MoleculerError = Moleculer.Errors.MoleculerError;
import BaseCtx = iProfile.BaseCtx;

const {
  COMPANY_ROLE, CUSTOMER: { SEARCH_TYPE: { ADDRESS } }, DEPARTMENT: { CALL_CENTER, ENGINEERING, FINANCE_AND_LAW, HR, RECEPTION }, ROLE,
} = CONSTANTS;

const db = require("module-models");
const { Op, Sequelize: { literal } } = db;
const companyModel = db.public.company.Company;
const userModel = db.public.users.User;
const usersPermissionsModel = db.public.users.UsersPermissions;
const resetTokenModel = db.public.users.ResetToken;
const departmentModel = db.public.users.Department;
const permissionsGroupModel = db.public.global.PermissionsGroup;
const permissionsModel = db.public.global.Permissions;


class ProfileController {
  public constructor() {
    this.getWorkers = this.getWorkers.bind(this);
    this.getProductPermissions = this.getProductPermissions.bind(this);
    this.getProductsPermissionsGroups = this.getProductsPermissionsGroups.bind(this);
    this.getPermsGroupByIdExcludePerms = this.getPermsGroupByIdExcludePerms.bind(this);
    this.getPermsGroupMergedPermissions = this.getPermsGroupMergedPermissions.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.createWorker = this.createWorker.bind(this);
    this.editWorker = this.editWorker.bind(this);
    this.checkRoleAttachPermsAndGroups = this.checkRoleAttachPermsAndGroups.bind(this);
    this.getUserByIdWithPerms = this.getUserByIdWithPerms.bind(this);
    this.getUserByDepartment = this.getUserByDepartment.bind(this);
    this.getDepartment = this.getDepartment.bind(this);
    this.getUserByEmail = this.getUserByEmail.bind(this);
    this.getCompanyById = this.getCompanyById.bind(this);
    this.getUserAndToken = this.getUserAndToken.bind(this);
    this.attachPermission = this.attachPermission.bind(this);
    this.attachPermissionsGroup = this.attachPermissionsGroup.bind(this);
    this.removePermission = this.removePermission.bind(this);
    this.removePermissionsGroup = this.removePermissionsGroup.bind(this);
    this.getEngineersByRegion = this.getEngineersByRegion.bind(this);
    this.setUserConfirmPassword = this.setUserConfirmPassword.bind(this);
    this.checkUserByEmailCompany = this.checkUserByEmailCompany.bind(this);
    this.checkUserByIdSocialCards = this.checkUserByIdSocialCards.bind(this);
    this.checkEngHeadByRegion = this.checkEngHeadByRegion.bind(this);
    this.getDepartmentById = this.getDepartmentById.bind(this);
    this.getWorkersByIds = this.getWorkersByIds.bind(this);
    this.checkWorkersExists = this.checkWorkersExists.bind(this);
    this.updateWorkersDepRoleRegion = this.updateWorkersDepRoleRegion.bind(this);
    this.getPermissionsByIds = this.getPermissionsByIds.bind(this);
    this.getPermissionByIds = this.getPermissionByIds.bind(this);
    this.addPermissionToGroup = this.addPermissionToGroup.bind(this);
    this.deletePermissionFromGroup = this.deletePermissionFromGroup.bind(this);
    this.checkPermissionsGroupName = this.checkPermissionsGroupName.bind(this);
    this.getUserWithPermissions = this.getUserWithPermissions.bind(this);
    this.createPermissionsGroup = this.createPermissionsGroup.bind(this);
    this.updatePermissionsGroupName = this.updatePermissionsGroupName.bind(this);
    this.searchFilterWorkers = this.searchFilterWorkers.bind(this);
    this.searchWorkers = this.searchWorkers.bind(this);
    this.getWorkerByIds = this.getWorkerByIds.bind(this);
    this.searchOperators = this.searchOperators.bind(this);
    this.searchEngineers = this.searchEngineers.bind(this);
    this.searchConfigWorkers = this.searchConfigWorkers.bind(this);
    this.checkEditablePermsGroup = this.checkEditablePermsGroup.bind(this);
    this.checkDeletablePermsGroup = this.checkDeletablePermsGroup.bind(this);
    this.getPermissionsGroupsByIds = this.getPermissionsGroupsByIds.bind(this);
    this.checkPermissionsGroupsExists = this.checkPermissionsGroupsExists.bind(this);
    this.deletePermissionsGroups = this.deletePermissionsGroups.bind(this);
    this.getWorkerMergedPerms = this.getWorkerMergedPerms.bind(this);
    this.getWorkerMergedPermsGroups = this.getWorkerMergedPermsGroups.bind(this);
    this.getUsersFullNames = this.getUsersFullNames.bind(this);
    // this.getCompanyAndProducts = this.getCompanyAndProducts.bind(this);
  }


  public async getEngineersByRegion(companyId: number, regionId: number): Promise<iProfile.RetUsers> {
    try {
      console.log("START getEngineersByRegion with params", companyId, regionId);

      const where: { companyId: number; departmentId: number; departmentRole: string; companyRole: any; regionId?: number } = {
        companyId,
        departmentId: ENGINEERING.ID,
        departmentRole: ROLE.ENGINEER,
        companyRole: { [Op.not]: COMPANY_ROLE.ADMIN },
      };

      if (regionId) {
        where.regionId = regionId;
      }

      return await userModel.findAll({
        where,
        attributes: { exclude: ["password", "deletedAt", "updatedAt"] },
      });
    } catch (err) {
      console.log("ERROR getEngineersByRegion", err);
      throw new MoleculerError("Try again", 409);
    }
  }

  public async getProductPermissions(params: iProfile.GetPermsAndGroupsParams): Promise<iProfile.RetPermissions> {
    const { id: productId, limit = "100", name, offset = "0" } = params;

    let where: { name?: any; productId: number } = { productId };

    if (name) {
      where = { productId, name: { [Op.iLike]: `%${name}%` } };
    }

    const permissions = await permissionsModel.findAndCountAll({
      where,
      limit,
      offset,
    });
    if (!permissions) {
      console.log("ERROR getProductPermissions", "Try again.");
      throw new MoleculerError("Try again", 409);
    }
    return permissions;
  }

  public async getProductsPermissionsGroups(params: iProfile.GetPermsAndGroupsParams): Promise<iProfile.RetPermissionsGroup> {
    const { id: productId, limit = "100", name, offset = "0" } = params;

    let where: { name?: any; productId: number } = { productId };

    if (name) {
      where = { productId, name: { [Op.iLike]: `%${name}%` } };
    }

    const permissionsGroups = await permissionsGroupModel.findAndCountAll({
      where,
      attributes: { exclude: ["permissions"] },
      limit,
      offset,
    });
    if (!permissionsGroups) {
      console.log("ERROR getProductsPermissionsGroups", "Try again.");
      throw new MoleculerError("Try again", 409);
    }
    return permissionsGroups;
  }

  public async getPermsGroupByIdExcludePerms(id: number, productId: number): Promise<iProfile.PermissionsGroupParams> {
    const permissionsGroup = await permissionsGroupModel.findOne({
      where: { id, productId },
      attributes: { exclude: ["permissions"] },
    });
    if (!permissionsGroup) {
      console.log("ERROR getPermsGroupByIdExcludePerms", "PermissionsGroup doesn't exist.");
      throw new MoleculerError("PermissionsGroup doesn't exist", 409);
    }
    return permissionsGroup;
  }

  public async getPermsGroupMergedPermissions(params: iProfile.GetPermsGroupByIdParams): Promise<iProfile.RetPermissions> {
    const { group: permissionsGroupId, id: productId, limit = "100", name, offset = "0" } = params;

    let where: { name?: any; productId: number } = { productId };

    if (name) {
      where = { productId, name: { [Op.iLike]: `%${name}%` } };
    }

    const activeAttr = [literal(`
      CASE WHEN "Permissions"."id" IN (
        SELECT perm."id" AS "id"
        FROM "public"."PermissionsGroup" AS "PermissionsGroup",
        jsonb_to_recordset("PermissionsGroup"."permissions") as perm(id int , name text)
        WHERE "PermissionsGroup"."id" = ${permissionsGroupId}
      ) THEN true ELSE false END
      `), "active"];

    const permissions = await permissionsModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [[literal("\"active\" DESC")]],
      attributes: ["id", "name", activeAttr, "createdAt", "updatedAt"],
    });
    if (!permissions) {
      console.log("ERROR getPermissionsGroupById", "Try again.");
      throw new MoleculerError("Try again", 409);
    }
    return permissions;
  }

  public async getCompanyById(id: number) {
    const company = await companyModel.findOne({ where: id });
    if (!company) {
      throw new MoleculerError("Company doesn't exist", 409);
    }
    return company;
  }

  public async getUserByEmail(email: string): Promise<iProfile.UserParams> {
    const user = await userModel.findOne({ where: { email } });
    if (!user) {
      throw new MoleculerError("Incorrect email ", 409);
    }
    return user;
  }

  public async getWorkers(id: number): Promise<iProfile.UserParams[]> {
    try {
      return await userModel.findAll({
        raw: true,
        nest: true,
        where: {
          companyId: id,
          companyRole: { [Op.not]: COMPANY_ROLE.ADMIN },
        },
        attributes: { exclude: ["password", "deletedAt"] },
      });
    } catch (err) {
      throw new MoleculerError("Try again.", 409);
    }

  }

  public async getUserByIdWithPerms(id: number, companyId: number, ctx: BaseCtx): Promise<iProfile.RetUsers> {
    try {
      console.log("START getUserByIds with params ", id, companyId);
      const user = await userModel.findOne({
        where: { id, companyId },
        attributes: { exclude: ["password", "deletedAt"] },
        include: [
          { model: permissionsModel, as: "permissions" },
          { model: permissionsGroupModel, as: "permissionsGroups" },
          { model: departmentModel, as: "department", required: false },
        ],
      });

      if (!user) {
        throw new MoleculerError("User Not found.", 404);
      }

      if (user.regionId) {
        user.dataValues.region = await ctx.call("v1.addressesService.getRegionById", { id: user.regionId });
      }

      return user;

    } catch (err) {
      console.log("ERROR getUserByIds", err);
      throw new MoleculerError("Something went Wrong.", 409);
    }
  }

  public async getUserByDepartment(params: iProfile.GetByIdLimitOffsetParams, companyId: number): Promise<iProfile.UserParams[]> {
    const { id: departmentId, limit = "100", offset = "0" } = params;

    const user = await userModel.findAndCountAll({
      where: { departmentId, companyId },
      attributes: { exclude: ["password", "deletedAt"] },
      limit,
      offset,
    });
    if (!user) {
      throw new MoleculerError("Try again.", 409);
    }
    return user;
  }

  public async getUserAndToken(token: string) {
    const resetToken = await resetTokenModel.findOne({
      where: { token },
      include: [{ model: userModel, as: "user" }],
    });
    if (!resetToken) {
      throw new MoleculerError("Invalid token", 403);
    }
    return resetToken;
  }

  public async setUserConfirmPassword(resetToken: any, hashedPassword: string) {
    const { user: { companyRole }, userId } = resetToken;
    const transaction = await db.transaction();

    try {
      await userModel.update(
        { password: hashedPassword, isEmailConfirmed: true },
        { where: { id: userId }, transaction },
      );
      if (companyRole !== "worker") {
        await companyModel.update(
          { isEmailConfirmed: true },
          { where: { ownerId: userId }, transaction },
        );
      }
      await resetToken.destroy({ transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw new MoleculerError("Try again", 409);
    }
  }

  public async getUserById(id: number): Promise<iProfile.UserParams> {
    const user = await userModel.findOne({ where: { id }, attributes: { exclude: ["password"] } });
    if (!user) {
      console.log("ERROR getUserById", "User doesnt exist");
      throw new MoleculerError("User doesnt exist", 409);
    }
    return user;
  }

  public async checkUserByEmailCompany(email: string, companyId: number, id?: number): Promise<void> {
    try {
      console.log("START checkUserByEmailCompany with params", email, companyId);
      const where: { email: string; companyId: number; id?: any } = { email, companyId };

      if (id) {
        where.id = { [Op.not]: id };
      }
      const isUserCompany = await userModel.findOne({ where });

      if (isUserCompany && isUserCompany.isEmailConfirmed) {
        throw new MoleculerError("Email already used", 403);
      }
      if (isUserCompany && !isUserCompany.isEmailConfirmed) {
        throw new MoleculerError("Email already in use.Please resend Confirmation link to verify your email", 403);
      }
    } catch (err) {
      console.log("ERROR checkUserByEmailCompany", err);
      throw new MoleculerError("Email already in use.Please resend Confirmation link to verify your email.", 409);
    }
  }

  public async checkUserByIdSocialCards(idCardNumber: string, socialCardNumber: string, companyId: number, id?: number): Promise<void> {
    try {
      console.log("START checkUserByCardsNumbersCompany with params", idCardNumber, socialCardNumber, companyId);
      const where: any = { [Op.or]: [], companyId };
      if (idCardNumber) {
        where[Op.or].push({ idCardNumber });
      }
      if (socialCardNumber) {
        where[Op.or].push({ socialCardNumber });
      }
      if (id) {
        where.id = { [Op.not]: id };
      }
      const isCardsNumbersCompany = await userModel.findOne({ where });

      if (isCardsNumbersCompany) {
        throw new MoleculerError("IdCardNumber and socialCardNumber already used.", 403);
      }
    } catch (err) {
      console.log("ERROR checkUserByCardsNumbersCompany", err);
      throw new MoleculerError("IdCardNumber or socialCardNumber already used.", 409);
    }
  }

  public async checkEngHeadByRegion(regionId: number, companyId: number): Promise<void> {
    try {
      console.log("START checkEngHeadsByRegion with params", regionId, companyId);
      const engHead = await userModel.findOne({
        where: {
          regionId,
          companyId,
          departmentRole: ROLE.HEAD,
          departmentId: ENGINEERING.ID,
          companyRole: { [Op.notIn]: ["admin", "owner"] },
        },
      });
      if (engHead) {
        throw new MoleculerError("Engineering head in this region already exists.", 403);
      }
    } catch (err) {
      console.log("ERROR checkEngHeadsByRegion", err);
      throw new MoleculerError("Engineering head in this region already exists.", 409);
    }
  }

  public async createWorker(params: iProfile.AddWorkerParams, companyId: number, email: string): Promise<iProfile.UserParams> {
    try {
      const {
        address1,
        address2,
        birthday,
        departmentId,
        departmentRole,
        firstName,
        gender,
        idCardImage,
        idCardNumber,
        lastName,
        paternalName,
        phone,
        regionId,
        releaseDate,
        socialCardNumber,
        submitionDate,
        zipPostalCode,
      } = params;
      const password = generator.generate({ length: 10, numbers: true });
      const fullName = createFullName(firstName, lastName, paternalName);
      const companyRole = "worker";

      console.log("START createWorker with params", params, companyId, email);
      return await userModel.create({
        email,
        lastName,
        fullName,
        paternalName,
        gender,
        birthday,
        password,
        regionId,
        firstName,
        companyId,
        companyRole,
        departmentId,
        departmentRole,
        phone,
        idCardImage,
        idCardNumber,
        socialCardNumber,
        address1,
        address2,
        releaseDate,
        submitionDate,
        zipPostalCode,
      });
      console.log("END createWorker");
    } catch (err) {
      console.log("ERROR createWorker", err);
      throw new MoleculerError("Try again", 409);
    }
  }

  public async editWorker(data: iProfile.EditWorkerParams, companyId: number, email: string): Promise<void | never> {
    try {
      console.log("START editWorker with params", data);

      const {
        address1,
        address2,
        birthday,
        departmentId,
        departmentRole,
        firstName,
        gender,
        id,
        idCardImage,
        idCardNumber,
        lastName,
        paternalName,
        phone,
        regionId,
        releaseDate,
        socialCardNumber,
        submitionDate,
        zipPostalCode,
      } = data;
      const fullName = createFullName(firstName, lastName, paternalName);

      await userModel.update(
        {
          email,
          lastName,
          fullName,
          paternalName,
          gender,
          birthday,
          regionId,
          firstName,
          departmentId,
          departmentRole,
          phone,
          idCardImage,
          idCardNumber,
          socialCardNumber,
          address1,
          address2,
          releaseDate,
          submitionDate,
          zipPostalCode,
        },
        { where: { id, companyId } },
      );
      console.log("END editWorker");
    } catch (err) {
      console.log("ERROR editWorker", err);
      throw new MoleculerError("Try again", 409);
    }
  }

  public async checkRoleAttachPermsAndGroups(createdWorker: any, departmentId: number, departmentRole: string): Promise<void> {
    try {
      console.log("START checkRoleAttachPermsAndGroups with params", createdWorker, departmentId, departmentRole);
      const {
        callCenter: { id: callCenter },
        callCenterHead: { id: callCenterHead },
        configWorker: { id: configWorker },
        engineer: { id: engineer },
        engineeringHead: { id: engineeringHead },
        hr: { id: hr },
        hrHead: { id: hrHead },
        receptionForCallCenter: { id: receptionForCallCenter },
        storekeeper: { id: storekeeper },
      } = constants.group;


      if (departmentId === ENGINEERING.ID) {
        if (departmentRole === ROLE.HEAD) {
          await createdWorker.setPermissionsGroups([engineeringHead]);
        } else if (departmentRole === ROLE.CONFIG_WORKER) {
          await createdWorker.setPermissionsGroups([configWorker]);
        } else if (departmentRole === ROLE.ENGINEER) {
          await createdWorker.setPermissionsGroups([engineer]);
        }
      } else if (departmentId === CALL_CENTER.ID) {
        if (departmentRole === ROLE.HEAD) {
          await createdWorker.setPermissionsGroups([callCenterHead]);
        } else if (departmentRole === ROLE.CALL_CENTER) {
          await createdWorker.setPermissionsGroups([callCenter]);
        }
      } else if (departmentId === RECEPTION.ID && departmentRole === ROLE.RECEPTION) {
        await createdWorker.setPermissionsGroups([receptionForCallCenter]);
      } else if (departmentId === HR.ID) {
        if (departmentRole === ROLE.HEAD) {
          await createdWorker.setPermissionsGroups([hrHead]);
        } else if (departmentRole === ROLE.HR) {
          await createdWorker.setPermissionsGroups([hr]);
        }
      } else if (departmentId === FINANCE_AND_LAW.ID && departmentRole === ROLE.STOREKEEPER) {
        await createdWorker.setPermissionsGroups([storekeeper]);
      }
      console.log("END checkRoleAttachPermsAndGroups");
    } catch (err) {
      console.log("ERROR checkRoleAttachPermsAndGroups", err);
      throw new MoleculerError("Permissions and groups didn't attach, try attach manually.", 409);
    }
  }

  public async getDepartment(name) {
    const department = await departmentModel.findOne({ where: { name } });
    if (!department) {
      console.log("ERROR getDepartment", "Engineering department doesnt exists.");
      throw new MoleculerError("Engineering department doesnt exists.", 409);
    }
    return department;
  }

  public async attachPermission(user: any, permission: number): Promise<void> {
    try {
      console.log("START attachPermission with params", user, permission);
      await user.addPermission(permission);
      console.log("END attachPermission");
    } catch (err) {
      console.log("ERROR attachPermission", err);
      throw new MoleculerError("Permission didn't attach.", 409);
    }
  }

  public async attachPermissionsGroup(user: any, permissionsGroup: number): Promise<void> {
    try {
      console.log("START attachPermissionsGroup with params", user, permissionsGroup);
      await user.addPermissionsGroup(permissionsGroup);
      console.log("END attachPermissionsGroup");
    } catch (err) {
      console.log("ERROR attachPermission", err);
      throw new MoleculerError("Permission didn't attach.", 409);
    }
  }

  public async removePermission(user: any, permission: number): Promise<void> {
    try {
      console.log("START attachPermission with params", user, permission);
      await user.removePermission(permission);
      console.log("END attachPermission");
    } catch (err) {
      console.log("ERROR attachPermission", err);
      throw new MoleculerError("Permission didn't remove.", 409);
    }
  }

  public async removePermissionsGroup(user: any, permissionsGroup: number): Promise<void> {
    try {
      console.log("START attachPermissionsGroup with params", user, permissionsGroup);
      await user.removePermissionsGroup(permissionsGroup);
      console.log("END attachPermissionsGroup");
    } catch (err) {
      console.log("ERROR attachPermission", err);
      throw new MoleculerError("Permission didn't remove.", 409);
    }
  }

  public async getDepartmentById(id: number): Promise<iProfile.DepartmentParams> {
    try {
      console.log("START getDepartmentById with params", id);
      const department = await departmentModel.findOne({ where: { id, disabled: false } });
      if (!department) {
        throw new MoleculerError("Department doesn't exist", 409);
      }
      return department;
    } catch (err) {
      console.log("ERROR getDepartmentById", err);
      throw new MoleculerError("Department doesn't exist", 409);
    }
  }

  public checkWorkersExists(findWorkers: any, workersIds: number[]): { existsWorkers: number[]; notExistsWorkers: number[] } {
    try {
      console.log("START checkWorkersExists with params", findWorkers, workersIds);

      let existsWorkers = [];
      let notExistsWorkers = [];

      if (findWorkers.length > 0) {
        if (findWorkers.length < workersIds.length) {
          const findWorkersIds = findWorkers.map((worker) => worker.id);

          workersIds.forEach((id) => {
            if (findWorkersIds.includes(id)) {
              existsWorkers.push(id);
            } else {
              notExistsWorkers.push(id);
            }
          });
        } else {
          existsWorkers = workersIds;
        }
      } else {
        notExistsWorkers = workersIds;
      }

      return { existsWorkers, notExistsWorkers };
    } catch (err) {
      console.log("ERROR checkWorkersExists", err);
      throw new MoleculerError("Try again", 409);
    }
  }

  public async getWorkersByIds(ids: number[], companyId: number): Promise<iProfile.UserParams[]> {
    const workers = await userModel.findAll({
      where: {
        id: ids,
        companyId,
        companyRole: { [Op.notIn]: ["admin", "owner"] },
      },
    });
    if (!workers) {
      console.log("ERROR getWorkersByIds", "Workers doesn't exist..");
      throw new MoleculerError("Workers doesn't exist..", 409);
    }
    return workers;
  }


  public async updateWorkersDepRoleRegion(existWorkersId: number[], departmentId: number, role: string, regionId: number): Promise<void> {
    const transaction = await db.transaction();
    try {
      console.log("START updateWorkersDepartmentAndRole with params", existWorkersId, departmentId, role);

      await userModel.update(
        { departmentId, departmentRole: role, regionId },
        { where: { id: existWorkersId }, transaction },
      );
      await usersPermissionsModel.destroy({
        where: { userId: existWorkersId },
        transaction,
      });
      console.log("END updateWorkersDepartmentAndRole");
      await transaction.commit();
    } catch (err) {
      console.log("ERROR updateWorkersDepartmentAndRole", err);
      await transaction.rollback();
      throw new MoleculerError("Workers department and role didn't update, try again.", 409);
    }
  }

  public async getPermissionsByIds(permissionsIds: number[], productId: number): Promise<iProfile.PermissionsParams[]> {
    const permissions = await permissionsModel.findAll({
      where: { id: permissionsIds, productId },
    });
    if (!permissions) {
      console.log("ERROR getPermissionsByIds", "Permissions doesn't exist.");
      throw new MoleculerError("Permissions doesn't exist.", 409);
    }
    return permissions;
  }

  public async getPermissionByIds(permissionsId: number, productId: number): Promise<iProfile.PermissionsParams> {
    const permission = await permissionsModel.findOne({
      where: { id: permissionsId, productId },
    });
    if (!permission) {
      console.log("ERROR getPermissionByIds", "Permission doesn't exist.");
      throw new MoleculerError("Permission doesn't exist.", 409);
    }
    return permission;
  }

  public async addPermissionToGroup(permission: { id: number; departmentId: number; name: string }, permissionsGroupId: number): Promise<void> {
    try {
      console.log("START addPermissionToGroup with params", permission, permissionsGroupId);

      const perm = JSON.stringify(permission);
      await permissionsGroupModel.update(
        { permissions: literal(`"permissions" || '${perm}'::jsonb`) },
        {
          where: [
            { id: permissionsGroupId },
            literal(`NOT EXISTS(SELECT 1 FROM JSONB_ARRAY_ELEMENTS("permissions") perm WHERE perm='${perm}')`),
          ],
        });
      console.log("END addPermissionToGroup");
    } catch (err) {
      console.log("ERROR addPermissionToGroup", err);
      throw new MoleculerError("Permission doesn't add to group.", 409);
    }
  }

  public async deletePermissionFromGroup(permission: { id: number; departmentId: number; name: string }, permissionsGroupId: number): Promise<void> {
    try {
      console.log("START deletePermissionFromGroup with params", permission, permissionsGroupId);

      const perm = JSON.stringify(permission);

      await permissionsGroupModel.update(
        {
          permissions: literal(`
          "permissions" - CAST((
            SELECT "position"-1 
            FROM "public"."PermissionsGroup", jsonb_array_elements("permissions") 
            WITH ordinality arr("permissions_obj", "position")
            WHERE "id"=${permissionsGroupId} and "permissions_obj" = '${perm}') AS int)`),
        },
        { where: { id: permissionsGroupId } },
      );
      console.log("END deletePermissionFromGroup");
    } catch (err) {
      console.log("ERROR deletePermissionFromGroup", err);
      throw new MoleculerError("Permission doesn't exist in group.", 409);
    }
  }

  public async checkPermissionsGroupName(name: string, permissionsGroupId?: number): Promise<void> {
    let where: { name: string; id?: any } = { name };

    if (permissionsGroupId) {
      where = { name, id: { [Op.not]: permissionsGroupId } };
    }
    const permissionsGroup = await permissionsGroupModel.findOne({ where });
    if (permissionsGroup) {
      console.log("ERROR checkPermissionGroupName", "PermissionGroup with this name already exist.");
      throw new MoleculerError("PermissionGroup with this name already exist.", 409);
    }
  }

  public async getUserWithPermissions(userId) {
    const user = await userModel.findOne({
      where: { id: userId },
      include: [{
        model: permissionsModel,
        as: "permissions",
      }],
    });
    if (!user) {
      console.log("ERROR getUserPermissions", "PermissionGroup with this name already exist.");
      throw new MoleculerError("User doesn't exist.", 409);
    }
    return user;
  }

  public async createPermissionsGroup(productId: number, name: string, type: string, permissions: object[]): Promise<iProfile.PermissionsGroupParams> {
    try {
      console.log("START makePermissionsGroup with params", productId, name, type, permissions);
      return await permissionsGroupModel.create({
        name,
        type,
        productId,
        permissions,
      });
      console.log("END makePermissionsGroup");
    } catch (err) {
      console.log("ERROR updateWorkersDepartmentAndRole", err);
      throw new MoleculerError("Permissions group didn't create, try again.", 409);
    }
  }

  public async updatePermissionsGroupName(name: string, permissionGroupId: number, productId: number): Promise<void> {
    try {
      console.log("START updatePermissionsGroup with params", name);
      await permissionsGroupModel.update(
        { name },
        { where: { id: permissionGroupId, productId } },
      );
      console.log("END updatePermissionsGroup");
    } catch (err) {
      console.log("ERROR updatePermissionsGroup", err);
      throw new MoleculerError("Permissions group didn't update, try again.", 409);
    }
  }

  public async searchFilterWorkers(params: iProfile.SearchFilterWorkerParams, ctx: BaseCtx): Promise<iProfile.RetUsers> {
    try {
      console.log("START searchFilterWorkers with params", params);
      const { companyId, departmentId, limit = "30", offset = "0", regionId, text, type } = params;

      const where: any = {
        [Op.and]: [
          { companyRole: { [Op.not]: COMPANY_ROLE.ADMIN } },
          { companyId },
        ],
      };

      if (regionId) {
        where[Op.and].push({ regionId });
      }

      if (departmentId) {
        where[Op.and].push({ departmentId });
      }

      if (type && text) {
        if (type === ADDRESS) {
          where[Op.and].push({
            [Op.or]: [
              { address1: { [Op.iLike]: `%${text}%` } },
              { address2: { [Op.iLike]: `%${text}%` } },
            ],
          });
        } else {
          where[Op.and].push({ [type]: { [Op.iLike]: `%${text}%` } });
        }
      }

      const users = await userModel.findAndCountAll({
        where,
        include: [{ model: departmentModel, as: "department" }],
        attributes: { exclude: ["password", "deletedAt"] },
        limit,
        offset,
        raw: true,
      });

      const parsedUsers = {
        count: users.count,
        rows: [],
      };

      if (users.count) {
        const { rows: regions } = await ctx.call("v1.addressesService.getRegions", { limit: 1000, offset: 0 });
        users.rows.forEach(user => {
          regions.forEach(region => {
            if (user.regionId === region.id) {
              parsedUsers.rows.push({ ...user, region });
            }
          });
        });
      }

      return parsedUsers;

    } catch (err) {
      console.log("ERROR searchFilterWorkers", err);
      throw new MoleculerError("Try again", 409);
    }
  }

  public async searchWorkers(params: iProfile.SearchWorkersParams, companyId: number, ctx: BaseCtx): Promise<iProfile.RetUsers> {
    const { departmentId: depId, limit = "100", name, offset = "0", role } = params;

    let fullName;
    let departmentId;
    let departmentRole;
    const companyRole = { [Op.not]: "admin" };

    if (!name) {
      fullName = { [Op.notIn]: [] };
    } else {
      fullName = { [Op.iLike]: `%${name}%` };
    }

    if (!depId) {
      departmentId = { [Op.notIn]: [] };
    } else {
      departmentId = depId;
    }

    if (!role) {
      departmentRole = { [Op.notIn]: [] };
    } else {
      departmentRole = role;
    }

    const users = await userModel.findAndCountAll({
      where: {
        fullName,
        departmentId,
        departmentRole,
        companyRole,
        companyId,
      },
      attributes: { exclude: ["password", "deletedAt"] },
      raw: true,
      limit,
      offset,
    });
    if (!users) {
      console.log("ERROR searchWorkers", "Try again.");
      throw new MoleculerError("Try again.", 409);
    }


    const parsedUsers = {
      count: users.count,
      rows: [],
    };

    if (users.count) {
      const { rows: regions } = await ctx.call("v1.addressesService.getRegions", { limit: 1000, offset: 0 });
      users.rows.forEach(user => {
        regions.forEach(region => {
          if (user.regionId === region.id) {
            parsedUsers.rows.push({ ...user, region });
          }
        });
      });
    }

    return parsedUsers;
  }

  public async getWorkerByIds(userId: number, departmentId: number, companyId: number, regionId: number): Promise<iProfile.UserParams> {
    try {
      console.log("START getWorkerByIdAndRegion with params", userId, departmentId, regionId, companyId);
      const companyRole = { [Op.notIn]: [COMPANY_ROLE.ADMIN, COMPANY_ROLE.OWNER] };

      const where: { id: number; companyId: number; departmentId: number; regionId?: number; companyRole: { [key: string]: string | string[] } } = {
        id: userId,
        companyId,
        companyRole,
        departmentId,
      };

      if (regionId) {
        where.regionId = regionId;
      }

      const worker = await userModel.findOne({
        where,
        attributes: { exclude: ["password", "deletedAt", "updatedAt"] },
      });

      if (!worker) {
        throw new MoleculerError("Worker in this region doesn't exist.", 409);
      }
      return worker;
    } catch (err) {
      console.log("ERROR getWorkerByIdAndRegion", "Worker doesn't exist.");
      throw new MoleculerError("Worker in this region doesn't exist.", 409);
    }
  }

  public async searchOperators(params: iProfile.SearchOperatorsParams, companyId: number, departmentId: number): Promise<iProfile.RetUsers> {
    try {
      console.log("START searchOperators with params", params, companyId, departmentId);
      const { limit = "100", name, offset = "0" } = params;

      let fullName;

      if (!name) {
        fullName = { [Op.notIn]: [] };
      } else {
        fullName = { [Op.iLike]: `%${name}%` };
      }

      return await userModel.findAndCountAll({
        where: {
          fullName,
          departmentId,
          companyId,
        },
        attributes: { exclude: ["password", "deletedAt"] },
        limit,
        offset,
      });
      console.log("END searchOperators");
    } catch (err) {
      console.log("ERROR searchOperators", err);
      throw new MoleculerError("Try again.", 409);
    }
  }

  public async searchEngineers(params: iProfile.SearchOperatorsParams, companyId: number, regionId?: number): Promise<iProfile.RetUsers> {
    try {
      console.log("START searchEngineers with params", params, companyId);
      const { limit = "100", name, offset = "0" } = params;

      const where: iProfile.SearchEngineersWhere = {
        companyId,
        departmentId: ENGINEERING.ID,
        departmentRole: ROLE.ENGINEER,
      };

      if (name) {
        where.fullName = { [Op.iLike]: `%${name}%` };
      }
      if (regionId) {
        where.regionId = regionId;
      }

      return await userModel.findAndCountAll({
        where,
        limit,
        offset,
        attributes: { exclude: ["password", "deletedAt"] },
      });
    } catch (err) {
      console.log("ERROR searchEngineers", err);
      throw new MoleculerError("Try again.", 409);
    }
  }

  public async searchConfigWorkers(params: iProfile.SearchOperatorsParams, companyId: number): Promise<iProfile.RetUsers> {
    try {
      console.log("START searchConfigWorkers with params", params, companyId);
      const { limit = "100", name, offset = "0" } = params;

      const where: iProfile.SearchEngineersWhere = {
        companyId,
        departmentId: ENGINEERING.ID,
        departmentRole: ROLE.CONFIG_WORKER,
      };

      if (name) {
        where.fullName = { [Op.iLike]: `%${name}%` };
      }

      return await userModel.findAndCountAll({
        where,
        limit,
        offset,
        attributes: { exclude: ["password", "deletedAt"] },
      });
    } catch (err) {
      console.log("ERROR searchConfigWorkers", err);
      throw new MoleculerError("Try again.", 409);
    }
  }

  public checkEditablePermsGroup(permissionsGroupId): void {
    const {
      RequestOwner: { id: RequestOwner },
      callCenter: { id: callCenter },
      callCenterHead: { id: callCenterHead },
      configWorker: { id: configWorker },
      engineer: { id: engineer },
      engineeringHead: { id: engineeringHead },
      hr: { id: hr },
      hrHead: { id: hrHead },
      receptionForCallCenter: { id: receptionForCallCenter },
      storekeeper: { id: storekeeper },
    } = constants.group;
    if ([RequestOwner, callCenter, callCenterHead, configWorker, engineer, engineeringHead, receptionForCallCenter, hrHead, hr, storekeeper].includes(permissionsGroupId)) {
      throw new MoleculerError("This permissionsGroup can't be edited.", 409);
    }
  }

  public checkDeletablePermsGroup(permissionsGroupsIds): { notAllowDelPermissionsGroups: number[]; allowDelPermissionsGroups: number[] } {
    const notAllowDelPermissionsGroups = [];
    const allowDelPermissionsGroups = [];

    const {
      RequestOwner: { id: RequestOwner },
      callCenter: { id: callCenter },
      callCenterHead: { id: callCenterHead },
      configWorker: { id: configWorker },
      engineer: { id: engineer },
      engineeringHead: { id: engineeringHead },
      hr: { id: hr },
      hrHead: { id: hrHead },
      receptionForCallCenter: { id: receptionForCallCenter },
      storekeeper: { id: storekeeper },
    } = constants.group;

    permissionsGroupsIds.forEach((id) => {
      if ([RequestOwner, callCenter, callCenterHead, configWorker, engineer, engineeringHead, receptionForCallCenter, hrHead, hr, storekeeper].includes(id)) {
        notAllowDelPermissionsGroups.push(id);
      } else {
        allowDelPermissionsGroups.push(id);
      }
    });
    return { allowDelPermissionsGroups, notAllowDelPermissionsGroups };
  }

  public async getPermissionsGroupsByIds(productId: number, permissionsGroupsIds: number[]): Promise<iProfile.RetPermissionsGroup[]> {
    const permissionsGroups = await permissionsGroupModel.findAll({
      where: { id: permissionsGroupsIds, productId },
      include: [{ model: userModel, as: "users" }],
    });
    if (!permissionsGroups) {
      throw new MoleculerError("PermissionsGroups doesn't exist.", 409);
    }
    return permissionsGroups;
  }

  public checkPermissionsGroupsExists(permissionsGroupsIds: number[], findPermissionsGroups: any): iProfile.RetCheckPermGroupsExists {
    const deletedPermissionsGroups = [];
    let notExistsPermissionsGroups = [];
    const assignedPermissionsGroups = [];
    const findPermissionsGroupsIds = [];

    if (findPermissionsGroups.length === 0) {
      notExistsPermissionsGroups = permissionsGroupsIds;
    } else {

      findPermissionsGroups.forEach((permissionsGroup) => {
        findPermissionsGroupsIds.push(permissionsGroup.id);

        if (permissionsGroup.users.length > 0) {
          assignedPermissionsGroups.push(permissionsGroup.id);
        } else {
          deletedPermissionsGroups.push(permissionsGroup.id);
        }
      });

      if (findPermissionsGroups.length < permissionsGroupsIds.length) {
        permissionsGroupsIds.forEach((id) => {
          if (!findPermissionsGroupsIds.includes(id)) {
            notExistsPermissionsGroups.push(id);
          }
        });
      }
    }

    return { deletedPermissionsGroups, notExistsPermissionsGroups, assignedPermissionsGroups };
  }

  public async deletePermissionsGroups(ids: number[], productId: number): Promise<void> {
    try {
      console.log("START deletePermissionsGroups with params", ids, productId);
      await permissionsGroupModel.destroy({ where: { id: ids, productId } });
      console.log("END deletePermissionsGroups");
    } catch (err) {
      console.log("ERROR deletePermissionsGroups", err);
      throw new MoleculerError("PermissionsGroups doesn't deleted, try again.", 409);
    }
  }

  public async getWorkerMergedPerms(params: iProfile.GetWorkerPermsAndGroupsParams): Promise<iProfile.RetPermissions> {
    const { id: userId, limit = "100", name, offset = "0", productId } = params;

    let where: { productId: number; name?: any } = { productId };
    if (name) {
      where = { productId, name: { [Op.iLike]: `%${name}%` } };
    }

    const activeAttr = [literal(`
       CASE WHEN "Permissions"."id" IN(
          SELECT "UP"."permissionId"
          FROM "public"."UsersPermissions" AS "UP"
          WHERE "UP"."userId" = ${userId} AND "UP"."permissionId" IS NOT NULL
       ) THEN true ELSE false END
    `), "active"];

    const permissions = await permissionsModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [[literal("\"active\" DESC")]],
      attributes: ["id", "name", activeAttr, "createdAt", "updatedAt"],
    });

    if (!permissions) {
      console.log("ERROR getWorkerMergedPermissions", "Try again.");
      throw new MoleculerError("Try again", 409);
    }
    return permissions;
  }

  public async getWorkerMergedPermsGroups(params: iProfile.GetWorkerPermsAndGroupsParams): Promise<iProfile.RetPermissionsGroup> {
    const { id: userId, limit = "100", name, offset = "0", productId } = params;

    let where: { productId: number; name?: any } = { productId };
    if (name) {
      where = { productId, name: { [Op.iLike]: `%${name}%` } };
    }

    const activeAttr = [literal(`
       CASE WHEN "PermissionsGroup"."id" IN(
          SELECT "UP"."permissionGroupId"
          FROM "public"."UsersPermissions" AS "UP"
          WHERE "UP"."userId" = ${userId} AND "UP"."permissionGroupId" IS NOT NULL
       ) THEN true ELSE false END
    `), "active"];

    const permissionsGroups = await permissionsGroupModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [[literal("\"active\" DESC")]],
      attributes: ["id", "name", activeAttr, "createdAt", "updatedAt"],
    });

    if (!permissionsGroups) {
      console.log("ERROR getWorkerMergedPermissionsGroups", "Try again.");
      throw new MoleculerError("Try again", 409);
    }
    return permissionsGroups;
  }

  public async getUsersByGroupAndRegionId(params: iProfile.GetUsersByGroupParams): Promise<iProfile.RetUsers[]> {
    try {
      const { group, regionId } = params;
      const query = {
        include: [{ model: permissionsGroupModel, as: "permissionsGroups", where: { name: group } }],
      };

      if (regionId) {
        query["where"] = { regionId };
      }

      return await userModel.findAll(query);
    } catch (err) {
      console.log("ERROR getUsersByGroupAndRegionId", err);

      throw new MoleculerError("Cant get users, try again.", 409);
    }
  }

  public async getUsersFullNames(params: iProfile.GetUsersFullNamesParams): Promise<iProfile.RetUsers[]> {
    try {
      return await userModel.findAll({
        where: {
          id: params.ids,
          companyId: params.companyId,
          companyRole: { [Op.not]: COMPANY_ROLE.ADMIN },
        },
        attributes: ["id", "fullName"],
      });

    } catch (err) {
      throw new MoleculerError("Cant get users, try again.", 409);
    }
  }

  // public async getCompanyAndProducts(companyId: number) {
  //   const company = await companyModel.findOne({
  //     where: { id: companyId },
  //     include: [{ model: productsModel, as: "products" }],
  //   });
  //   if (!company) {
  //     throw new MoleculerError("Engineering department doesnt exists.", 409);
  //   }
  //   const productsIds = company.products.map(item => item.id);
  //   return { company, productsIds };
  // }
}

export default new ProfileController();
