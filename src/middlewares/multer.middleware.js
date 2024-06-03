import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // originalname is the actual name of the file which the user uploads, keeping it like this since this will be temporarily saved only
  },
});

export const upload = multer({ storage });
