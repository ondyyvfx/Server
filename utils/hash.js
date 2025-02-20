const bcrypt = require("bcrypt");

async function hashPass(pass) {
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(pass, salt);
  return hashedPassword;
}

async function verifyPassword(plainPassword, hashedPassword) {
  // compare вернёт true, если пароль совпадает, иначе false
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  return isMatch;
}

module.exports = { hashPass, verifyPassword };
