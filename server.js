// server.js (updated)
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// optional: root serves the contact form
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "contact.html"));
});

app.post("/contact", async (req, res) => {
  const { name, phone, email, org, message } = req.body;

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v20.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: process.env.TEMPLATE_NAME,
          language: { code: "en_US" },
          components: [
            {
              type: "header",
              parameters: [
                {
                  type: "image",
                  image: {
                    link: "https://i.ibb.co/kgQ8BfFh/Whats-App-Image-2025-11-27-at-11-38-52-AM.jpg"
                  }
                }
              ]
            },
            {
              type: "body",
              parameters: [{ type: "text", text: name }]
            }
          ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ status: "success", message: "WhatsApp sent successfully!", meta: response.data });
  } catch (err) {
    console.error("WhatsApp Error:", err.response?.data || err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Bind to host-provided port (required by Render, Railway, Heroku, etc.)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
