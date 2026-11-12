
import multer from "multer";
import path from "path";

// Allowed MIME types
const ALLOWED_MIMES = new Set([
  "application/pdf",
]);

// Allowed extensions
const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
]);

// File filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  const mimeOk = ALLOWED_MIMES.has(file.mimetype);
  const extOk = ALLOWED_EXTENSIONS.has(ext);

  if (mimeOk && extOk) {
    return cb(null, true);
  }

  const error = new Error("Only PDF files are allowed.");

  error.code = "INVALID_FILE_TYPE";

  return cb(error);
};

// Multer configuration
const upload = multer({
  storage: multer.memoryStorage(),

  fileFilter,

  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 1,
  },
});

export default upload;
