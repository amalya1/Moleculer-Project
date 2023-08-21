// import Moleculer from "moleculer";
// import AdminController from "../controllers/adminController";
// import MoleculerError = Moleculer.Errors.MoleculerError;
// import { iAdmin } from "../types";
//
//
// class AdminManager {
//   public constructor() {
//     this.getProducts = this.getProducts.bind(this);
//     this.getProductPermissions = this.getProductPermissions.bind(this);
//     this.getProductPermissionsGroups = this.getProductPermissionsGroups.bind(this);
//     this.makeProductOwnerGroupPermissions = this.makeProductOwnerGroupPermissions.bind(this);
//     this.attachProduct = this.attachProduct.bind(this);
//   }
//
//
//   public async getProducts() {
//     return await AdminController.getProducts();
//   }
//
//   public async getProductPermissions(ctx: iAdmin.GetByIdCtx) {
//     const { id } = ctx.params;
//     return await AdminController.getProductPermissions(id);
//   }
//
//   public async getProductPermissionsGroups(ctx: iAdmin.GetByIdCtx) {
//     const { id } = ctx.params;
//     return await AdminController.getProductsPermissionsGroups(id);
//   }
//
//   public async makeProductOwnerGroupPermissions(ctx: iAdmin.GetByIdCtx) {
//     const { id: productId } = ctx.params;
//     const { permissions, product: { name } } = await AdminController.getProductPermissions(productId);
//     return await AdminController.makePermissionsGroup(productId, `${name}Owner`, "owner", permissions);
//   }
//
//   public async attachProduct(ctx: iAdmin.ProductAttachCtx) {
//     const { companyId, productId } = ctx.params;
//
//     const company = await AdminController.getCompanyById(companyId);
//     const product = await AdminController.getProductById(productId);
//
//     const { ownerId: userId } = company;
//     const { name: productName } = product;
//     const permissionGroupName = `${productName}Owner`;
//
//     const permissionGroup = await AdminController.getPermissionsGroupByName(permissionGroupName);
//     const { id: permissionGroupId } = permissionGroup;
//
//     await AdminController.attachProduct(productId, companyId);
//     await AdminController.attachPermissionGroup(userId, permissionGroupId);
//
//     return { message: "Product successfully attached" };
//   }
//
// }
// export default new AdminManager();
