"use strict";
import { Service } from "moleculer";
import profileManager from "../managers/profileManager";
import utilitiesManager from "../managers/utilitiesManager";
import { CONSTANTS } from "crm-utilities";
const {
  CUSTOMER: { SEARCH_TYPE }, ROLE, USER: { GENDER },
} = CONSTANTS;

require("dotenv").config();

class UserService extends Service {
  constructor(broker) {
    super(broker);
    this.profileManager = profileManager;
    this.utilitiesManager = utilitiesManager;
    this.parseServiceSchema({
      name: "userService",
      version: "v1",
      actions: {

        getMe: {
          requiredCompanyAuth: true,
          handler: this.profileManager.getMe,
        },

        getSignedUrl: {
          requiredCompanyAuth: true,
          handler: this.utilitiesManager.getSignedUrl,
        },

        logOut: {
          requiredCompanyAuth: true,

          handler: this.profileManager.logOut,
        },

        forgotPassword: {
          requiredCompanyAuth: false,
          params: {
            email: { type: "email", optional: false, empty: false },
          },
          handler: this.profileManager.forgotPassword,
        },

        setPassword: {
          requiredCompanyAuth: false,
          params: {
            token: { type: "string", optional: false, empty: false },
            password: { type: "string", optional: false, empty: false, min: 8 },
            repeatPassword: { type: "string", optional: false, empty: false, min: 8 },
          },
          handler: this.profileManager.setPassword,
        },

        addWorker: {
          requiredCompanyAuth: true,
          params: {
            departmentId: { type: "number", optional: false, positive: true, integer: true, convert: true },
            departmentRole: {
              type: "enum", optional: false, values: [...Object.values(ROLE)],
            },
            firstName: { type: "string", optional: false },
            lastName: { type: "string", optional: false },
            paternalName: { type: "string", optional: false },
            gender: {
              type: "enum", optional: false, values: [...Object.values(GENDER)],
            },
            birthday: { type: "date", optional: false, convert: true },
            email: { type: "email", optional: false, empty: false },
            phone: { type: "string", optional: false, empty: false },
            idCardImage: { type: "object", optional: true, props: {
              img1: { type: "string", optional: false },
              img2: { type: "string", optional: true },
              img3: { type: "string", optional: true },
              img4: { type: "string", optional: true },
            } },
            idCardNumber: { type: "string", optional: true },
            socialCardNumber: { type: "string", optional: true },
            address1: { type: "string", optional: true, empty: false },
            address2: { type: "string", optional: true, empty: false },
            regionId: { type: "number", optional: false, empty: false, positive: true, integer: true, convert: true },
            zipPostalCode: { type: "string", optional: true, empty: false },
            submitionDate: { type: "date", optional: true, convert: true },
            releaseDate: { type: "date", optional: true, convert: true },
          },
          handler: this.profileManager.addWorker,
        },

        editWorker: {
          requiredCompanyAuth: true,
          params: {
            id: { type: "number", optional: false, integer: true, positive: true, convert: true },
            departmentId: { type: "number", optional: false, positive: true, integer: true, convert: true },
            departmentRole: {
              type: "enum", optional: false, values: [...Object.values(ROLE)],
            },
            firstName: { type: "string", optional: false },
            lastName: { type: "string", optional: false },
            paternalName: { type: "string", optional: false },
            gender: {
              type: "enum", optional: false, values: [...Object.values(GENDER)],
            },
            birthday: { type: "date", optional: false, convert: true },
            email: { type: "email", optional: false, empty: false },
            phone: { type: "string", optional: false, empty: false },
            idCardImage: { type: "object", optional: true, props: {
              img1: { type: "string", optional: false },
              img2: { type: "string", optional: true },
              img3: { type: "string", optional: true },
              img4: { type: "string", optional: true },
            } },
            idCardNumber: { type: "string", optional: true },
            socialCardNumber: { type: "string", optional: true },
            address1: { type: "string", optional: true, empty: false },
            address2: { type: "string", optional: true, empty: false },
            regionId: { type: "number", optional: false, empty: false, positive: true, integer: true, convert: true },
            zipPostalCode: { type: "string", optional: true, empty: false },
            submitionDate: { type: "date", optional: true, convert: true },
            releaseDate: { type: "date", optional: true, convert: true },
          },
          handler: this.profileManager.editWorker,
        },

        changeWorkersDepartment: {
          requiredCompanyAuth: true,
          params: {
            workersId: {
              type: "array",
              optional: false,
              min: 1,
              items: {
                type: "number", positive: true, integer: true,
              },
            },
            departmentId: { type: "number", optional: false, integer: true, positive: true },
            role: {
              type: "enum", optional: false, values: [...Object.values(ROLE)],
            },
            regionId: { type: "number", optional: false, empty: false, positive: true, integer: true },
          },
          handler: this.profileManager.changeWorkersDepartment,
        },

        resendConfirmationLink: {
          requiredCompanyAuth: false,
          params: {
            email: { type: "email", optional: false, empty: false },
          },
          handler: this.profileManager.resendConfirmationLink,
        },

        getWorkers: {
          requiredCompanyAuth: true,
          handler: this.profileManager.getWorkers,
        },

        getWorkerById: {
          params: {
            id: { type: "number", optional: false, integer: true, positive: true, convert: true },
          },
          requiredCompanyAuth: true,
          handler: this.profileManager.getWorkerById,
        },

        getWorkersByDepartment: {
          params: {
            id: { type: "number", optional: false, integer: true, positive: true, convert: true },
            limit: { type: "string", optional: true, empty: false },
            offset: { type: "string", optional: true, empty: false },
          },
          requiredCompanyAuth: true,
          handler: this.profileManager.getWorkersByDepartment,
        },

        getEngineers: {
          requiredCompanyAuth: true,
          handler: this.profileManager.getEngineers,
        },

        searchFilterWorkers: {
          params: {
            regionId: { type: "number", optional: true, integer: true, positive: true, convert: true },
            departmentId: { type: "number", optional: true, integer: true, positive: true, convert: true },
            type: { type: "enum", values: [...Object.values(SEARCH_TYPE)], optional: true, empty: false },
            text: { type: "string", optional: true, empty: true },
            limit: { type: "string", optional: true, empty: false },
            offset: { type: "string", optional: true, empty: false },
          },
          requiredCompanyAuth: true,
          handler: this.profileManager.searchFilterWorkers,
        },

        searchWorkers: {
          params: {
            name: { type: "string", optional: true, empty: false },
            departmentId: { type: "number", optional: true, integer: true, positive: true, convert: true },
            role: {
              type: "enum", optional: true, values: [...Object.values(ROLE)],
            },
            limit: { type: "string", optional: true, empty: false },
            offset: { type: "string", optional: true, empty: false },
          },
          requiredCompanyAuth: true,
          handler: this.profileManager.searchWorkers,
        },

        checkWorkerExists: {
          params: {
            id: { type: "number", optional: false, integer: true, positive: true, convert: true },
            companyId: { type: "number", optional: false, integer: true, positive: true, convert: true },
            departmentId: { type: "number", optional: false, integer: true, positive: true, convert: true },
            regionId: { type: "number", optional: true, integer: true, positive: true, convert: true },
          },
          requiredCompanyAuth: true,
          handler: this.profileManager.checkWorkerExists,
        },

        searchOperators: {
          params: {
            name: { type: "string", optional: true, empty: true },
            limit: { type: "string", optional: true, empty: true },
            offset: { type: "string", optional: true, empty: true },
          },
          requiredCompanyAuth: true,
          handler: this.profileManager.searchOperators,
        },

        searchEngineers: {
          params: {
            name: { type: "string", optional: true, empty: true },
            limit: { type: "string", optional: true, empty: true },
            offset: { type: "string", optional: true, empty: true },
          },
          requiredCompanyAuth: true,
          handler: this.profileManager.searchEngineers,
        },

        searchConfigWorkers: {
          params: {
            name: { type: "string", optional: true, empty: true },
            limit: { type: "string", optional: true, empty: true },
            offset: { type: "string", optional: true, empty: true },
          },
          requiredCompanyAuth: true,
          handler: this.profileManager.searchConfigWorkers,
        },

        getProductPermissions: {
          requiredCompanyAuth: true,
          params: {
            id: { type: "number", optional: false, integer: true, positive: true, convert: true },
            name: { type: "string", optional: true, empty: false },
            limit: { type: "string", optional: true, empty: false },
            offset: { type: "string", optional: true, empty: false },
          },
          handler: this.profileManager.getProductPermissions,
        },

        getProductPermissionsGroups: {
          requiredCompanyAuth: true,
          params: {
            id: { type: "number", optional: false, integer: true, positive: true, convert: true },
            name: { type: "string", optional: true, empty: false },
            limit: { type: "string", optional: true, empty: false },
            offset: { type: "string", optional: true, empty: false },
          },
          handler: this.profileManager.getProductPermissionsGroups,
        },

        getPermsGroupById: {
          requiredCompanyAuth: true,
          params: {
            id: { type: "number", optional: false, integer: true, positive: true, convert: true },
            group: { type: "number", optional: false, integer: true, positive: true, convert: true },
            name: { type: "string", optional: true, empty: true },
            limit: { type: "string", optional: true, empty: false },
            offset: { type: "string", optional: true, empty: false },
          },
          handler: this.profileManager.getPermsGroupById,
        },

        makePermissionsGroup: {
          requiredCompanyAuth: true,
          params: {
            id: { type: "number", optional: false, empty: false, convert: true },
            name: { type: "string", optional: false, empty: false },
            permissions: {
              type: "array",
              items: {
                type: "number", convert: true, optional: false,
              }, optional: false, empty: false,
            },
          },
          handler: this.profileManager.makePermissionsGroup,
        },

        editPermissionsGroup: {
          requiredCompanyAuth: true,
          params: {
            id: { type: "number", optional: false, empty: false, convert: true },
            group: { type: "number", optional: false, empty: false, convert: true },
            name: { type: "string", optional: false, empty: false },
          },
          handler: this.profileManager.editPermissionsGroup,
        },

        addPermissionToGroup: {
          requiredCompanyAuth: true,
          params: {
            id: { type: "number", optional: false, empty: false, convert: true },
            group: { type: "number", optional: false, empty: false, convert: true },
            permission: { type: "number", optional: false, empty: false, convert: true },
          },
          handler: this.profileManager.addPermissionToGroup,
        },

        deletePermissionFromGroup: {
          requiredCompanyAuth: true,
          params: {
            id: { type: "number", optional: false, empty: false, convert: true },
            group: { type: "number", optional: false, empty: false, convert: true },
            permission: { type: "number", optional: false, empty: false, convert: true },
          },
          handler: this.profileManager.deletePermissionFromGroup,
        },

        deleteUnUsedPermissionsGroups: {
          requiredCompanyAuth: true,
          params: {
            id: { type: "number", optional: false, empty: false, convert: true },
            permissionsGroups: {
              type: "array",
              optional: false,
              min: 1,
              items: {
                type: "number", positive: true, integer: true,
              },
            },
          },
          handler: this.profileManager.deleteUnUsedPermissionsGroups,
        },

        deletePermissionsGroups: {
          requiredCompanyAuth: true,
          params: {
            id: { type: "number", optional: false, empty: false, convert: true },
            permissionsGroups: {
              type: "array",
              optional: false,
              min: 1,
              items: {
                type: "number", positive: true, integer: true,
              },
            },
          },
          handler: this.profileManager.deletePermissionsGroups,
        },

        makeGroupFromWorkerPerms: {
          requiredCompanyAuth: true,
          params: {
            id: { type: "number", optional: false, empty: false, convert: true },
            worker: { type: "number", optional: false, empty: false, convert: true },
            name: { type: "string", optional: false, empty: false },
          },
          handler: this.profileManager.makeGroupFromWorkerPerms,
        },

        getWorkerMergedPerms: {
          requiredCompanyAuth: true,
          params: {
            id: { type: "number", optional: false, empty: false, convert: true },
            productId: { type: "number", optional: false, empty: false, convert: true },
            name: { type: "string", optional: true, empty: true },
            limit: { type: "string", optional: true, empty: false },
            offset: { type: "string", optional: true, empty: false },
          },
          handler: this.profileManager.getWorkerMergedPerms,
        },

        getWorkerMergedPermsGroups: {
          requiredCompanyAuth: true,
          params: {
            id: { type: "number", optional: false, empty: false, convert: true },
            productId: { type: "number", optional: false, empty: false, convert: true },
            name: { type: "string", optional: true, empty: true },
            limit: { type: "string", optional: true, empty: false },
            offset: { type: "string", optional: true, empty: false },
          },
          handler: this.profileManager.getWorkerMergedPermsGroups,
        },

        attachPermissionToWorker: {
          requiredCompanyAuth: true,
          params: {
            id: { type: "number", optional: false, empty: false, convert: true },
            permission: { type: "number", optional: false, empty: false, convert: true },
          },
          handler: this.profileManager.attachPermissionToWorker,
        },

        attachPermissionsGroupToWorker: {
          requiredCompanyAuth: true,
          params: {
            id: { type: "number", optional: false, empty: false, convert: true },
            group: { type: "number", optional: false, empty: false, convert: true },
          },
          handler: this.profileManager.attachPermissionsGroupToWorker,
        },

        removePermissionFromWorker: {
          requiredCompanyAuth: true,
          params: {
            id: { type: "number", optional: false, empty: false, convert: true },
            permission: { type: "number", optional: false, empty: false, convert: true },
          },
          handler: this.profileManager.removePermissionFromWorker,
        },

        removePermissionsGroupFromWorker: {
          requiredCompanyAuth: true,
          params: {
            id: { type: "number", optional: false, empty: false, convert: true },
            group: { type: "number", optional: false, empty: false, convert: true },
          },
          handler: this.profileManager.removePermissionsGroupFromWorker,
        },

        getUsersByGroupAndFilterByRegion: {
          requiredCompanyAuth: true,
          params: {
            group: { type: "string", optional: false, empty: false, convert: true },
            regionId: { type: "number", optional: true, positive: true, integer: true, convert: true },
          },
          handler: this.profileManager.getUsersByGroupAndFilterByRegion,
        },

        getUsersFullNames: {
          requiredCompanyAuth: true,
          params: {
            ids: {
              type: "array",
              optional: false,
              min: 1,
              items: {
                type: "number", positive: true, integer: true,
              },
            },
            companyId: { type: "number", optional: false, positive: true, integer: true, convert: true },
          },
          handler: this.profileManager.getUsersFullNames,
        },

        getUpcomingBdays: {
          requiredCompanyAuth: true,
          handler: this.profileManager.getUpcomingBdays,
        },


        // getProducts: {
        //   requiredAdminAuth: true,
        //   handler: this.adminManager.getProducts,
        // },
        //
        // getProductPermissionsAdmin: {
        //   requiredAdminAuth: true,
        //   handler: this.adminManager.getProductPermissions,
        // },
        //
        // getProductPermissionsGroupsAdmin: {
        //   requiredAdminAuth: true,
        //   handler: this.adminManager.getProductPermissionsGroups,
        // },
        //
        // makeProductOwnerGroupPermissions: {
        //   requiredAdminAuth: true,
        //   params: {
        //     id: { type: "number", optional: false, empty: false, convert: true },
        //   },
        //   handler: this.adminManager.makeProductOwnerGroupPermissions,
        // },
        //
        // attachProduct: {
        //   requiredAdminAuth: true,
        //   params: {
        //     productId: { type: "number", optional: false, empty: false, convert: true },
        //     companyId: { type: "number", optional: false, empty: false, convert: true },
        //   },
        //   handler: this.adminManager.attachProduct,
        // },
      },
    });
  }
}
export = UserService;
