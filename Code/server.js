import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const dataFile = path.join(__dirname, "products.json");

// === Produkt speichern ===
app.post("/save-product", (req, res) => {
  try {
    const newItem = req.body;
    const items = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    items.push(newItem);
    fs.writeFileSync(dataFile, JSON.stringify(items, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to save product" });
  }
});

// === Produkt löschen ===
app.delete("/delete-product", (req, res) => {
  try {
    const { link } = req.body;
    if (!link) {
      return res.status(400).json({ success: false, message: "Missing link" });
    }

    const items = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    const newItems = items.filter((item) => item.link !== link);

    fs.writeFileSync(dataFile, JSON.stringify(newItems, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete product" });
  }
});

app.use(express.static(__dirname));
app.listen(3000, () => console.log("🚀 Server läuft auf http://localhost:3000"));
