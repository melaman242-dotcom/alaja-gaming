const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

const token = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

const bot = new TelegramBot(token, { polling: true });

const app = express();
const PORT = process.env.PORT || 3000;

const orders = {};

app.get("/", (req, res) => {
  res.send("🔥 AL AJA UC SELLER BOT is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// ===============================
// START
// ===============================

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  orders[chatId] = {};

  bot.sendMessage(
    chatId,
    "🔥 WELCOME TO AL AJA UC SELLER 🔥\n\n🛒 Choose an option:",
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "💎 BUY UC",
              callback_data: "buy_uc"
            }
          ]
        ]
      }
    }
  );
});


// ===============================
// BUTTONS
// ===============================

bot.on("callback_query", async (query) => {

  const chatId = query.message.chat.id;
  const data = query.data;

  await bot.answerCallbackQuery(query.id);


  // BUY UC
  if (data === "buy_uc") {

    return bot.sendMessage(
      chatId,
      "💎 SELECT YOUR UC PACKAGE:",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "💎 60 UC — 200 ETB",
                callback_data: "uc_60"
              }
            ],
            [
              {
                text: "💎 325 UC — 900 ETB",
                callback_data: "uc_325"
              }
            ],
            [
              {
                text: "💎 660 UC — 1,750 ETB",
                callback_data: "uc_660"
              }
            ],
            [
              {
                text: "💎 1800 UC — 4,400 ETB",
                callback_data: "uc_1800"
              }
            ]
          ]
        }
      }
    );
  }


  // UC PACKAGES
  const packages = {
    uc_60: {
      name: "60 UC",
      price: 200
    },

    uc_325: {
      name: "325 UC",
      price: 900
    },

    uc_660: {
      name: "660 UC",
      price: 1750
    },

    uc_1800: {
      name: "1800 UC",
      price: 4400
    }
  };


  // PACKAGE SELECTED
  if (packages[data]) {

    orders[chatId] = {
      package: packages[data]
    };

    return bot.sendMessage(
      chatId,
      `✅ Selected: ${packages[data].name}\n` +
      `💰 Price: ${packages[data].price.toLocaleString()} ETB\n\n` +
      `🆔 Please send your PUBG Player ID.`
    );
  }


  // ===============================
  // PAYMENT METHOD
  // ===============================

  if (data === "payment_method") {

    return bot.sendMessage(
      chatId,
      "💳 SELECT PAYMENT METHOD:",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📱 TELEBIRR",
                callback_data: "pay_telebirr"
              }
            ],
            [
              {
                text: "🏦 CBE",
                callback_data: "pay_cbe"
              }
            ]
          ]
        }
      }
    );
  }


  // TELEBIRR
  if (data === "pay_telebirr") {

    orders[chatId].payment = "Telebirr";

    return bot.sendMessage(
      chatId,
      `📱 TELEBIRR\n\n` +
      `💳 Number: 0906869740\n` +
      `👤 Name: TEKALEGN TARKU\n\n` +
      `💰 Amount: ${orders[chatId].package.price.toLocaleString()} ETB\n\n` +
      `⚠️ Please make the payment, then tap the button below.`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "✅ I HAVE PAID",
                callback_data: "paid"
              }
            ]
          ]
        }
      }
    );
  }


  // CBE
  if (data === "pay_cbe") {

    orders[chatId].payment = "CBE";

    return bot.sendMessage(
      chatId,
      `🏦 CBE\n\n` +
      `💳 Account: 1000670104994\n` +
      `👤 Name: Mr MELAKU MESAY NEGA\n\n` +
      `💰 Amount: ${orders[chatId].package.price.toLocaleString()} ETB\n\n` +
      `⚠️ Please make the payment, then tap the button below.`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "✅ I HAVE PAID",
                callback_data: "paid"
              }
            ]
          ]
        }
      }
    );
  }


  // I HAVE PAID
  if (data === "paid") {

    orders[chatId].waitingScreenshot = true;

    return bot.sendMessage(
      chatId,
      "📸 Please send your payment screenshot here.\n\n" +
      "After receiving it, we will review your payment."
    );
  }
});


// ===============================
// PLAYER ID + SCREENSHOT
// ===============================

bot.on("message", async (msg) => {

  const chatId = msg.chat.id;

  // Ignore commands
  if (msg.text && msg.text.startsWith("/")) return;


  // No order
  if (!orders[chatId]) return;


  // ===============================
  // PAYMENT SCREENSHOT
  // ===============================

  if (
    orders[chatId].waitingScreenshot &&
    msg.photo
  ) {

    orders[chatId].waitingScreenshot = false;

    const orderId =
      "ALAJA-" +
      Math.floor(100000 + Math.random() * 900000);

    orders[chatId].orderId = orderId;


    // Send confirmation to customer
    await bot.sendMessage(
      chatId,
      `✅ PAYMENT SCREENSHOT RECEIVED!\n\n` +
      `📦 Order ID: ${orderId}\n` +
      `💎 Package: ${orders[chatId].package.name}\n` +
      `💰 Amount: ${orders[chatId].package.price.toLocaleString()} ETB\n` +
      `🆔 Player ID: ${orders[chatId].playerId}\n` +
      `💳 Payment: ${orders[chatId].payment}\n\n` +
      `⏳ Your order is waiting for admin confirmation.`
    );


    // Send order to admin
    if (ADMIN_CHAT_ID) {

      await bot.sendMessage(
        ADMIN_CHAT_ID,
        `🔥 NEW UC ORDER 🔥\n\n` +
        `📦 Order ID: ${orderId}\n` +
        `👤 User: ${msg.from.first_name || "Unknown"}\n` +
        `🆔 Player ID: ${orders[chatId].playerId}\n` +
        `💎 Package: ${orders[chatId].package.name}\n` +
        `💰 Amount: ${orders[chatId].package.price.toLocaleString()} ETB\n` +
        `💳 Payment: ${orders[chatId].payment}`
      );

      await bot.sendPhoto(
        ADMIN_CHAT_ID,
        msg.photo[msg.photo.length - 1].file_id,
        {
          caption:
            `📸 PAYMENT SCREENSHOT\n\n` +
            `Order: ${orderId}\n` +
            `Player ID: ${orders[chatId].playerId}`
        }
      );
    }

    return;
  }


  // ===============================
  // PLAYER ID
  // ===============================

  if (
    orders[chatId].package &&
    !orders[chatId].playerId
  ) {

    const playerId = msg.text?.trim();

    if (!playerId) return;

    if (!/^\d{6,15}$/.test(playerId)) {

      return bot.sendMessage(
        chatId,
        "❌ Invalid Player ID.\n\n" +
        "Please send your PUBG Player ID using numbers only."
      );
    }


    orders[chatId].playerId = playerId;

    return bot.sendMessage(
      chatId,
      `✅ Player ID received!\n\n` +
      `🆔 Player ID: ${playerId}\n` +
      `💎 Package: ${orders[chatId].package.name}\n` +
      `💰 Amount: ${orders[chatId].package.price.toLocaleString()} ETB\n\n` +
      `💳 Choose your payment method:`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📱 TELEBIRR",
                callback_data: "pay_telebirr"
              }
            ],
            [
              {
                text: "🏦 CBE",
                callback_data: "pay_cbe"
              }
            ]
          ]
        }
      }
    );
  }

});
