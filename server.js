const express = require("express");
const bodyParser = require("body-parser");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Predefined filter responses
const identityQuestions = [
  "tum kon ho",
  "tumhara naam kya hai",
  "kya naam hai",
  "who are you",
  "what is your name",
  "kisne banaya hai",
  "who created you",
];

app.get("/", (req, res) => {
  res.render("index", { messages: [] });
});

app.post("/chat", async (req, res) => {
  const userMsg = req.body.message.toLowerCase();
  let botReply = "";

  try {
    // 🔹 Filter check
    if (identityQuestions.some(q => userMsg.includes(q))) {
      botReply = "मुझे Raj Patel ने बनाया है 🚀";
    } else {
      // Normal Gemini API call
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userMsg,
        config: {
          thinkingConfig: { thinkingBudget: 0 },
        },
      });
      botReply = response.text;
    }
  } catch (err) {
    console.error("Gemini API error:", err);
    botReply = "❌ कुछ गलती हो गई है, बाद में कोशिश करें।";
  }

  res.render("index", {
    messages: [
      { sender: "You", text: req.body.message },
      { sender: "Bot", text: botReply },
    ],
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server चल रहा है: http://localhost:${PORT}`);
});
