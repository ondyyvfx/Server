require("dotenv").config();

const jwt = require("jsonwebtoken");

/**
 *
 * Мидлвара которая проверяет авторизирован ли пользователь
 *
 * @param {Request} req - Объект запроса
 * @param {Response} res - Объект ответа
 * @param {NextFunction} next Функция, вызывающая следующий middleware
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];
  console.log(token);

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

module.exports = { authenticate };
