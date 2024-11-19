const express = require("express");
const router = express.Router();
const Url = require("../models/url");
const shortid = require("shortid");
const validUrl = require("valid-url");

router.post("/shorten", async (req, res) => {
  const { longUrl } = req.body;

  // Validação (já no backend)
  if (!validUrl.isUri(longUrl)) {
    return res.status(400).json({ message: "URL inválida" });
  }

  try {
    // Verificar se a URL já existe
    let url = await Url.findOne({ longUrl });
    if (url) {
      return res.json(url); // Retorna a URL existente
    }

    // Criar a URL curta
    const baseUrl =
      process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const key = shortid.generate();
    const shortUrl = `${baseUrl}/${key}`;
    url = new Url({ longUrl, shortUrl, key });
    await url.save();
    res.status(201).json(url);
  } catch (error) {
    console.error("Erro ao criar URL curta:", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

module.exports = router;
