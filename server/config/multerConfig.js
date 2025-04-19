const multer = require("multer");

const storage = multer.memoryStorage(); // 👈 Important: Keep image in memory

const upload = multer({ storage });

module.exports = upload;
