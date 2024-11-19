const shortid = require("shortid");
const Url = require("../models/Url");

exports.shortenUrl = async (req, res) => {
  const { originalUrl } = req.body;
  const baseUrl = process.env.BASE_URL;

  if (!originalUrl) return res.status(400).json({ error: "URL é obrigatória" });

  try {
    let url = await Url.findOne({ originalUrl });

    if (url) {
      return res.json({ shortUrl: `${baseUrl}/${url.urlCode}` });
    } else {
      const urlCode = shortid.generate();
      const shortUrl = `${baseUrl}/${urlCode}`;

      url = new Url({ originalUrl, shortUrl, urlCode });
      await url.save();

      return res.json({ shortUrl });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no servidor" });
  }
};

exports.redirectUrl = async (req, res) => {
  const { code } = req.params;

  try {
    const url = await Url.findOne({ urlCode: code });

    if (url) {
      return res.redirect(url.originalUrl);
    } else {
      return res.status(404).json({ error: "URL não encontrada" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no servidor" });
  }
};
