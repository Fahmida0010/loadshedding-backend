import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import authController = require("./auth.controller.js");
import e = require("express");
import authValidation = require("./auth.validation.js");
import AuthController = require("./auth.controller.js");


const router = e.Router();

router.post(
  "/register",
  validateRequest(
    authValidation.AuthValidation.registerUserValidationSchema,
  ),
  authController.AuthController.registerUser,
);

router.post(
  "/login",
  validateRequest(authValidation.AuthValidation.loginUserValidationSchema),
  authController.AuthController.loginUser,
);

router.post(
  "/google",
  validateRequest(
    AuthValidation.googleLoginValidationSchema,
  ),
  AuthController.loginWithGoogle,
);

router.post(
  "/refresh-token",
  validateRequest(
    AuthValidation.refreshTokenValidationSchema,
  ),
  AuthController.refreshAccessToken,
);

router.post(
  "/logout",
  validateRequest(AuthValidation.logoutValidationSchema),
  AuthController.logoutUser,
);

router.get(
  "/me",
  auth(
    "ADMIN",
    "TECHNICIAN",
    "CUSTOMER",
  ),
  AuthController.getCurrentUser,
);

router.patch(
  "/change-password",
  auth(
    "ADMIN",
    "TECHNICIAN",
    "CUSTOMER",
  ),
  validateRequest(
    AuthValidation.changePasswordValidationSchema,
  ),
  AuthController.changePassword,
);

export const AuthRoutes = router;