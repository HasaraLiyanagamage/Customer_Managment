const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('./logger');

// Promisify JWT methods
const jwtSign = promisify(jwt.sign);
const jwtVerify = promisify(jwt.verify);

// Token types
const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET_PASSWORD: 'reset_password',
  EMAIL_VERIFICATION: 'email_verification',
  API_KEY: 'api_key',
};

// Token expiration times (in seconds)
const TOKEN_EXPIRATIONS = {
  [TOKEN_TYPES.ACCESS]: 15 * 60, // 15 minutes
  [TOKEN_TYPES.REFRESH]: 7 * 24 * 60 * 60, // 7 days
  [TOKEN_TYPES.RESET_PASSWORD]: 24 * 60 * 60, // 24 hours
  [TOKEN_TYPES.EMAIL_VERIFICATION]: 24 * 60 * 60, // 24 hours
  [TOKEN_TYPES.API_KEY]: 365 * 24 * 60 * 60, // 1 year
};

/**
 * Generate a random token
 * @param {number} length - Length of the token in bytes (default: 32)
 * @returns {Promise<string>} - Random token
 */
const generateRandomToken = (length = 32) => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(length, (err, buffer) => {
      if (err) {
        logger.error('Error generating random token:', err);
        return reject(err);
      }
      resolve(buffer.toString('hex'));
    });
  });
};

/**
 * Generate a JWT token
 * @param {Object} payload - Token payload
 * @param {string} type - Token type (from TOKEN_TYPES)
 * @param {Object} [options] - Additional options
 * @param {string} [options.secret] - JWT secret (default: process.env.JWT_SECRET)
 * @param {string|number} [options.expiresIn] - Token expiration time (default: based on type)
 * @returns {Promise<string>} - JWT token
 */
const generateJWT = async (payload, type, options = {}) => {
  try {
    const secret = options.secret || process.env.JWT_SECRET;
    const expiresIn = options.expiresIn || TOKEN_EXPIRATIONS[type];
    
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    
    if (!expiresIn) {
      throw new Error(`Invalid token type: ${type}`);
    }
    
    const tokenPayload = {
      ...payload,
      jti: uuidv4(),
      iat: Math.floor(Date.now() / 1000),
      type,
    };
    
    return await jwtSign(tokenPayload, secret, { expiresIn });
  } catch (error) {
    logger.error('Error generating JWT:', error);
    throw error;
  }
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @param {string} type - Expected token type (from TOKEN_TYPES)
 * @param {Object} [options] - Additional options
 * @param {string} [options.secret] - JWT secret (default: process.env.JWT_SECRET)
 * @returns {Promise<Object>} - Decoded token payload
 */
const verifyJWT = async (token, type, options = {}) => {
  try {
    const secret = options.secret || process.env.JWT_SECRET;
    
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    
    const decoded = await jwtVerify(token, secret);
    
    if (decoded.type !== type) {
      throw new Error(`Invalid token type: expected ${type}, got ${decoded.type}`);
    }
    
    return decoded;
  } catch (error) {
    logger.error('Error verifying JWT:', error);
    throw error;
  }
};

/**
 * Generate an access token
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @param {Object} [options] - Additional options
 * @returns {Promise<string>} - Access token
 */
const generateAccessToken = (userId, role, options = {}) => {
  return generateJWT(
    { sub: userId, role },
    TOKEN_TYPES.ACCESS,
    options
  );
};

/**
 * Generate a refresh token
 * @param {string} userId - User ID
 * @param {string} tokenId - Token ID (for invalidation)
 * @param {Object} [options] - Additional options
 * @returns {Promise<string>} - Refresh token
 */
const generateRefreshToken = (userId, tokenId, options = {}) => {
  return generateJWT(
    { sub: userId, jti: tokenId },
    TOKEN_TYPES.REFRESH,
    options
  );
};

/**
 * Generate a password reset token
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {Object} [options] - Additional options
 * @returns {Promise<string>} - Password reset token
 */
const generatePasswordResetToken = (userId, email, options = {}) => {
  return generateJWT(
    { sub: userId, email },
    TOKEN_TYPES.RESET_PASSWORD,
    options
  );
};

/**
 * Generate an email verification token
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {Object} [options] - Additional options
 * @returns {Promise<string>} - Email verification token
 */
const generateEmailVerificationToken = (userId, email, options = {}) => {
  return generateJWT(
    { sub: userId, email },
    TOKEN_TYPES.EMAIL_VERIFICATION,
    options
  );
};

/**
 * Generate an API key
 * @param {string} userId - User ID
 * @param {string} name - API key name
 * @param {Array<string>} [permissions] - Array of permissions
 * @param {Object} [options] - Additional options
 * @returns {Promise<{key: string, token: string}>} - API key ID and token
 */
const generateApiKey = async (userId, name, permissions = [], options = {}) => {
  const keyId = uuidv4();
  const secret = await generateRandomToken(32);
  
  const token = await generateJWT(
    {
      sub: userId,
      name,
      permissions,
      key: keyId,
    },
    TOKEN_TYPES.API_KEY,
    options
  );
  
  // Return both the key ID and the full token
  return {
    id: keyId,
    token,
    // Only include the first and last 4 characters of the secret
    maskedSecret: `${secret.substring(0, 4)}...${secret.substring(secret.length - 4)}`,
  };
};

module.exports = {
  TOKEN_TYPES,
  TOKEN_EXPIRATIONS,
  generateRandomToken,
  generateJWT,
  verifyJWT,
  generateAccessToken,
  generateRefreshToken,
  generatePasswordResetToken,
  generateEmailVerificationToken,
  generateApiKey,
};
