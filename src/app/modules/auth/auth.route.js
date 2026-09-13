"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const auth_controller_1 = require("./auth.controller");
const auth_validation_1 = require("./auth.validation");
const router = (0, express_1.Router)();
/**
 * @openapi
 * tags:
 *   - name: Authentication
 *     description: User authentication and profile management
 */
/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Create a new customer account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Fahmida Akter
 *               email:
 *                 type: string
 *                 format: email
 *                 example: fahmida@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *               phone:
 *                 type: string
 *                 example: "01712345678"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid request data
 *       409:
 *         description: Email already exists
 */
router.post("/register", (0, validateRequest_1.validateRequest)(auth_validation_1.AuthValidation.registerUserValidationSchema), auth_controller_1.AuthController.registerUser);
/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: fahmida@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Email and password are required
 *       401:
 *         description: Invalid email or password
 */
router.post("/login", (0, validateRequest_1.validateRequest)(auth_validation_1.AuthValidation.loginUserValidationSchema), auth_controller_1.AuthController.loginUser);
/**
 * @openapi
 * /auth/google:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login or register with Google
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 example: google-id-token
 *     responses:
 *       200:
 *         description: Google authentication successful
 *       401:
 *         description: Invalid Google token
 */
router.post("/google", (0, validateRequest_1.validateRequest)(auth_validation_1.AuthValidation.googleLoginValidationSchema), auth_controller_1.AuthController.loginWithGoogle);
/**
 * @openapi
 * /auth/refresh-token:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Generate a new access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: your-refresh-token
 *     responses:
 *       200:
 *         description: Access token generated successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post("/refresh-token", (0, validateRequest_1.validateRequest)(auth_validation_1.AuthValidation.refreshTokenValidationSchema), auth_controller_1.AuthController.refreshAccessToken);
/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout current user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: your-refresh-token
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", (0, validateRequest_1.validateRequest)(auth_validation_1.AuthValidation.logoutValidationSchema), auth_controller_1.AuthController.logoutUser);
/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/me", (0, auth_1.auth)("ADMIN", "TECHNICIAN", "CUSTOMER"), auth_controller_1.AuthController.getCurrentUser);
/**
 * @openapi
 * /auth/me:
 *   patch:
 *     tags:
 *       - Authentication
 *     summary: Update current user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Fahmida Akter
 *               phone:
 *                 type: string
 *                 example: "01712345678"
 *               address:
 *                 type: string
 *                 example: Sylhet, Bangladesh
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
router.patch("/me", (0, auth_1.auth)("ADMIN", "TECHNICIAN", "CUSTOMER"), (0, validateRequest_1.validateRequest)(auth_validation_1.AuthValidation.updateProfileValidationSchema), auth_controller_1.AuthController.updateProfile);
/**
 * @openapi
 * /auth/change-password:
 *   patch:
 *     tags:
 *       - Authentication
 *     summary: Change current user password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: OldPassword123!
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Current password is incorrect
 *       401:
 *         description: Unauthorized
 */
router.patch("/change-password", (0, auth_1.auth)("ADMIN", "TECHNICIAN", "CUSTOMER"), (0, validateRequest_1.validateRequest)(auth_validation_1.AuthValidation.changePasswordValidationSchema), auth_controller_1.AuthController.changePassword);
exports.AuthRoutes = router;
