const REGEX = {
  VALID_NAME: /^[A-Za-zÀ-ỹ\s]+$/,
  EMAIL: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  STRONG_PASSWORD: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{8,}$/,
};

const validator = (options) => {
  const selectorRules = {};

  const validate = (inputElement, rule) => {
    const errorElement =
      inputElement.parentElement.querySelector(".form-message");
    const rules = selectorRules[rule.selector];
    let errorMessage;

    for (let i = 0; i < rules.length; i++) {
      errorMessage = rules[i](inputElement.value);
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      inputElement.parentElement.classList.add("invalid");
      errorElement.parentElement.classList.add("invalid");
    } else {
      inputElement.parentElement.classList.remove("invalid");
      errorElement.parentElement.classList.remove("invalid");
      errorElement.innerText = "";
    }

    return !errorMessage;
  };

  const formElement = document.querySelector(options.form);

  if (formElement) {
    formElement.onsubmit = (e) => {
      e.preventDefault();
      let formValid = true;
      options.rules.forEach((rule) => {
        const inputElement = formElement.querySelector(rule.selector);
        const isValid = validate(inputElement, rule);
        if (!isValid) {
          formValid = false;
        }
      });
      if (formValid && formElement.name === "đăng ký") {
        showNotification({
          title: "Thành công",
          message: `${formElement.name} thành công`,
          type: "success"
        });
        resetForm("form-sign-up");
      }
    };
    options.rules.forEach((rule) => {
      const inputElement = formElement.querySelector(rule.selector);
      const errorElement =
        inputElement.parentElement.querySelector(".form-message");

      if (!selectorRules[rule.selector]) {
        selectorRules[rule.selector] = [];
      }
      selectorRules[rule.selector].push(rule.test);

      if (inputElement) {
        inputElement.onblur = () => {
          validate(inputElement, rule);
        };
        inputElement.oninput = () => {
          inputElement.parentElement.classList.remove("invalid");
          errorElement.innerText = "";
        };
      }
    });
  }
};

validator.isRequire = (selector) => {
  return {
    selector: selector,
    test: (value) => {
      return value.trim() ? undefined : "Vui lòng nhập trường này";
    },
  };
};

validator.isValidName = (selector) => {
  return {
    selector: selector,
    test: (value) => {
      return REGEX.VALID_NAME.test(value)
        ? undefined
        : "Tên không được chứa số hoặc ký tự đặc biệt";
    },
  };
};

validator.isEmail = (selector) => {
  return {
    selector: selector,
    test: (value) => {
      return REGEX.EMAIL.test(value) ? undefined : "Email không hợp lệ";
    },
  };
};

validator.isStrongPassword = (selector) => {
  return {
    selector: selector,
    test: (value) => {
      return REGEX.STRONG_PASSWORD.test(value)
        ? undefined
        : "Mật khẩu ít nhất 8 ký tự, có chữ hoa, chữ thường, ký tự đặc biệt";
    },
  };
};
validator.confirmed = (selector, getConfirmValue) => {
  return {
    selector: selector,
    test: (value) => {
      return value === getConfirmValue()
        ? undefined
        : "Không khớp với mật khẩu";
    },
  };
};
const resetForm = (idForm = "") => {
  const formElement = document.getElementById(idForm);
  if (formElement) {
    formElement.reset();

    const invalidElements = formElement.querySelectorAll(".invalid");
    invalidElements.forEach((element) => element.classList.remove("invalid"));

    const errorMessages = formElement.querySelectorAll(".form-message");
    errorMessages.forEach((error) => (error.innerText = ""));
  }
};

// switch login-signup

const container = document.querySelector(".container");
const registerBtn = document.querySelector(".switch_btn-signup");
const loginBtn = document.querySelector(".switch_btn-login");
const passWordSignUp = document.querySelector("#form-sign-up #password");

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
  resetForm("form-sign-in");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
  resetForm("form-sign-up");
});

const showNotification = ({ title = "", message = "", type = "success" }) => {
  const mainElement = document.querySelector(".main");
  const icons = {
    success: "fa-solid fa-circle-check",
    error: "fa-solid fa-circle-exclamation",
  };
  const icon = icons[type];
  if (mainElement) {
    const notify = document.createElement("div");
    notify.classList.add("notify", `notify--${type}`);

    notify.innerHTML = `<div class="notify__icon">
                <i class="${icon}"></i>
            </div>
            <div class="notify__body">
                <h3 class="notify__tile">${title}</h3>
                <span class="notify__message">${message}</span>
            </div>
            <div class="notify_close">
                <i class="fa-solid fa-xmark"></i>
            </div>`;
    mainElement.appendChild(notify);
  }
};

validator({
  form: "#form-sign-up",
  rules: [
    validator.isRequire("#fullname"),
    validator.isValidName("#fullname"),
    validator.isRequire("#email"),
    validator.isEmail("#email"),
    validator.isRequire("#password"),
    validator.isStrongPassword("#password"),
    validator.isRequire("#password_confirmation"),
    validator.isStrongPassword("#password_confirmation"),
    validator.confirmed("#password_confirmation", () => {
      return passWordSignUp.value;
    }),
  ],
});
validator({
  form: "#form-sign-in",
  rules: [
    validator.isRequire("#email-sign-in"),
    validator.isEmail("#email-sign-in"),
    validator.isRequire("#password-sign-in"),
    validator.isStrongPassword("#password-sign-in"),
  ],
});
