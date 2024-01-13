class ValidateForm {
  constructor() {
    this.form = document.querySelector(".form");
    this.modal = document.querySelector("dialog");
    this.main = document.querySelector("main");
    this.cep = document.querySelector("#cep");
    this.endereco = document.querySelector("#endereco");
    this.events();
  }

  events() {
    this.form.addEventListener("submit", (event) => {
      this.handleSubmit(event);
    });

    this.form.querySelectorAll(".format").forEach((input) => {
      if (input.id === "cpf-paciente" || input.id === "cpf-emissor") {
        input.addEventListener("input", () => this.formatCpf(input));
      }

      if (input.id === "tel") {
        input.addEventListener("input", () => this.formatTel(input));
      }

      let timeoutId;

      if (input.id === "cep") {
        input.addEventListener("input", () => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(this.handleCepAPI, 250);
          this.formatCep(input);
        });
      }
    });

    this.modal.addEventListener("click", (event) => {
      const dialogDimensions = this.modal.getBoundingClientRect();
      if (
        event.clientX < dialogDimensions.left ||
        event.clientX > dialogDimensions.right ||
        event.clientY < dialogDimensions.top ||
        event.clientY > dialogDimensions.bottom
      ) {
        this.modal.close();
      }
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    const validInputs = this.inputIsValid();

    if (validInputs) {
      this.printPage();
      this.main.classList.add("printPage");
      window.print();
    } else {
      this.modal.showModal();
    }
  }

  async handleCepAPI() {
    try {
      const cep = this.cep.value.replace(/\D+/g, "");
      const href = `https://brasilapi.com.br/api/cep/v1/${cep}`;
      const response = await fetch(href);

      if (response.status < 200 || response.status > 300) return;

      const cepData = await response.text();
      const cepDataObject = JSON.parse(cepData);
      this.endereco.value = `${cepDataObject.street}, ${cepDataObject.neighborhood}, ${cepDataObject.city} - ${cepDataObject.state}`;
    } catch (e) {
      return;
    }
  }

  handleDate() {
    function leftyZero(number) {
      return number >= 10 ? number : `0${number}`;
    }

    function formatDate(date) {
      const daysArray = [
        "Domingo",
        "Segunda-Feira",
        "Terça-Feira",
        "Quarta-Feira",
        "Quinta-Feira",
        "Sexta-Feira",
        "Sábado",
      ];

      const weekDay = daysArray[date.getDay()];
      const day = leftyZero(date.getDate());
      const month = leftyZero(date.getMonth() + 1);
      const year = leftyZero(date.getFullYear());
      const hours = leftyZero(date.getHours());
      const minutes = leftyZero(date.getMinutes());

      return `${weekDay} - ${day}/${month}/${year} - ${hours}:${minutes}`;
    }

    const date = new Date();
    const outputDate = formatDate(date);
    return outputDate;
  }

  printPage() {
    const data = new Object();
    this.form.querySelectorAll("input").forEach((input) => {
      data[input.placeholder] = input.value.trim();
    });

    const dataJSON = JSON.stringify(data);
    localStorage.setItem("printData", dataJSON);

    this.main.innerHTML = "";
    const h1 = document.createElement("h1");
    h1.innerText = "Emissão de NF";
    this.main.appendChild(h1);

    const printData = localStorage.getItem("printData");
    const printDataObject = JSON.parse(printData);
    for (let data in printDataObject) {
      const div = document.createElement("div");
      if (data === "E-mail") {
        div.innerHTML = `<span class="label">${data}: </span><span class="data">${printDataObject[
          data
        ].toLowerCase()}</span>`;
      } else if (printDataObject[data] === "") {
        continue;
      } else {
        if (data === "Endereço" && printDataObject[data] !== "") {
          if (printDataObject["Complemento"] !== "") {
            const splitData = printDataObject[data].split(",");
            splitData.splice(1, 0, ` ${printDataObject["Complemento"]}`);
            printDataObject[data] = splitData.join(",");
          }
          if (printDataObject["Número"] !== "") {
            const splitData = printDataObject[data].split(",");
            splitData.splice(1, 0, ` ${printDataObject["Número"]}`);
            printDataObject[data] = splitData.join(",");
          }
        }
        if (data === "Número" || data === "Complemento") {
          continue;
        } else {
          div.innerHTML = `<span class="label">${data}: </span><span class="data">${this.capitalize(
            printDataObject[data]
          )}</span>`;
        }
      }
      this.main.appendChild(div);
      localStorage.clear();
    }
    const dateDiv = document.createElement("div");
    dateDiv.innerHTML = `<span class="label">Data: </span><span class="data">${this.handleDate()}</span>`;
    this.main.appendChild(dateDiv);
  }

  inputIsValid() {
    let valid = true;

    for (let errorText of this.modal.querySelectorAll(".error-text")) {
      errorText.remove();
    }

    for (let input of this.form.querySelectorAll(".validate")) {
      const placeholder = input.placeholder;
      if (!input.value) {
        if (
          input.placeholder === "E-mail" ||
          input.placeholder === "Telefone"
        ) {
          continue;
        } else {
          this.getError(`O campo "${placeholder}" não pode estar vazio.`);
          valid = false;
        }
      }

      if (input.id === "cpf-paciente") {
        if (!this.validateCpf(input.value)) {
          this.getError(`${placeholder} inválido!`);
          valid = false;
        }
      }

      if (input.id === "cpf-emissor") {
        if (!this.validateCpf(input.value)) {
          this.getError(`${placeholder} inválido!`);
          valid = false;
        }
      }
    }

    const email = this.form.querySelector("#email");
    if (!this.validateEmail(email.value)) {
      this.getError(`${email.placeholder} inválido!`);
    }

    const tel = this.form.querySelector("#tel");
    if (!this.validateTel(tel)) {
      this.getError(`${tel.placeholder} inválido!`);
    }

    if (!email.value && !tel.value) {
      this.getError("Ao menos uma forma de contato deve ser enviada.");
    }

    return valid;
  }

  formatTel(tel) {
    const numbers = tel.value.replace(/\D+/g, "");
    const regex = /^(\d{2})(\d{4,5})(\d{4})$/;
    const resolve = numbers.replace(regex, "($1)$2-$3");

    tel.value = resolve;
  }

  formatCep(cep) {
    const numbers = cep.value.replace(/\D+/g, "");
    const regex = /^(\d{5})(\d{3})$/;
    const resolve = numbers.replace(regex, "$1-$2");

    cep.value = resolve;
  }

  formatCpf(cpf) {
    const numbers = cpf.value.replace(/\D+/g, "");
    const regex = /^(\d{3})(\d{3})(\d{3})(\d{2})$/;
    const resolve = numbers.replace(regex, "$1.$2.$3-$4");

    cpf.value = resolve;
  }

  getError(msg) {
    const p = document.createElement("p");
    p.innerText = msg;
    p.classList.add("error-text");
    this.modal.appendChild(p);
  }

  validateTel(tel) {
    if (!tel.value) {
      return true;
    } else {
      const onlyDigitTel = tel.value.replace(/\D+/g, "");
      if (onlyDigitTel.length < 10) {
        return false;
      }
      return true;
    }
  }

  validateEmail(email) {
    if (!email.value) {
      return true;
    } else {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    }
  }

  validateCpf(cpf) {
    cpf = cpf.replace(/\D+/g, "");

    if (cpf.length !== 11 || /^(.)\1+$/.test(cpf)) {
      return false;
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i) * (10 - i));
    }
    let firstDigit = 11 - (sum % 11);
    if (firstDigit > 9) {
      firstDigit = 0;
    }

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i) * (11 - i));
    }
    let secondDigit = 11 - (sum % 11);
    if (secondDigit > 9) {
      secondDigit = 0;
    }

    return (
      parseInt(cpf.charAt(9)) === firstDigit &&
      parseInt(cpf.charAt(10)) === secondDigit
    );
  }

  capitalize(string) {
    const words = string.split(" ");

    for (let i = 0; i < words.length; i++) {
      words[i] = words[i][0].toUpperCase() + words[i].substring(1);
    }

    return String(words.join(" "));
  }
}

const validate = new ValidateForm();
