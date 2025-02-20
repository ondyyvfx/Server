const { query } = require("express");
const { Pool } = require("pg");
require("dotenv").config(); // Загружаем переменные из .env
const { hashPass } = require("./utils/hash.js");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT || 5432, // стандартный порт PostgreSQL
});

/**
 * Записывает пользователей на базу данных с запросов
 * @param {string} login логин пользователя
 * @param {string} hashedPassword захэшированный пароль пользователя
 * @returns {Promise<string>} возвращает пользователя созданного в бд
 * @throws {string} error
 */
async function createUser(login, hashedPassword, refreshToken) {
  try {
    const result = await pool.query(
      "INSERT INTO users (login, password, refresh_token) VALUES ($1, $2, $3) RETURNING *",
      [login, hashedPassword, refreshToken]
    );

    return result.rows[0];
  } catch (err) {
    throw "Error of adding user to database";
  }
}

async function getAllUsers() {
  const result = await pool.query("SELECT * FROM users;");
  result.rows.forEach(deleteSecretAndPass);
  return result.rows;
}

/**
 * Ищет пользователя по логину в базе данных.
 *
 * @param {string} login - Логин пользователя.
 * @returns {Promise<object|null>} - Объект с данными пользователя или null, если не найден.
 * @trows {string}
 */
// const findUserByLogin = async (login) => {
//   try {
//     const result = await pool.query("SELECT * FROM users WHERE login = $1", [
//       login,
//     ]);

//     return result.rows.length > 0 ? result.rows[0] : null;
//   } catch (err) {
//     console.error("Ошибка при поиске пользователя:", err.message);
//     throw err;
//   }
// };

/**
 * Обновляет логин и/или пароль пользователя по ID.
 *
 * @param {number} id - ID пользователя.
 * @param {string} login - Новый логин.
 * @param {string} password - Новый пароль (хешируется).
 * @returns {Promise<object|null>} - Обновленный пользователь или null, если пользователь не найден.
 */
const updateUserById = async (id, login, password) => {
  try {
    // Хешируем пароль перед сохранением
    const hashedPassword = await hashPass(password);

    // Выполняем запрос к БД
    const result = await findUser.query(
      "UPDATE users SET login = $1, password = $2 WHERE id = $3 RETURNING *",
      login,
      hashedPassword,
      id
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (err) {
    console.error("Ошибка при обновлении пользователя:", err.message);
    throw err;
  }
};

/**
 * Удаляет пользователя по ID.
 *
 * @param {number} id - ID пользователя.
 * @returns {Promise<boolean>} - true, если удаление успешно, иначе false.
 */
const deleteUserById = async (id) => {
  try {
    const result = await findUser.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      id
    );

    return result.rows.length > 0; // Если есть удаленные строки, значит удаление прошло успешно
  } catch (err) {
    console.error("Ошибка при удалении пользователя:", err.message);
    throw err;
  }
};

function deleteSecretAndPass(user) {
  delete user.password;
  delete user.refresh_token;
  return user;
}

const findUser = {
  id: async (number) => {
    try {
      const result = await findUser.query(
        "SELECT * FROM users WHERE id = $1",
        number
      );
      let user = result.rows.length > 0 ? result.rows[0] : null;

      return user;
    } catch (err) {
      console.error("Ошибка при поиске пользователя:", err.message);
      throw err;
    }
  },
  query: async (string, ...props) => {
    return await pool.query(string, props);
  },
  byLogin: async (login) => {
    try {
      const result = await findUser.query(
        "SELECT * FROM users WHERE login = $1",
        login
      );
      let user = result.rows.length > 0 ? result.rows[0] : null;
      return user;
    } catch (err) {
      console.error("Ошибка при поиске пользователя:", err.message);
      throw err;
    }
  },
};
module.exports = {
  createUser,
  getAllUsers,
  findUser,
  updateUserById,
  deleteUserById,
  deleteSecretAndPass,
};
