// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const { v4: uuidv4 } = require('uuid');

// // Create uploads directory if it doesn't exist
// const uploadsDir = path.join(__dirname, '../uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

// // Configure storage for local file system
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     // Create user specific folder
//     const userDir = path.join(uploadsDir, req.user ? req.user._id.toString() : 'anonymous');
//     if (!fs.existsSync(userDir)) {
//       fs.mkdirSync(userDir, { recursive: true });
//     }
//     cb(null, userDir);
//   },
//   filename: function (req, file, cb) {
//     // Generate unique filename
//     const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
//     cb(null, uniqueFilename);
//   }
// });

// // Create file filter for allowed types
// const fileFilter = (req, file, cb) => {
//   // Allow PDFs only
//   if (file.mimetype === 'application/pdf') {
//     cb(null, true);
//   } else {
//     cb(new Error('Only PDF files are allowed'), false);
//   }
// };

// // Create a simple multer instance (no complex wrapper)
// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10MB limit
//   },
//   fileFilter: fileFilter,
// });

// // Add a post-processing function to add location property to uploaded files
// const addLocationToFile = (req, res, next) => {
//   if (req.file) {
//     const baseUrl = `${req.protocol}://${req.get('host')}`;
//     req.file.location = `${baseUrl}/uploads/${req.user ? req.user._id.toString() : 'anonymous'}/${req.file.filename}`;
//   }
//   next();
// };

// module.exports = { upload, addLocationToFile };

const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Use memory storage instead of disk storage
const storage = multer.memoryStorage();

// Create file filter for allowed types
const fileFilter = (req, file, cb) => {
  // Allow PDFs only
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

// Create a simple multer instance with memory storage
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

// Create virtual location for files without using filesystem
const addLocationToFile = (req, res, next) => {
  if (req.file) {
    const timestamp = Date.now();
    const filename = `${timestamp}-${req.file.originalname.replace(/\s+/g, '-')}`;
    // Create a virtual location that doesn't depend on actual files
    req.file.location = `memory-storage://${filename}`;
  }
  next();
};

module.exports = { upload, addLocationToFile };