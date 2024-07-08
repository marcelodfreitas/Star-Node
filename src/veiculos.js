const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());
app.use(cors());

// Ouvidor de porta
app.listen(8080, () => {
  console.log("Server is running on port 8080");
});

// Array onde ficam guardados os veículos
const veiculos = [
  { id: 1, modelo: "Uno", marca: "Fiat", ano: 2021, cor: "Vermelho", preco: "R$27.000" },
  { id: 2, modelo: "Gol", marca: "VW", ano: 2022, cor: "Azul", preco: "R$30.000" },
  { id: 3, modelo: "Corvette", marca: "Chevrolet", ano: 2020, cor: "Preto", preco: "R$349.000" },
  { id: 4, modelo: "California", marca: "Ferrari", ano: 2010, cor: "Amarela", preco: "R$278.000"}
];

// Array onde ficam guardados os usuários
const usuarios = [];

// Ler veículos do array
app.get("/veiculos", (request, response) => {
  if (veiculos.length === 0) {
    return response.status(404).json({ message: "Nenhum veículo encontrado" });
  }
  return response.json(veiculos);
});

// Criar veículos no array
app.post("/veiculos", (request, response) => {
  const { modelo, marca, ano, cor, preco } = request.body;
  if (!modelo || !marca) {
    return response.status(400).json({ message: "Todos os dados são obrigatórios" });
  }

  const novoVeiculo = { id: veiculos.length + 1, modelo, marca, ano, cor, preco };
  veiculos.push(novoVeiculo);
  return response.status(201).json({ message: "Veículo adicionado com sucesso", veiculo: novoVeiculo });
});

// Filtro de veículos por marca
app.get("/veiculos/marca", (request, response) => {
  const { marca } = request.query;
  if (!marca) {
    return response.status(400).json({ message: "A marca é obrigatória para o filtro" });
  }

  let filteredVeiculos = veiculos.filter((veiculo) => veiculo.marca.toLowerCase() === marca.toLowerCase());
  if (filteredVeiculos.length === 0) {
    return response.status(404).json({ message: `Nenhum veículo encontrado para a marca ${marca}` });
  }

  return response.status(200).json(filteredVeiculos);
});

// Pesquisar veículo por ID
app.get("/veiculos/:id", (request, response) => {
  const { id } = request.params;
  const veiculo = veiculos.find((v) => v.id == id);
  if (!veiculo) {
    return response.status(404).json({ message: "Veículo não encontrado" });
  }
  return response.json(veiculo);
});

// 4 - Endpoint para Atualizar veículo
app.put("/veiculos/:id", (request, response) => {
  const { id } = request.params;
  const { cor, preco } = request.body;

  const veiculo = veiculos.find((v) => v.id == id);
  if (!veiculo) {
    return response.status(404).json({ message: "Veículo não encontrado. O usuário deve voltar para o menu inicial depois" });
  }

  if (cor) veiculo.cor = cor;
  if (preco) veiculo.preco = preco;

  return response.json({ message: "Veículo atualizado com sucesso", veiculo });
});

// 5 - Endpoint para Remover veículo
app.delete("/veiculos/:id", (request, response) => {
  const { id } = request.params;
  const index = veiculos.findIndex(v => v.id == id);

  if (index === -1) {
    return response.status(404).json({ message: "Veículo não encontrado. O usuário deve voltar para o menu inicial depois" });
  }

  veiculos.splice(index, 1);
  return response.json({ message: "Veículo removido com sucesso" });
});

// 6 - Endpoint para Criar uma pessoa usuária
app.post("/usuarios", async (request, response) => {
  const { nome, email, senha } = request.body;

  if (!nome || !email || !senha) {
    return response.status(400).json({ message: "Todos os campos são obrigatórios" });
  }

  const hashedPassword = await bcrypt.hash(senha, 10);

  const novoUsuario = { id: usuarios.length + 1, nome, email, senha: hashedPassword };
  usuarios.push(novoUsuario);

  return response.status(201).json({ message: "Usuário criado com sucesso", usuario: novoUsuario });
});

// 7 - Endpoint para logar uma pessoa usuária
app.post("/login", async (request, response) => {
  const { email, senha } = request.body;

  if (!email || !senha) {
    return response.status(400).json({ message: "Email e senha são obrigatórios" });
  }

  const usuario = usuarios.find(u => u.email === email);
  if (!usuario) {
    return response.status(400).json({ message: "Email ou senha incorretos" });
  }

  const isPasswordValid = await bcrypt.compare(senha, usuario.senha);
  if (!isPasswordValid) {
    return response.status(400).json({ message: "Email ou senha incorretos" });
  }

  return response.json({ message: "Logado com sucesso", usuario });
});
