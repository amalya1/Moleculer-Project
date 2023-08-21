// Const ip = require('ip');

const config = {
  PORT: process.env.PORT || 3000,
  HOST: "http://getpfnet.herokuapp.com",
  MOLECULER_PORT: process.env.MOLECULER_PORT || 3001,
  // IP: process.env.IP || ip.address(), // 'localhost',
  AUTHORIZATION_TOKEN_SECRET: process.env.AUTHORIZATION_TOKEN_SECRET || "LOCAL_SECRET_KEY",
  WEBSOCKET_PATH: process.env.WEBSOCKET_PATH || "/socket.io",
  CAMPAIGNS_DLR_SUBMIT_DESTINATION: "DLR:pushDlrs",
  DASHBOARD_SHARE: "DLR:pushDlrs",
  EXTERNAL_SENT: "DLR:pushDlrs",
  ALERTS_DLR_SUBMIT_DESTINATION: "DLR:pushDlrs",
  QUIZ_DLR_SUBMIT_DESTINATION: "DLR:pushDlrs",
  INFOBIP_INBOUND: "INBOUND:saveInfobip",
  INFOBIP_INBOUND_REPLY: "DLR:pushDlrs",
  FLOWROUTE_INBOUND: "INBOUND:saveFlowroute",
  NODE_ENV: process.env.NODE_ENV || "production",
  // APP_TEST_URL: process.env.APP_TEST_URL || `http://${ip.address()}:${process.env.PORT || 3000}`,
  // EXPORT_CSV_URL: process.env.EXPORT_CSV_URL || `http://${ip.address()}:${process.env.MOLECULER_PORT || 3001}/api/v1/export/csv`,
  // EXPORT_PDF_URL: process.env.EXPORT_PDF_URL || `http://${ip.address()}:${process.env.MOLECULER_PORT || 3001}/api/v1/export/pdf`,
  ZENDESK_SHARED_SECRET: process.env.ZENDESK_SHARED_SECRET || "youshouldsetsharedsecretviaenv",
};


// If (!process.env.NODE_ENV || process.env.NODE_ENV === 'local') {
//   Config.IP = 'localhost';
// }
export default config;
