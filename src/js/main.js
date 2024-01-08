const nomePaciente = document.querySelector("#nome-paciente");
const cpfPaciente = document.querySelector("#cpf-paciente");
const nomeEmissor = document.querySelector("#nome-emissor");
const cpfEmissor = document.querySelector("#cpf-emissor");
const email = document.querySelector("#email");
const tel = document.querySelector("#tel");
const cep = document.querySelector("#cep");
const endereco = document.querySelector("#endereco");
const numero = document.querySelector("#numero");
const complemento = document.querySelector("#complemento");
const form = document.querySelector("form");
const errorMsg = document.querySelectorAll("#msg");
const dadosNf = {
  nomePaciente: "",
  cpfPaciente: "",
  nomeEmissor: "",
  cpfEmissor: "",
  email: "",
  tel: "",
  cep: "",
  endereco: "",
  numero: "",
  complemento: "",
};

form.addEventListener("submit", (event) => {
  event.preventDefault();

  validarCampos();
  console.log(dadosNf);
});

function validarCampos() {
  if (
    !nomePaciente.value ||
    !cpfPaciente.value ||
    !nomeEmissor.value ||
    !cpfEmissor.value
  ) {
    errorMsg.forEach((msg) => {
      if (!msg.previousElementSibling.value) {
        msg.innerText = "Este campo deve ser preenchido!";
      }

      if (msg.previousElementSibling.value) {
        msg.innerText = "";
      }
    });
  }

  if (validarCpf(cpfPaciente.value)) {
    errorMsg.forEach((msg) => {
      if (msg.previousElementSibling.id === "cpf-paciente") {
        msg.innerText = "";
        dadosNf.cpfPaciente = cpfPaciente.value;
      }
    });
  } else {
    errorMsg.forEach((msg) => {
      if (msg.previousElementSibling.id === "cpf-paciente") {
        msg.innerText = "CPF inválido!";
      }
    });
  }

  if (validarCpf(cpfEmissor.value)) {
    errorMsg.forEach((msg) => {
      if (msg.previousElementSibling.id === "cpf-emissor") {
        msg.innerText = "";
        dadosNf.cpfEmissor = cpfEmissor.value;
      }
    });
  } else {
    errorMsg.forEach((msg) => {
      if (msg.previousElementSibling.id === "cpf-emissor") {
        msg.innerText = "CPF inválido!";
      }
    });
  }

  if (validarEmail(email.value)) {
    errorMsg.forEach((msg) => {
      if (msg.previousElementSibling.id === "email") {
        msg.innerText = "";
        dadosNf.email = email.value;
      }
    });
  } else {
    errorMsg.forEach((msg) => {
      if (msg.previousElementSibling.id === "email") {
        msg.innerText = "E-mail inválido!";
      }
    });
  }

  dadosNf.nomePaciente = nomePaciente.value;
  dadosNf.nomeEmissor = nomeEmissor.value;
  dadosNf.tel = tel.value;
  dadosNf.cep = cep.value;
  dadosNf.endereco = endereco.value;
  dadosNf.numero = numero.value;
  dadosNf.complemento = complemento.value;
}

function validarEmail(email) {
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regexEmail.test(email);
}

function validarCpf(cpf) {
  cpf = cpf.replace(/\D/g, "");

  if (cpf.length !== 11 || /^(.)\1+$/.test(cpf)) {
    return false;
  }

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i) * (10 - i));
  }
  let primeiroDigito = 11 - (soma % 11);
  if (primeiroDigito > 9) {
    primeiroDigito = 0;
  }

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i) * (11 - i));
  }
  let segundoDigito = 11 - (soma % 11);
  if (segundoDigito > 9) {
    segundoDigito = 0;
  }

  return (
    parseInt(cpf.charAt(9)) === primeiroDigito &&
    parseInt(cpf.charAt(10)) === segundoDigito
  );
}

function atualizarMascaraCpfPaciente() {
  const cpfDigitado = cpfPaciente.value;
  const cpfFormatado = formatarCpf(cpfDigitado);
  cpfPaciente.value = cpfFormatado;
}

function atualizarMascaraCpfEmissor() {
  const cpfDigitado = cpfEmissor.value;
  const cpfFormatado = formatarCpf(cpfDigitado);
  cpfEmissor.value = cpfFormatado;
}

function formatarCpf(cpf) {
  const numeros = cpf.replace(/\D/g, "");
  const regex = /^(\d{3})(\d{3})(\d{3})(\d{2})$/;
  const resultado = numeros.replace(regex, "$1.$2.$3-$4");

  return resultado;
}

function atualizarMascaraTel() {
  const telefoneDigitado = tel.value;
  const telefoneFormatado = formatarTelefone(telefoneDigitado);
  tel.value = telefoneFormatado;
}

function formatarTelefone(telefone) {
  const numeros = telefone.replace(/\D/g, "");
  const regex = /^(\d{2})(\d{4,5})(\d{4})$/;
  const resultado = numeros.replace(regex, "($1) $2-$3");

  return resultado;
}

document.querySelector("#tel").addEventListener("input", atualizarMascaraTel);
document
  .querySelector("#cpf-paciente")
  .addEventListener("input", atualizarMascaraCpfPaciente);
document
  .querySelector("#cpf-emissor")
  .addEventListener("input", atualizarMascaraCpfEmissor);
