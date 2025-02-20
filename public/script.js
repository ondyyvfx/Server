const elemId = (str) => document.getElementById(str);

const userInput = elemId("login");
const passInput = elemId("password");
const submitBtn = elemId("btnSubmit");
const userReg = elemId("reg");
const passReg = elemId("regPass");
const regBtn = elemId("regBtn");
const jwtBtn = elemId("jwt");
const refBtn = elemId("rfrsh");

let jwtToken = null;

regBtn.addEventListener("click", (event) => {
  event.preventDefault();
  fetch("/auth/reg", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      login: String(userReg.value),
      password: String(passReg.value),
    }),
  })
    .then((data) => data.text())
    .then(console.log);
});

let refreshToken = null;

submitBtn.addEventListener("click", (event) => {
  event.preventDefault();

  fetch("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      login: String(userInput.value),
      password: String(passInput.value),
    }),
  })
    .then((data) => data.json())
    .then((json) => {
      jwtToken = json.accessToken;
      refreshToken = json.refreshToken;
      console.log(json.refreshToken);
    });
});

jwtBtn.addEventListener("click", () => {
  fetch("/posts", {
    headers: { Authorization: `Bearer ${jwtToken}` },
  })
    .then((data) => data.json())
    .then(console.log);
});

refBtn.addEventListener("click", () => {
  fetch("/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token: refreshToken }),
  })
    .then((data) => {
      console.log(refreshToken);
      data.json();
    })
    .then((json) => {
      accessToken = json.accessToken;
    });
});
