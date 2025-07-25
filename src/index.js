require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const router = require('./routes');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require("express-rate-limit");

const app = express();

// Connect to MongoDB
connectDB();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://gyaan-plant-website.onrender.com',
  'https://gyaanplant-admin-panel.onrender.com',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Rate limiter
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    status: 429,
    message: 'Too many requests. Please try again after a minute.',
  },
});
app.use('/api', apiLimiter);

app.use('/api', router)

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
