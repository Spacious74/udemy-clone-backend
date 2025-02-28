const multer = require('multer');
const path = require('path');

const upload = multer({ 
  limits: { fileSize: 3000000 }, // 3 MB file size limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only images (jpeg, jpg, png) are allowed!"));
  }
});

module.exports = upload;