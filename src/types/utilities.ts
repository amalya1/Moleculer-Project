
export namespace iUtilities {
    export interface MetaData {
        companyId?: number;
        userId: number;
        departmentRole?: string;
        departmentId?: number;
    }
    export interface GetMeCtx {
        meta: { data: MetaData };
        params: {
            ext: string
        };
    }
}
