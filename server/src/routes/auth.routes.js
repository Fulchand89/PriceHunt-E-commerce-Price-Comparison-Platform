'use strict';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user management
 */

const router = require('express').Router();
const ctrl   = require('../controllers/auth.controller');
const { protect }  = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validation.middleware');
const { authLimiter }       = require('../middleware/rateLimit.middleware');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:     { type: string, example: "Rahul Sharma" }
 *               email:    { type: string, example: "rahul@example.com" }
 *               password: { type: string, example: "Password123" }
 *     responses:
 *       201: { description: Created }
 *       409: { description: Email exists }
 */
router.post('/register',        authLimiter, validate(schemas.register),       ctrl.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: JWT token returned }
 *       401: { description: Invalid credentials }
 */
router.post('/login',           authLimiter, validate(schemas.login),          ctrl.login);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get authenticated user profile
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/profile',          protect, ctrl.getProfile);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 */
router.put('/profile',          protect, validate(schemas.updateProfile),      ctrl.updateProfile);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change password
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/change-password', protect, validate(schemas.changePassword),     ctrl.changePassword);
router.post('/forgot-password', authLimiter, validate(schemas.forgotPassword), ctrl.forgotPassword);
router.post('/reset-password',  authLimiter, validate(schemas.resetPassword),  ctrl.resetPassword);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout (discard token client-side)
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/logout',          protect, ctrl.logout);

module.exports = router;
