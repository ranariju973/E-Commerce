const jwt = require('jsonwebtoken');
require('dotenv').config();
const token = process.argv[2];
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log("Decoded:", decoded);
} catch (e) {
  console.log("Error:", e.message);
}
