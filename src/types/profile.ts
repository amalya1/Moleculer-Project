import { GenericObject } from "moleculer";

export namespace iProfile {
    export interface MetaData {
        companyId?: number;
        userId: number;
        regionId: number;
        departmentRole?: string;
        departmentId?: number;
        filterByRegion: boolean;
    }
    export interface BaseCtx {
        meta: { data: MetaData };
        call<T, P extends GenericObject = GenericObject>(actionName: string, params?: P, opts?: GenericObject): PromiseLike<T>;
    }
    export type GetMeCtx = BaseCtx

    export interface ResendCtx extends BaseCtx {
        params: ResendParams;
    }
    export interface ResendParams {
        email: string;
    }
    export interface ResendCtx extends BaseCtx {
        params: ResendParams;
    }
    export interface ResendParams {
        email: string;
    }
    export interface GetByIdCtx extends BaseCtx {
        params: GetByIdParams;
    }
    export interface GetByIdParams {
        id: number;
    }
    export interface GetByIdLimitOffsetCtx extends BaseCtx {
        params: GetByIdLimitOffsetParams;
    }
    export interface GetByIdLimitOffsetParams {
        id: number;
        limit?: string;
        offset?: string;
    }
    export interface GetPermsAndGroupsCtx extends BaseCtx {
        params: GetPermsAndGroupsParams;
    }
    export interface GetPermsAndGroupsParams {
        id: number;
        name?: string;
        limit?: string;
        offset?: string;
    }
    export interface GetPermsGroupByIdCtx extends BaseCtx {
        params: GetPermsGroupByIdParams;
    }
    export interface GetPermsGroupByIdParams {
        id: number;
        group: number;
        name?: string;
        limit?: string;
        offset?: string;
    }
    export interface LogoutCtx extends BaseCtx {
        params: LogoutParams;
    }
    export interface LogoutParams {
        token: string;
    }
    export interface SetPassCtx extends BaseCtx {
        params: SetPassParams;
    }
    export interface SetPassParams {
        token: string;
        password: string;
        repeatPassword: string;
    }
    export interface AddWorkerCtx extends BaseCtx{
        params: AddWorkerParams;
    }
    export interface AddWorkerParams {
        departmentId: number;
        departmentRole: Role;
        firstName: string;
        lastName: string;
        paternalName: string;
        gender: Gender;
        birthday: Date;
        email: string;
        phone: string;
        idCardNumber?: string;
        idCardImage?: { img1?: string; img2?: string; img3?: string; img4?: string };
        socialCardNumber?: string;
        address1?: string;
        address2?: string;
        regionId: number;
        zipPostalCode?: string;
        submitionDate?: Date;
        releaseDate?: Date;
    }
    export interface EditWorkerCtx extends BaseCtx {
        params: EditWorkerParams;
    }
    export interface EditWorkerParams {
        id: number;
        departmentId: number;
        departmentRole: Role;
        firstName: string;
        lastName: string;
        paternalName: string;
        gender: Gender;
        birthday: Date;
        email: string;
        phone: string;
        idCardNumber: string;
        idCardImage: { img1?: string; img2?: string; img3?: string; img4?: string };
        socialCardNumber?: string;
        address1: string;
        address2: string;
        regionId: number;
        zipPostalCode: string;
        submitionDate: Date;
        releaseDate: Date;
    }
    export interface DeletePermissionsGroupsCtx extends BaseCtx {
        params: DeletePermissionsGroupsParams;
    }
    export interface DeletePermissionsGroupsParams {
        id: number;
        permissionsGroups: number[];
    }
    export interface ChangeWorkersDepartmentCtx extends BaseCtx {
        params: ChangeWorkersDepartmentParams;
    }
    export interface ChangeWorkersDepartmentParams {
        workersId: number[];
        departmentId: number;
        regionId: number;
        role: Role;
    }
    export type Role = "head" | "engineer" | "configWorker" | "callCenter";
    export type Gender = "male" | "female";
    // export type CompanyRole = "admin" | "owner" | "worker";

    export interface RetUsers {
        rows: UserParams[];
        count: number;
    }

    export interface UserParams {
        id: number;
        companyId: number;
        departmentId: number;
        departmentRole: string;
        companyRole: string;
        firstName: string;
        lastName: string;
        paternalName: string;
        fullName: string;
        gender: Gender;
        birthday: Date;
        email: string;
        phone: string;
        idCardNumber?: string;
        idCardImage?: { img1?: string; img2?: string; img3?: string; img4?: string };
        socialCardNumber?: string;
        address1?: string;
        address2?: string;
        regionId: number;
        zipPostalCode?: string;
        submitionDate?: Date;
        releaseDate?: Date;
        isEmailConfirmed: boolean;
        disabled: boolean;
        createdAt: string;
        updatedAt: string;
    }
    export interface AttachRemovePermCtx extends BaseCtx {
        params: AttachRemovePermParams;
    }
    export interface AttachRemovePermParams {
        id: number;
        permission: number;
    }
    export interface AttachRemovePermGroupCtx extends BaseCtx {
        params: AttachRemovePermGroupParams;
    }
    export interface GetUsersByGroupCtx extends BaseCtx {
        params: GetUsersByGroupParams;
    }
    export interface AttachRemovePermGroupParams {
        id: number;
        group: number;
    }
    export interface GetUsersByGroupParams {
        regionId: number;
        group: string;
    }
    export interface DepartmentParams {
        id: number;
        name: string;
        showName: string;
        disabled: boolean;
        createdAt: string;
        updatedAt: string | null;
        deletedAt: string | null;
    }
    export type Type = "owner" | "head" | "worker";

