const router = require("express").Router();
const Url = require("../models/url"); // Importa o modelo
const shortid = require("shortid");
const validUrl = require("valid-url");

router.post("/shorten", async (req, res) => {
  const { longUrl } = req.body;
  const baseUrl =
    process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

  // Valida se o baseUrl é válido
  if (!validUrl.isUri(baseUrl)) {
    return res.status(401).json({ message: "URL base inválida" });
  }

  // Gera uma chave curta para a URL
  const key = shortid.generate();

  // Verifica se a URL longa é válida
  if (validUrl.isUri(longUrl)) {
    try {
      let url = await Url.findOne({ longUrl });

      // Se a URL já existe, retorna ela
      if (url) {
        return res.status(200).json(url);
      } else {
        // Cria uma nova URL encurtada
        const shortUrl = `${baseUrl}/${key}`;

        url = new Url({
          longUrl,
          shortUrl,
          key,
        });

        // Salva no banco de dados
        await url.save();
        return res.status(201).json(url); // 201 Created
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro no servidor" });
    }
  } else {
    return res.status(401).json({ message: "URL longa inválida" });
  }
});

module.exports = router;
