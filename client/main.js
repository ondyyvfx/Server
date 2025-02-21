/** 
 * Возвращает HtmlElement по id
 * @param {string} id;
 * @returns {HTMLElement}
*/
const elemId = (id) => document.getElementById(id);

/**
 * Выводит контент в html элемент
 */
const output = (content) => elemId("output").innerHTML = content;
/**
 * HTML формы
 */
const forms = {
  reg: elemId("reg"),
  login: elemId("log"),
  allUsers: elemId("getAllUser"),
  getUser: elemId("getUser"),
  updateUser: elemId("updateUser"),
  deleteUser: elemId("deleteUser")
}


let accessToken = null; // токен

/**
 * Создаёт запрос на сервер позволяя его модифицыровать и отправляет его при вызове execute возвращая обьект с запросом и ответом
 * @param {string} url юрл запроса
 * @param {stering} method HTTP method
 * @returns {Request} запрос в виде обьекта
 */
const serverRequest = (url, method = "GET") => {
  
  function Request() {
    var body = null
    var headers = {};
    var encode = () => body;
    /**
     * @returns {object} возвращает все данные запроса
     */
    this.getRequestProperty = () => ({
      url, method, body, headers
    })
    this.getUrl = () => url;
    this.getMethod = () => method;
    this.getBody = () => body;
    /**
     * Методы для изменения Content-type запроса
     */
    this.setContentType = {
      /**
       * @returns {Request} текущий запрос
       */
      json: () => {
        headers["Content-type"] = "application/json";
        encode = (json) => JSON.stringify(json);
        return this;
      }
    }
    /**
     * Устанавливает токен в хэдер
     * @returns {Request} текущий запрос
     */
    this.setAccessToken = (token) => {
      headers["Authorization"] = token;
      return this;
    }
    this.getHeaders = () => headers;
    /**
     * Изменяет body запроса
     * @returns текущий запрос
     */
    this.setBody = (data) => {
      if(method != "GET") body = data;
      return this;
    };
    /**
     * Выполняет запрос на сервер
     * @returns {{request: Response, response: Promise<Response>}}
     */
    this.execute = () => {
      return {
        request: this,
        response: new Response(fetch(url, {
          method,
          headers,
          body: encode(body)
        }))
      }
    }
  }
  
  function Response(res) {
    /**
     * тыполняет цепочку then чтобы работать с json который передаётся в callback
     * @param {function} callback функция для раьоты с json
     * @returns {Promise<object>}
     */
    this.toJson = (callback) => res.then(data => data.json(data)).then(callback);
    /**
     * тыполняет цепочку then чтобы работать с текстом который передаётся в callback
     * @param {function} callback функция для раьоты с текстом
     * @returns {Promise<string>}
     */
    this.toString = (callback) => res.then(data => data.text(data)).then(callback)
  }
 
  return new Request(url, method)
}

//console.log(r.getRequestProperty())


/**
 * Вешает наблюдятель на html елемент уберая дефолтное поведение
 * @param {HTMLElement} elem
 * @param { event } event тип наблюдате например `click`
 * @param {function} callback функция которая будет выполнятся при тригере
 */
const setEvent = (elem, event, callback) => {
  elem.addEventListener(event, (event) =>{
    event.preventDefault();
    callback(event)
  })
}

/**
 * достаёт из формы login и pass проверяя их длину если не аерно введенно вызывает output, при верном вводе вызывает функцию переданую в атрибутах передавая туда обьект с данными формы и Request с методом POST
 * 
 * @param {HTMLFormElement} form
 * @param {string} url ссылка запроса
 * @param { function } callback в атрибутах лежит объект с проперти formData и req
 * 
 */
function authForm(form, url, callback) {
  return (event) => {
    const formData = new FormData(event.target);
    const login = formData.get("login");
    const password = formData.get("password");
  
    if (login.length == 0 && password.length == 0) {
    output(`Registration undefine value`);
    return;
    }
  
    callback({
      formData:{
        login,
        password
      },
      req: serverRequest(url, "POST")
    }, event)
  }
}

setEvent(
  forms.reg,
  "submit", 
  authForm(
    forms.reg, "/register", 
    ({formData, req}) => {
      var request = req
      .setContentType.json()
      .setBody(formData)
      .execute().response.toJson((json) => {
        accessToken = json.accessToken;
        output("Auth complate");
      }).catch(err => {
        output("Auth failed")
      })
    }
  )
)

setEvent(forms.login, "submit", authForm(
  forms.login, "/login", 
  ({formData, req}) => {
    req
    .setContentType.json()
    .setBody(formData)
    .execute()
    .response
    .toJson((json) => {
        accessToken = json.accessToken;
        output("Auth complate");
      }).catch(err => {
        output("Auth failed")
      });
  }
  )
)

setEvent(
  forms.allUsers,
  "click",
  () => {
    if (!accessToken) {
      output("No auth");
      return;
    }
    serverRequest("/users")
     .setAccessToken(accessToken)
     .setContentType.json()
     .execute()
     .response.toString((text) => output(text))
     .catch(output);
  })
  
  /**
   * Достаёт из инпутов формы id, login, password, создавая Response `${url}/${id}`, если id из инпута не число вызывает call 
   * @param {HTMLFormElement} formElem
   * @param {string} url
   * @param {string} method HTTP метод запроса котооый будет создан
   * @param {function} функция в которой выполняться действия с данными формы и Request 
   */
   function userForm(formElem, url, method = "GET", callback) {
    const formData = new FormData(formElem);
    const id = Number(formData.get("id")) && null;
    const login = formData.get("login") && null;
    const password = formData.get("password") && null;
    
    if (!id) {
      return () => {
        output("Invalid id")
      };
    }
    
    return (event) => {
      if (!accessToken) {
        output("Not auth");
        return;
      }
      const req = serverRequest(`${url}/${id}`)
      .setAccessToken(accessToken);
      callback({
        formData: {
          id, login, password
         },
        req
      })
    }
  }
  
  setEvent(
    forms.getUser, "submit",
    userForm(
      forms.getUser, "/user", "GET",
      ({req}) => {
        req.execute()
        .response.toString(output)
        .catch(output);
      }
    )
  )
  
setEvent(
  forms.updateUser, "submit",
  userForm(
    forms.updateUser, "/user", "PUT",
    ({formData, req}) => {
      const {login, password } = formData;
      req
      .setContentType.json()
      .setBody({login, password})
      .execute()
      .response.toString(output)
      .catch(output);
    }
  )
);

setEvent(
  forms.deleteUser, "submit", 
  userForm(
    forms.deleteUser, "/user","DELETE",
    (({req}) => {
      req.execute()
      .response.toString(output)
      .catch(output)
    })
    )
  )