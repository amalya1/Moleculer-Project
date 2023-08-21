// const nodemailer = require("nodemailer");
// import jwt from "jsonwebtoken";
// import config from "../config";
// // const { config } = require("../config");
// const db = require("module-models");
// const resetTokensModel = db.public.users.ResetToken;
//
// const mailer = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL || "test.testyan.1278@gmail.com",
//     pass: process.env.EMAILPASS || "123456789Abcd!",
//   },
// });
//
//
//
// const generateJwt = async(data: object, expiresIn) => {
//   return await jwt.sign(data, config.AUTHORIZATION_TOKEN_SECRET, { expiresIn: expiresIn });
//
// };
//
// class MailerHelper {
//   public constructor() {
//     this.inviteWorker = this.inviteWorker.bind(this);
//     this.sendSetPasswordEmail = this.sendSetPasswordEmail.bind(this);
//   }
//
//
//   public async sendSetPasswordEmail(email, userId, type){
//     const mailOptions = {
//       from: process.env.EMAIL || '"CRM" <test.testyan.1278@gmail.com>',
//       to: "",
//       subject: "Confirm your email",
//       text: "Confirmation for account",
//     };
//     const resetToken = await generateJwt({ userId }, "1h");
//
//     await resetTokensModel.upsert({ token: resetToken, userId, type });
//
//     mailOptions.to = email;
//     mailOptions.text =`<html><head></head><body><a href="${ config.HOST }/password/set?token=${resetToken}">Confirm account</a></body></html>  `;
//
//     return mailer.sendMail(mailOptions, (error: any, info: any) => {
//       if (error) {
//         console.log("MailError", error);
//         return false;
//       }
//       console.log(info);
//       return true;
//     });
//   }
//
//   public async inviteWorker(email, userId){
//     const mailOptions = {
//       from: process.env.EMAIL || '"CRM" <test.testyan.1278@gmail.com>',
//       to: "",
//       subject: "Invitation from company",
//       text: "Confirmation for account",
//     };
//     const resetToken = await generateJwt({ userId }, "1h");
//
//     await resetTokensModel.upsert({ token: resetToken, userId, type: "setPassword" });
//
//     mailOptions.to = email;
//     mailOptions.text =`<html><head></head><body><a href="${ config.HOST }/invite/accept/?token=${resetToken}">Confirm Invitation</a></body></html>  `;
//
//     return mailer.sendMail(mailOptions, (error: any, info: any) => {
//       if (error) {
//         console.log("MailError", error);
//         return false;
//       }
//       console.log(info);
//       return true;
//     });
//   }
//
//
// }
//
// export default new MailerHelper();
