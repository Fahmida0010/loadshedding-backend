import { Router } from "express";

import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(AuthValidation.registerUserValidationSchema),
  AuthController.registerUser,
);

router.post(
  "/login",
  validateRequest(AuthValidation.loginUserValidationSchema),
  AuthController.loginUser,
);

router.post(
  "/google",
  validateRequest(AuthValidation.googleLoginValidationSchema),
  AuthController.loginWithGoogle,
);

router.post(
  "/refresh-token",
  validateRequest(AuthValidation.refreshTokenValidationSchema),
  AuthController.refreshAccessToken,
);

router.post(
  "/logout",
  validateRequest(AuthValidation.logoutValidationSchema),
  AuthController.logoutUser,
);

router.get(
  "/me",
  auth("ADMIN", "TECHNICIAN", "CUSTOMER"),
  AuthController.getCurrentUser,
);

router.patch(
  "/change-password",
  auth("ADMIN", "TECHNICIAN", "CUSTOMER"),
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthController.changePassword,
);

export const AuthRoutes = router;