require("dotenv").config();

const jwt = require("jsonwebtoken");

const accessSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
/**
 * Время жизни токена
 */
const tokenAccessExpires = "10m";
/**
 * Время жизни токена
 */
const tokenRefreshExpires = "10d";

/**
 * Генерирует jwt доступа
 *
 * @param {object} payload Данные, которые будут в токене
 * @returns { string }
 */

const genAccessToken = (payload) =>
  jwt.sign(payload, accessSecret, { expiresIn: tokenAccessExpires });

/**
 * Генерирует jwt для получения нового токена
 *
 * @param {object} payload Данные, которые будут в токене
 * @returns { string }
 */
const genRefreshToken = (payload) =>
  jwt.sign(payload, refreshSecret, { expiresIn: tokenRefreshExpires });

/**
 * Проверяет и декодирует JWT-токен.
 *
 * Она гарантирует, что токен:
 *   - Настоящий (подписан корректным ключом).
 *   - Не истёк (если у него есть expiresIn).
 *   - Не изменён (целостность данных сохранена).
 *
 * @param {string} refreshToken Токен для проверки.
 * @returns {object} Декодированные данные или ошибка.
 */

const verifyToken = (refreshToken) => {
  let accessToken = null;
  jwt.verify(refreshToken, refreshSecret, (err, payload) => {
    if (err) {
      accessToken = err;
    } else {
      accessToken = genAccessToken({ payload });
    }
  });
  return accessToken;
};

module.exports = { genAccessToken, genRefreshToken, verifyToken };
