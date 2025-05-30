const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const timezone = req.headers['timezone'];

  if (!token) return sendError(res, 'Access denied. No token provided.', 401);

  try {
    const secretKey = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;

    req.timezone = timezone || 'Asia/Kolkata';

    next();
  } catch (error) {
    sendError(res, 'Invalid token.', 403);
  }
};

module.exports = authenticateToken;
