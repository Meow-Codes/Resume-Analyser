// backend/utils/multerConfig.js
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

module.exports = upload;