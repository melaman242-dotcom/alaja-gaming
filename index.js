const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("AL AJA UC SELLER BOT is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🔥 WELCOME TO AL AJA UC SELLER 🔥\n\n🛒 Choose an option:",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "💎 BUY UC", callback_data: "buy_uc" }]
        ]
      }
    }
  );
});

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;

  if (query.data === "buy_uc") {
    await bot.answerCallbackQuery(query.id);

    bot.sendMessage(chatId, "💎 Select your UC package:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "💎 60 UC — 100 ETB", callback_data: "uc_60" }],
          [{ text: "💎 325 UC — 500 ETB", callback_data: "uc_325" }],
          [{ text: "💎 660 UC — 1,000 ETB", callback_data: "uc_660" }],
          [{ text: "💎 1800 UC — 2,500 ETB", callback_data: "uc_1800" }]
        ]
      }
    });
  }

  const packages = {
    uc_60: "60 UC — 100 ETB",
    uc_325: "325 UC — 500 ETB",
    uc_660: "660 UC — 1,000 ETB",
    uc_1800: "1800 UC — 2,500 ETB"
  };

  if (packages[query.data]) {
    await bot.answerCallbackQuery(query.id);
    bot.sendMessage(
      chatId,
      `✅ Selected: ${packages[query.data]}\n\n🆔 Please send your PUBG Player ID.`
    );
  }
});
