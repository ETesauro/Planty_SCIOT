const { Telegraf } = require("telegraf");
const amqp = require("amqplib");
const moment = require("moment");

const bot = new Telegraf("<put your Bot Token here>");
var chatId;

// * Client riceve un messaggio dalla coda
connectAndWait();

// * Start del bot
bot.start((ctx) => {
  chatId = ctx.update.message.chat.id;
  ctx.reply(
    `Hi ${ctx.update.message.chat.first_name}! Don't stop this bot if you want to keep track of your plant.`
  );
});

// * Callback function
bot.action("water", (ctx) => {
  sendMessage("I’m watering the plant remotely.");
  ctx.deleteMessage();
  var str =
    "🤖 Don’t worry: I’ll take care of it.\n\nDate: " +
    moment().format("MMMM Do YYYY, h:mm:ss a");

  ctx.reply(str);
});

// * Callback function
bot.action("call_someone", (ctx) => {
  sendMessage("I’m warning someone to water the plant.");
  ctx.deleteMessage();
  var str =
    "💁🏻‍♂️ Don't worry: I warned your brother to water the plant.\n\nDate: " +
    moment().format("MMMM Do YYYY, h:mm:ss a");

  ctx.reply(str);
});

bot.launch();

// * Aspetto connessioni
function connectAndWait() {
  amqp
    .connect("amqp://guest:guest@192.168.1.20:5672")
    .then(function (conn) {
      return conn.createChannel().then(function (ch) {
        var ok = ch.assertQueue("iot/alerts", { durable: false });

        ok = ok.then(function (_qok) {
          return ch.consume(
            "iot/alerts",
            function (msg) {
              waitForMessage(msg);
            },
            { noAck: true }
          );
        });

        return ok.then(function (_consumeOk) {
          console.log(" *** Telegram Bot Started! ***");
        });
      });
    })
    .catch(console.warn);
}

// * Aspetto messaggi
function waitForMessage(msg) {
  console.log("Umidity: " + msg.content.toString());
  // * Opzioni per callback
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Water the plant remotely",
            callback_data: "water",
          },
        ],
        [
          {
            text: "Warn someone to water the plant",
            callback_data: "call_someone",
          },
        ],
      ],
    },
  };

  // Messaggio al bot
  bot.telegram.sendMessage(
    chatId,
    `Hey! The soil of the plant is too dry. Humidity is at ${msg.content.toString()}%!\nWhat do you do?`,
    options
  );
}

// * Loggo i messaggi di risposta
function sendMessage(msg) {
  var queue = "iot/logs";
  amqp
    .connect("amqp://guest:guest@192.168.1.20:5672")
    .then(function (conn) {
      return conn
        .createChannel()
        .then(function (channel) {
          var ok = channel.assertQueue(queue, { durable: false });
          return ok.then(function (_qok) {
            channel.sendToQueue(queue, Buffer.from(msg));
            console.log("- " + msg + "\n");
            return channel.close();
          });
        })
        .finally(function () {
          conn.close();
        });
    })
    .catch(console.warn);
}
