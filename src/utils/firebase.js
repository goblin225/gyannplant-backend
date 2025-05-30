require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require(`../../${process.env.FIREBASE_CONFIG_PATH}`);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;