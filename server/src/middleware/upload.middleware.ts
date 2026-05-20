import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({

  storage,

  limits: {
    fileSize: 2 * 1024 * 1024,
  },

  fileFilter: (
    req,
    file,
    cb
  ) => {

    if (
      file.mimetype !==
      "text/csv"
    ) {

      return cb(
        new Error(
          "Only CSV files allowed"
        )
      );
    }

    cb(null, true);
  },
});