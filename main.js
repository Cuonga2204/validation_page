function validator(options) {
  //Biến để lưu các rules làm để không bị ghi đè 2 rules lên cùng một element
  let selectorRules = {};

  const validate = (inputElement, rule) => {
    const errorElement =
      inputElement.parentElement.querySelector(".form-message");
    const rules = selectorRules[rule.selector];
    let errorMessage;

    for (let i = 0; i < rules.length; i++) {
      errorMessage = rules[i](inputElement.value);
      //xuất hiện lỗi thì hiện ngay message
      if (errorMessage) break;
    }

    if (errorMessage) {
      // thêm màu đỏ và hiện message lỗi ở dưới input
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
    // Xử lý khi ấn submit
    formElement.onsubmit = (e) => {
      let formValid = true;
      e.preventDefault();
      options.rules.forEach((rule) => {
        const inputElement = formElement.querySelector(rule.selector);
        const isValid = validate(inputElement, rule);
        if (!isValid) {
          formValid = false;
        }
      });

      if (formValid) {
        toast({
          title: "Thành công",
          message: `${formElement.name} thành công`,
          type: "success",
        });
        if (formElement.name == "đăng ký") {
          // đăng ký thành công thì chuyển form đăng nhập
          setTimeout(() => {
            const container = document.querySelector(".container");
            container.classList.remove("active");
            resetForm("form-sign-up");
          }, 1500);
        }
      } else {
        toast({
          title: "Thất bại",
          message: `${formElement.name} thất bại`,
          type: "error",
        });
      }
    };
    options.rules.forEach((rule) => {
      const inputElement = formElement.querySelector(rule.selector);
      const errorElement =
        inputElement.parentElement.querySelector(".form-message");

      if (!selectorRules[rule.selector]) {
        // Kiểm tra nếu chưa tồn tại thì tạo mảng
        selectorRules[rule.selector] = [];
      }
      selectorRules[rule.selector].push(rule.test);

      if (inputElement) {
        //Khi blur vào thì check lỗi
        inputElement.onblur = () => {
          validate(inputElement, rule);
        };
        //khi nhập input thì bỏ màu đỏ và message lỗi đi
        inputElement.oninput = () => {
          inputElement.parentElement.classList.remove("invalid");
          errorElement.innerText = "";
        };
      }
    });
  }
}

// Các function để test lỗi

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
      const regex = /^[A-Za-zÀ-ỹ\s]+$/;
      return regex.test(value)
        ? undefined
        : "Tên không được chứa số hoặc ký tự đặc biệt";
    },
  };
};

validator.isEmail = (selector) => {
  return {
    selector: selector,
    test: (value) => {
      const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : "Email không hợp lệ";
    },
  };
};

validator.isStrongPassword = (selector) => {
  return {
    selector: selector,
    test: (value) => {
      const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{8,}$/;
      return regex.test(value)
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
//Ham reset form khi switch giữa các form
const resetForm = (idForm = "") => {
  const formElement = document.getElementById(idForm);
  if (formElement) {
    formElement.reset();

    // Xoa hết các màu đỏ thông báo lỗi
    const invalidElements = formElement.querySelectorAll(".invalid");
    invalidElements.forEach((element) => element.classList.remove("invalid"));

    // Xoá các message báo lỗi
    const errorMessages = formElement.querySelectorAll(".form-message");
    errorMessages.forEach((error) => (error.innerText = ""));
  }
};

// switch login-signup

const container = document.querySelector(".container");
const registerBtn = document.querySelector(".switch_btn-signup");
const loginBtn = document.querySelector(".switch_btn-login");

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
  resetForm("form-sign-in");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
  resetForm("form-sign-up");
});

//toast thông báo khi thành công hay thất bại sau khi submit

const toast = ({ title = "", message = "", type = "success" }) => {
  const mainElement = document.querySelector(".main");
  const icons = {
    success: "fa-solid fa-circle-check",
    error: "fa-solid fa-circle-exclamation",
  };
  const icon = icons[type];
  if (mainElement) {
    const toast = document.createElement("div");
    toast.classList.add("toast", `toast--${type}`);

    toast.innerHTML = `<div class="toast__icon">
                <i class="${icon}"></i>
            </div>
            <div class="toast__body">
                <h3 class="toast__tile">${title}</h3>
                <span class="toast__message">${message}</span>
            </div>
            <div class="toast_close">
                <i class="fa-solid fa-xmark"></i>
            </div>`;
    mainElement.appendChild(toast);
  }
};

// Gọi hàm
validator({
  form: "#form-sign-up",
  //Mỗi hàm đều có return
  rules: [
    validator.isRequire("#fullname"),
    validator.isValidName("#fullname"),
    validator.isRequire("#email"),
    validator.isEmail("#email"),
    validator.isRequire("#password"),
    validator.isStrongPassword("#password"),
    validator.isRequire("#password_confirmation"),
    validator.confirmed("#password_confirmation", () => {
      return document.querySelector("#form-sign-up #password").value;
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
