'use strict';

const { Op } = require('sequelize');
const User   = require('../models/User');
const Product = require('../models/Product');
const { generateToken }    = require('../middleware/auth.middleware');
const { success, created, unauthorized, error:apiErr } = require('../utils/apiResponse');
const { sendWelcomeEmail } = require('../services/notification.service');
const logger = require('../utils/logger');
const log    = logger.child('AuthCtrl');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, avatar, role } = req.body;
    const existing = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existing)
      return res.status(409).json({ success:false, message:'An account with this email already exists' });
    const user  = await User.create({ name, email, password, avatar: avatar || null, role: role || 'user' });
    const token = generateToken(user.id);
    sendWelcomeEmail(user).catch(e => log.warn('Welcome email failed: ' + e.message));
    log.info(`Registered: ${email}`);
    return created(res, { token, user: user.toPublicJSON() }, 'Account created');
  } catch (e) { next(e); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user || !(await user.comparePassword(password))) return unauthorized(res, 'Invalid email or password');
    if (!user.isActive) return unauthorized(res, 'Account deactivated — contact support');
    user.lastLogin = new Date();
    await user.save();
    const token = generateToken(user.id);
    log.info(`Login: ${email}`);
    return success(res, { token, user: user.toPublicJSON() }, 'Login successful');
  } catch (e) { next(e); }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return apiErr(res, 'User not found', 404);
    
    const userJson = user.toPublicJSON();
    if (Array.isArray(user.watchlist) && user.watchlist.length > 0) {
      userJson.watchlist = await Product.findAll({
        where: { id: { [Op.in]: user.watchlist } },
        attributes: ['id', 'title', 'brand', 'image', 'lowestPrice', 'highestPrice']
      });
    } else {
      userJson.watchlist = [];
    }

    return success(res, { user: userJson });
  } catch (e) { next(e); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return apiErr(res, 'User not found', 404);
    const { name, avatar } = req.body;
    if (name   !== undefined) user.name   = name;
    if (avatar !== undefined) user.avatar = avatar;
    await user.save();
    return success(res, { user: user.toPublicJSON() }, 'Profile updated');
  } catch (e) { next(e); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return apiErr(res, 'User not found', 404);
    if (!(await user.comparePassword(currentPassword))) return unauthorized(res, 'Current password incorrect');
    user.password = newPassword;
    await user.save();
    return success(res, { token: generateToken(user.id) }, 'Password changed');
  } catch (e) { next(e); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) return success(res, {}, 'If an account exists with that email, a password reset link has been sent');
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();
    log.info(`Password reset requested for ${email}. Reset Token: ${resetToken}`);
    return success(res, { resetToken }, 'Password reset instructions sent');
  } catch (e) { next(e); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { [Op.gt]: new Date() }
      }
    });
    if (!user) return apiErr(res, 'Invalid or expired password reset token', 400);
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    return success(res, { token: generateToken(user.id) }, 'Password reset successfully');
  } catch (e) { next(e); }
};

exports.logout = async (_req, res) => success(res, {}, 'Logged out successfully');
