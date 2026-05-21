import "express";
import "express-serve-static-core";
import { JwtPayload } from "../middleware/auth.middleware";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: string;
      };

      file?: Express.Multer.File;
    }
  }

  declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: number;
      role: "admin" | "student";
    };
  }
}
    namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
  export {};
}
