// server/utils/generateToken.js
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'j2h983y2hr98h29r8h298rh29r8h234r9h23rnwefkjnwef1718yr8fh23', {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = generateToken;