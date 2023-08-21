// import Moleculer from "moleculer";
//
// import MoleculerError = Moleculer.Errors.MoleculerError;
// const db = require("module-models");
// const { Op } = db;
// const productsModel = db.public.global.Products;
// const permissionsModel = db.public.global.Permissions;
// const permissionsGroupModel = db.public.global.PermissionsGroup;
// const companyProductsModel = db.public.company.CompanyProducts;
// const usersPermissionsModel = db.public.users.UsersPermissions;
// const companyModel = db.public.company.Company;
//
//
// class AdminController {
//   public constructor() {
//     this.getProducts = this.getProducts.bind(this);
//     this.getProductById = this.getProductById.bind(this);
//     this.makePermissionsGroup = this.makePermissionsGroup.bind(this);
//     this.getProductPermissions = this.getProductPermissions.bind(this);
//     this.getProductsPermissionsGroups = this.getProductsPermissionsGroups.bind(this);
//     this.attachPermissionGroup = this.attachPermissionGroup.bind(this);
//     this.attachProduct = this.attachProduct.bind(this);
//     this.getCompanyById = this.getCompanyById.bind(this);
//     this.getPermissionsGroupByName = this.getPermissionsGroupByName.bind(this);
//   }
//
//
//   public async getProducts() {
//     const products = await productsModel.findAll();
//     if (!products) {
//       throw new MoleculerError("Try again", 409);
//     }
//     return products;
//   }
//
//   public async getProductById(productId: number) {
//     const product = await productsModel.findOne({ where: { id: productId } });
//     if (!product) {
//       throw new MoleculerError("Product doesn't exist", 409);
//     }
//     return product;
//   }
//
//   public async getProductPermissions(productId: number) {
//     const product = await productsModel.findOne({
//       where: { id: productId },
//       include: [{ model: permissionsModel, as: "productPermissions" }],
//     });
//     if (!product) {
//       throw new MoleculerError("Try again", 409);
//     }
//     const permissions = product.productPermissions.map((permission) => {
//       const { departmentId, id, name } = permission;
//       return { id, name, departmentId };
//     });
//     return { product, permissions };
//   }
//
//   public async getProductsPermissionsGroups(productId: number) {
//     const permissionsGroups= await permissionsGroupModel.findAll(
//       {
//         where: {
//           productId,
//         },
//       });
//     if (!permissionsGroups) {
//       throw new MoleculerError("Try again", 409);
//     }
//     return permissionsGroups;
//   }
//
//   public async makePermissionsGroup(productId: number, name: string, type: string, permissions: object[]) {
//     try {
//       return await permissionsGroupModel.create({
//         name,
//         type,
//         productId,
//         permissions,
//       });
//     } catch (err) {
//       throw new MoleculerError("Try again", 409);
//     }
//   }
//
//   public async attachProduct(productId: number, companyId: number) {
//     try {
//       await companyProductsModel.upsert({
//         companyId,
//         productId,
//       });
//     } catch (err) {
//       throw new MoleculerError("Try again", 409);
//     }
//   }
//
//   public async attachPermissionGroup(userId: number, permissionGroupId: number) {
//     try {
//       await usersPermissionsModel.upsert({
//         userId,
//         permissionGroupId,
//       });
//     } catch (err) {
//       throw new MoleculerError("Try again", 409);
//     }
//   }
//
//   public async getCompanyById(id: number) {
//     const company = await companyModel.findOne({ where: id });
//     if (!company) {
//       throw new MoleculerError("Company doesn't exist", 409);
//     }
//     return company;
//   }
//
//   public async getPermissionsGroupByName(name) {
//     const permissionGroup = await permissionsGroupModel.findOne({ where: { name } });
//     if (!permissionGroup) {
//       throw new MoleculerError("PermissionGroup doesn't exist", 409);
//     }
//     return permissionGroup;
//   }
// }
//
// export default new AdminController();
