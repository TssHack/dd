const TelegramBot = require('node-telegram-bot-api');

// توکن ربات خود را وارد کنید
const token = '7849789538:AAFXqjOn8NAiDfM8Uy-aTeZQHjIRbKQRDPs'; 

// ایجاد یک نمونه از ربات
const bot = new TelegramBot(token, { polling: true });

// ایجاد یک شی برای ذخیره کردن اطلاعات موقت
let userInput = {};

// وقتی کاربر پیامی ارسال می‌کند
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // بررسی اینکه آیا کاربر در حال ارسال اطلاعات جدید است یا خیر
  if (!userInput[chatId]) {
    userInput[chatId] = { step: 0 };  // تنظیم وضعیت شروع
    bot.sendMessage(chatId, 'سلام! لطفا توکن ربات خود را وارد کنید:');
  } else {
    // دریافت اطلاعات توکن
    if (userInput[chatId].step === 0) {
      userInput[chatId].token = msg.text;
      userInput[chatId].step = 1;
      bot.sendMessage(chatId, 'توکن ثبت شد. حالا لطفا آی‌دی عددی کاربر را وارد کنید:');
    } 
    // دریافت آی‌دی عددی
    else if (userInput[chatId].step === 1) {
      userInput[chatId].userId = msg.text;
      userInput[chatId].step = 2;
      bot.sendMessage(chatId, 'آی‌دی عددی ثبت شد. حالا لطفا پیام خود را وارد کنید:');
    } 
    // دریافت پیام
    else if (userInput[chatId].step === 2) {
      userInput[chatId].message = msg.text;
      bot.sendMessage(chatId, 'پیام ثبت شد. در حال ارسال به کاربر...');

      // ارسال پیام به کاربر
      const botInstance = new TelegramBot(userInput[chatId].token);
      botInstance.sendMessage(userInput[chatId].userId, userInput[chatId].message)
        .then(() => {
          bot.sendMessage(chatId, 'پیام با موفقیت ارسال شد!');
        })
        .catch((error) => {
          bot.sendMessage(chatId, `خطا در ارسال پیام: ${error.message}`);
        });

      // بازگشت به حالت اولیه
      delete userInput[chatId];
    }
  }
});
