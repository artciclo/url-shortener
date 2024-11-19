require("dotenv").config();
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const path = require("path"); // Importe o módulo 'path'
const shortid = require("shortid"); // Para gerar IDs curtas
const validUrl = require("valid-url"); // Para validar URLs
const Url = require("./models/url"); // Importa o modelo Url

const app = express();
app.use(express.json());

router.post("/api/shorten", async (req, res) => {
  const { longUrl } = req.body;

  // Modelo do MongoDB para URLs useNewUrlParser
  const UrlSchema = new mongoose.Schema({
    longUrl: {
      type: String,
      required: true,
    },
    shortUrl: {
      type: String,
      required: true,
      unique: true, // Garante que shortUrls sejam únicas
    },
    key: {
      type: String,
      required: true,
      unique: true, // Garante que as chaves sejam únicas
    },
    clicks: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

  const cors = require("cors"); // Instale com npm install cors
  app.use(cors());

  // Rotas
  const urlRoutes = require("./routes/urlRoutes");
  app.use("/api", urlRoutes); // Prefixo /api para as rotas da API

  // Rota para redirecionar URLs curtas
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

  // Porta
  const PORT = process.env.PORT || 3000;

  // Tenta carregar o .env, tratando erros silenciosamente
  try {
    require("dotenv").config({ path: path.resolve(__dirname, ".env") }); //  Usando path.resolve para o caminho
    console.log(".env carregado:", process.env);
    console.log("Arquivo .env carregado com sucesso.");
  } catch (error) {
    console.error("Erro ao carregar o arquivo .env:", error.message); // Mensagem de erro mais específica
    console.warn(
      "As variáveis de ambiente do .env podem não estar disponíveis."
    );
  }

  //  Define a MONGO_URI após tentar carregar o .env
  const MONGO_URI = process.env.MONGO_URI;

  // Conexão com o MongoDB (após a tentativa de carregar o .env)
  if (!MONGO_URI) {
    console.error(
      "MONGO_URI não foi definida. Verifique o arquivo .env ou defina a variável de ambiente."
    );
    process.exit(1);
  }

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

  // Imprime todas as variáveis de ambiente para depuração (opcional)
  console.log("Variáveis de ambiente:", process.env);

  // VALIDAÇÃO: Verifique se longUrl é válido e se existe
  if (!validUrl.isUri(longUrl)) {
    return res.status(400).json({ message: "URL inválida" });
  }
  try {
    let url = await Url.findOne({ longUrl }); // Verifica se a URL já existe
    if (url) return res.json(url);

    const shortUrl = `http://seu_dominio/${shortid.generate()}`; //Substitua `seu_dominio`
    const key = shortid.generate();
    url = new Url({
      longUrl,
      shortUrl,
      key,
    });
    await url.save();
    res.status(201).json({ shortUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao criar URL curta" });
  }
});

module.exports = router;
