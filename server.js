require("dotenv").config();
const {
  getAllUsers,
  createUser,
  findUser,
  updateUserById,
  deleteUserById,
  deleteSecretAndPass,
} = require("./db.js");
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const path = require("path");
const jwt = require("jsonwebtoken");
const { authenticate } = require("./middleware/auth.js");
const {
  genAccessToken,
  genRefreshToken,
  verifyToken,
} = require("./utils/jwt.js");
const { hashPass, verifyPassword } = require("./utils/hash.js");

app.use(express.json());
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/script.js", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "script.js"));
});

app.post("/login", login);

async function login(req, res) {
  const user = await findUser.byLogin(req.body.login);
  if (user == null) {
    return res.status(400).send("Cannot find user");
  }
  try {
    if (await verifyPassword(req.body.password, user.password)) {
      const accessToken = genAccessToken({ login: user.login });
      const refreshToken = user.refresh_token;
      // console.log(user);
      res.json({ accessToken, refreshToken });
    } else {
      res.status(401).send("Password is incorrect");
    }
  } catch {
    res.status(500).send();
  }
  // console.log(user);
}

app.post("/register", async (req, res) => {
  try {
    if (await findUser.byLogin(req.body.login)) {
      return res.json({ reg: false });
    }
    const refreshToken = genRefreshToken({ login: req.body.login });
    const hashedPassword = await hashPass(req.body.password);
    await createUser(req.body.login, hashedPassword, refreshToken);
    return res.json({ refreshToken });
  } catch {
    res.status(500).send();
  }
});

app.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  console.log(req.body);

  if (!refreshToken) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

  const accessToken = verifyToken(refreshToken);

  if (accessToken) {
    res.json({ accessToken });
  } else {
    res.sendStatus(403);
  }
});

app.get("/users", authenticate, async (req, res) => {
  try {
    let users = await getAllUsers();
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Ошибка сервера");
  }
});

app.get("/users/:id", authenticate, async (req, res) => {
  const userId = req.params.id;
  let user = await findUser.id(userId);
  if (!user) {
    return res.sendStatus(404);
  } else {
    return res.json(deleteSecretAndPass(user));
  }
});

app.put("/users/:id", authenticate, async (req, res) => {
  const userId = req.params.id;
  const reqBody = { login: req.body.login, password: req.body.password };
  const user = await updateUserById(userId, reqBody.login, reqBody.password);
  if (!user) return res.sendStatus(404);
  return res.json(deleteSecretAndPass(user));
});

app.delete("/users/:id", authenticate, async (req, res) => {
  const userId = req.params.id;
  const user = await deleteUserById(userId);
  if (!user) return res.sendStatus(404);
  return res.json(deleteSecretAndPass(user));
});

app.listen(3000);