    export interface RetPermissionsGroup {
        rows: PermissionsGroupParams[];
        count: number;
    }

    export interface RetAssignedRequests {
        id: number;
        assigned: number;
        configed: number;
        status: string;
    }

    export interface PermissionsGroupParams {
        id: number;
        name: string;
        productId: number;
        departmentId: number;
        type: Type;
        permissions: any;
        createdAt: string;
        updatedAt: string | null;
        deletedAt: string | null;
    }
    export interface RetPermissions {
        rows: PermissionsParams[];
        count: number;
    }
    export interface PermissionsParams {
        id: number;
        name: string;
        productId: number;
        departmentId: number;
        type: Type;
        createdAt: string;
        updatedAt: string | null;
        deletedAt: string | null;
    }
    export interface MakeGroupCtx extends BaseCtx {
        params: MakeGroupParams;
    }
    export interface MakeGroupParams {
        id: number;
        name: string;
        permissions: [number];
    }
    export interface MakeGroupFromWorkerPermsCtx extends BaseCtx {
        params: MakeGroupFromWorkerPermsParams;
    }
    export interface MakeGroupFromWorkerPermsParams {
        id: number;
        name: string;
        worker: number;
    }
    export interface EditGroupCtx extends BaseCtx {
        params: EditGroupParams;
    }
    export interface EditGroupParams {
        id: number;
        group: number;
        name: string;
    }
    export interface AddDelPermFromGroupCtx extends BaseCtx {
        params: AddDelPermFromGroupParams;
    }
    export interface AddDelPermFromGroupParams {
        id: number;
        group: number;
        permission: number;
    }

    export type SearchFilterWorkerType = "fullName" | "fullAddress" | "phone";

    export interface SearchFilterWorkersCtx extends BaseCtx {
        params: SearchFilterWorkerParams;
    }
    export interface SearchFilterWorkerParams {
        regionId?: number;
        departmentId?: number;
        type?: SearchFilterWorkerType;
        text?: string;
        limit?: string;
        offset?: string;
        companyId: number;
    }

    // export interface SearchFilterWorkerWhere {
    //     id?: number;
    //     regionId?: number;
    //     departmentId?: number;
    //     fullName?: { [key: string]: string };
    //     fullAddress?: { [key: string]: string };
    //     phone?: { [key: string]: string };
    //     companyRole: any;
    //     companyId: number;
    // }

    export interface SearchWorkersCtx extends BaseCtx {
        params: SearchWorkersParams;
    }
    export interface SearchWorkersParams {
        name?: string;
        departmentId?: number;
        role?: Role;
        limit?: string;
        offset?: string;
    }
    export interface CheckEngineerExistsCtx {
        params: {
            id: number;
            regionId: number;
            companyId: number;
            departmentId: number;
        };
    }
    export interface SearchOperatorsCtx extends BaseCtx {
        params: SearchOperatorsParams;
    }
    export interface SearchOperatorsParams {
        name?: string;
        limit?: string;
        offset?: string;
    }
    export interface GetWorkerPermsAndGroupsCtx extends BaseCtx {
        params: GetWorkerPermsAndGroupsParams;
    }
    export interface GetWorkerPermsAndGroupsParams {
        id: number;
        productId: number;
        name?: string;
        limit?: string;
        offset?: string;
    }
    export interface RetCheckPermGroupsExists {
        deletedPermissionsGroups: number[];
        notExistsPermissionsGroups: number[];
        assignedPermissionsGroups: number[];
    }
    export interface RetDeleteUnUsedPermGroups {
        deletedPermissionsGroups: number[];
        notExistsPermissionsGroups: number[];
        assignedPermissionsGroups: number[];
        notAllowDelPermissionsGroups: number[];
    }

    export interface RetRequest {
        id: number;
        assigned?: number;
        configed?: number;
        companyId: number;
        departmentId: number;
        customerId: number;
        typeId: number;
        tariff: number;
        status: string;
        statusSort: string;
        taskStatus?: string;
        contractId?: string;
        firstName: string;
        lastName: string;
        fullName: string;
        phone: string;
        additionalPhone?: string;
        idCardNumber: string;
        idCardImage: { img1?: string; img2?: string };
        address: GenericObject;
        signature?: string;
        region: string;
        city: string;
        street: string;
        building: string;
        apartment: string;
        fullAddress: string;
        deadline: string;
        createdAt: string;
        updatedAt: string;
        type?: object;
    }

    export interface GetUsersFullNamesCtx extends BaseCtx{
        params: GetUsersFullNamesParams;
    }

    export interface GetUsersFullNamesParams {
        ids: number[];
        companyId: number;
    }
    export interface SearchEngineersWhere {
        companyId: number;
        regionId?: number;
        departmentId: number;
        departmentRole: string;
        fullName?: GenericObject;
    }
}

