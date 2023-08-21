import config from "../config";
// Import jwt from "json"
const jwt = require("jsonwebtoken");
const db = require("module-models");
const jwtHelper = async (auth: object)=>{
  const token = await jwt.sign(auth, config.AUTHORIZATION_TOKEN_SECRET);
  await db.redis.set(`tokens:${token}`, JSON.stringify(auth), "EX", 3600);
  return token;
};
export default jwtHelper;
