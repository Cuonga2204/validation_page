function Validator(options) {
  var selectorRules = {}; //Biến để lưu các rules làm để không bị ghi đè 2 rules lên cùng một element

  function validate(inputElement, rule) {
    var errorElement =
      inputElement.parentElement.querySelector(".form-message");
    var rules = selectorRules[rule.selector];
    var errorMessage;

    for (var i = 0; i < rules.length; i++) {
      errorMessage = rules[i](inputElement.value);
      if (errorMessage) break; //xuất hiện lỗi thì hiện ngay message
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage; // thêm màu đỏ và hiện message lỗi ở dưới input
      inputElement.parentElement.classList.add("invalid");
      errorElement.parentElement.classList.add("invalid");
    } else {
      inputElement.parentElement.classList.remove("invalid");
      errorElement.parentElement.classList.remove("invalid");
      errorElement.innerText = "";
    }

    return !errorMessage;
  }

  var formElement = document.querySelector(options.form);

  if (formElement) {
    formElement.onsubmit = function (e) {
      // Xử lý khi ấn submit

      var formValid = true;
      e.preventDefault();
      options.rules.forEach((rule) => {
        var inputElement = formElement.querySelector(rule.selector);
        var isValid = validate(inputElement, rule);
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

          const container = document.querySelector(".container");
          container.classList.remove("active");
          resetForm("form-sign-up");
        }
      } else {
        toast({
          title: "Thất bại",
          message: `${formElement.name} thất bại`,
          type: "error",
        });
      }
    };
    options.rules.forEach(function (rule) {
      var inputElement = formElement.querySelector(rule.selector);
      var errorElement =
        inputElement.parentElement.querySelector(".form-message");

      if (!selectorRules[rule.selector]) {
        // Kiểm tra nếu chưa tồn tại thì tạo mảng
        selectorRules[rule.selector] = [];
      }
      selectorRules[rule.selector].push(rule.test);

      if (inputElement) {
        inputElement.onblur = function () {
          //Khi blur vào thì check lỗi
          validate(inputElement, rule);
        };
        //khi nhập input thì bỏ màu đỏ và message lỗi đi
        inputElement.oninput = function () {
          inputElement.parentElement.classList.remove("invalid");
          errorElement.innerText = "";
        };
      }
    });
  }
}

// Các function để test lỗi

Validator.isRequire = function (selector) {
  return {
    selector: selector,
    test: function (value) {
      return value.trim() ? undefined : "Vui lòng nhập trường này";
    },
  };
};

Validator.isValidName = function (selector) {
  return {
    selector: selector,
    test: function (value) {
      var regex = /^[A-Za-zÀ-ỹ\s]+$/;
      return regex.test(value)
        ? undefined
        : "Tên không được chứa số hoặc ký tự đặc biệt";
    },
  };
};

Validator.isEmail = function (selector) {
  return {
    selector: selector,
    test: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : "Email không hợp lệ";
    },
  };
};

Validator.isStrongPassword = function (selector) {
  return {
    selector: selector,
    test: function (value) {
      var regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{8,}$/;
      return regex.test(value)
        ? undefined
        : "Mật khẩu ít nhất 8 ký tự, có chữ hoa, chữ thường, ký tự đặc biệt";
    },
  };
};
Validator.confirmed = function (selector, getConfirmValue) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirmValue()
        ? undefined
        : "Giá trị nhập không chính xác ";
    },
  };
};
//Ham reset form khi switch giữa các form
function resetForm(idForm = "") {
  const formElement = document.getElementById(idForm);
  if (formElement) {
    formElement.reset();

    const invalidElements = formElement.querySelectorAll(".invalid"); // Xoa hết các màu đỏ thông báo lỗi
    invalidElements.forEach((element) => element.classList.remove("invalid"));

    const errorMessages = formElement.querySelectorAll(".form-message"); // Xoá các message báo lỗi
    errorMessages.forEach((error) => (error.innerText = ""));
  }
}

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

function toast({ title = "", message = "", type = "success" }) {
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
}

// Gọi hàm
Validator({
  form: "#form-sign-up",
  rules: [
    Validator.isRequire("#fullname"), //Mỗi hàm đều có return
    Validator.isValidName("#fullname"),
    Validator.isRequire("#email"),
    Validator.isEmail("#email"),
    Validator.isRequire("#password"),
    Validator.isStrongPassword("#password"),
    Validator.isRequire("#password_confirmation"),
    Validator.confirmed("#password_confirmation", () => {
      return document.querySelector("#form-sign-up #password").value;
    }),
  ],
});
Validator({
  form: "#form-sign-in",
  rules: [
    Validator.isRequire("#email-sign-in"),
    Validator.isEmail("#email-sign-in"),
    Validator.isRequire("#password-sign-in"),
    Validator.isStrongPassword("#password-sign-in"),
  ],
});
