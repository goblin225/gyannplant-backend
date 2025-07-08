const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return sendError(res, 'Access denied. No token provided.', 401);

  try {
    const secretKey = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;

    next();
  } catch (error) {
    console.error('JWT verify error:', error);
    sendError(res, 'Invalid token.', 403);
  }
};

module.exports = authenticateToken;
