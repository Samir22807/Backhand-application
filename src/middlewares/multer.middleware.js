import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // આગળ ટાઇમસ્ટેમ્પ લગાવવાથી પાછળ .png/.jpg સચવાઈ રહેશે
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

export { upload };