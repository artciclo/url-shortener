require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const shortid = require("shortid");
const validUrl = require("valid-url");
const Url = require("./models/url");
const cors = require("cors");

// CRIAR O ROUTER AQUI
const router = express.Router();

const app = express();
app.use(express.json());
app.use(cors());

const urlRoutes = require("./routes/urlRoutes");
app.use("/api", urlRoutes);

// Rota para redirecionar URLs curtas (fora do handler POST)
app.get("/:key", async (req, res) => {
  try {
    const url = await Url.findOne({ key: req.params.key });
    if (url) {
      url.clicks++;
      await url.save();
      return res.redirect(url.longUrl);
    } else {
      return res.status(404).json({ message: "URL curta não encontrada" });
    }
  } catch (error) {
    console.error("Erro ao redirecionar:", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

// Handler POST para /api/shorten (código simplificado e corrigido)
router.post("/shorten", async (req, res) => {
  const { longUrl } = req.body;

  if (!validUrl.isUri(longUrl)) {
    return res.status(400).json({ message: "URL inválida" });
  }
  try {
    const shortUrl = `http://seu_dominio/${shortid.generate()}`; // Substitua seu_dominio
    const key = shortid.generate();
    const url = new Url({ longUrl, shortUrl, key });
    await url.save();
    res.status(201).json({ shortUrl });
  } catch (error) {
    console.error("Erro ao criar URL curta:", error); // Log detalhado
    res.status(500).json({ message: "Erro no servidor" });
  }
});

// O restante do código (conexão com o MongoDB, porta, etc.) deve vir aqui
// ... (seu código de conexão com MongoDB, configuração de porta, etc) ...

const PORT = process.env.PORT || 3000;
// ... (seu código de conexão com MongoDB) ...

mongoose
  .connect(MONGO_URI, {})
  .then(() => {
    console.log("Conectado ao MongoDB com sucesso!");
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  })
  .catch((err) => {
    console.error("Erro ao conectar ao MongoDB:", err);
    process.exit(1);
  });

app.use(router);
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

// Rota para redirecionar URLs curtas
app.get("/:key", async (req, res) => {
  // ...
});

// Handler POST para /api/shorten
router.post("/shorten", async (req, res) => {
  // ...
});
// Adicionar o middleware do router depois de definir todas as rotas
app.use(router); // Use o router APÓS definir todas as rotas

mongoose
  .connect(MONGO_URI, {})
  .then(() => {
    console.log("Conectado ao MongoDB com sucesso!");
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  })
  .catch((err) => {
    console.error("Erro ao conectar ao MongoDB:", err);
    process.exit(1);
  });

PORT;
