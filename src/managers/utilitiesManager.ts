import { iUtilities } from "../types";
import { S3 } from "crm-utilities";

class UtilitiesManager {
  static getSignedUrl(ctx: iUtilities.GetMeCtx) {
    const { ext } = ctx.params;
    console.log("START getSignedUrl EXT=>", ext);
    const result = S3.getSignedUrl({ ext });
    console.log("END getSignedUrl FileName", result.fileName);
    return result;
  }
}
export default UtilitiesManager;
