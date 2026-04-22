const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.post("/scrape", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL fehlt" });
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "de-DE,de;q=0.9",
      },
    });
    const $ = cheerio.load(response.data);
    $("script, style, nav, footer, head, noscript, iframe, svg").remove();
    const title = $("title").text().trim();
    const metaDesc = $('meta[name="description"]').attr("content") || "";
    const text = $("body").text().replace(/\s+/g, " ").trim().slice(0, 4000);
    res.json({ success: true, content: `Titel: ${title}\nBeschreibung: ${metaDesc}\n\n${text}`, title });
  } catch (err) {
    res.status(500).json({ error: "Fehler: " + err.message }); 
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
