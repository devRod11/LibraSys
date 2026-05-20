import rateLimit from "express-rate-limit";

export const bulkUploadLimiter =
  rateLimit({

    windowMs:
      15 * 60 * 1000,

    max: 5,

    message: {
      message:
        "Too many upload attempts. Please try again later.",
    },

    standardHeaders: true,

    legacyHeaders: false,
  });