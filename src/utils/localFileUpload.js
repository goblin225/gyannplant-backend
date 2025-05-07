// utils/localFileUpload.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/questions'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.csv' || ext === '.xlsx') {
    cb(null, true);
  } else {
    cb(new Error('Only CSV and Excel files are allowed'));
  }
};

const uploadLocal = multer({ storage, fileFilter });

module.exports = { uploadLocal };