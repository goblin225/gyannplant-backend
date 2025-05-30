const admin = require('firebase-admin');
const serviceAccount = require('../firebase/firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;