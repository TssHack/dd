const { Telegraf } = require('telegraf');

const BOT_TOKEN = '7669314020:AAFaNAD56Sc23EQ5fsDc_DNYXr77dnfmQ4w';
const ADMIN_ID = '7257163892';

const bot = new Telegraf(BOT_TOKEN);

// ذخیره سشن‌ها به‌صورت دستی در متغیر
const sessions = {};  // اینجا سشن‌ها ذخیره می‌شوند

// ذخیره پیام‌های ناشناس
const anonymousMessages = {};

// استارت ربات
bot.start(async (ctx) => {
    await ctx.replyWithHTML(`
<b>✨ سلام ${ctx.from.first_name} عزیز!</b> 👋  
به <b>ربات ارسال پیام ناشناس</b> خوش آمدی!  
برای ارسال پیام ناشناس، روی دکمه زیر کلیک کن 👇  
    `, {
        reply_markup: {
            inline_keyboard: [
                [{ text: '💌 ارسال پیام ناشناس', callback_data: 'sendanon' }]
            ]
        }
    });

    // ارسال اطلاعیه به ادمین
    const user = ctx.from;
    await bot.telegram.sendMessage(ADMIN_ID, `
🚀 <b>یک کاربر جدید ربات را استارت کرد</b>  
👤 نام: ${user.first_name} ${user.last_name || ''}  
🔗 یوزرنیم: @${user.username || 'ندارد'}  
🆔 آیدی: <code>${user.id}</code>  
⏰ زمان استارت: ${new Date().toLocaleString()}
    `, { parse_mode: 'HTML' });
});

// دکمه ارسال پیام ناشناس
bot.on('callback_query', async (ctx) => {
    if (ctx.callbackQuery.data === 'sendanon') {
        await ctx.answerCbQuery();
        
        // ذخیره وضعیت در سشن دستی
        const userId = ctx.from.id;
        sessions[userId] = sessions[userId] || {};
        sessions[userId].anonymousMode = true;

        await ctx.replyWithHTML(`
<b>📝 لطفاً پیام خود را ارسال کنید:</b>  
<code>✉️ پیام شما به صورت ناشناس برای ادمین ارسال خواهد شد.</code>
        `);
    }
});

// دریافت پیام ناشناس
bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    sessions[userId] = sessions[userId] || {};

    if (sessions[userId].anonymousMode) {
        sessions[userId].anonymousMode = false;
        const messageId = Date.now().toString();

        anonymousMessages[messageId] = {
            userId: ctx.from.id,
            message: ctx.message.text
        };

        // ارسال پیام به ادمین با افکت زیبا
        await bot.telegram.sendMessage(ADMIN_ID, `
📩 <b>پیام ناشناس جدید:</b>  
🆔 شناسه پیام: <code>${messageId}</code>  
💬 متن پیام:  
<pre>${ctx.message.text}</pre>  
📌 برای پاسخ دادن، فقط روی این پیام ریپلای کنید.
        `, { parse_mode: 'HTML' });

        // تاییدیه زیبا به کاربر
        await ctx.replyWithChatAction('typing');
        await new Promise(resolve => setTimeout(resolve, 1000));

        return ctx.replyWithHTML(`
✅ <b>پیام شما ناشناس ارسال شد!</b>  
📨 منتظر پاسخ از ادمین باشید.
        `);
    }
});

// دریافت پاسخ از ادمین و ارسال به کاربر
bot.on('message', async (ctx) => {
    if (ctx.chat.id.toString() === ADMIN_ID) {
        const replyTo = ctx.message.reply_to_message;

        // اطمینان از اینکه پیام ادمین به پیام ناشناس ریپلای شده باشد
        if (replyTo && replyTo.text) {
            const messageId = replyTo.message_id;  // شناسه پیام ریپلای شده
            const replyText = ctx.message.text;

            // بررسی پیام‌های ناشناس ذخیره شده
            for (const [id, anonymousMessage] of Object.entries(anonymousMessages)) {
                if (anonymousMessage.messageId === messageId) {
                    const userId = anonymousMessage.userId;

                    // ارسال پاسخ به کاربر
                    await bot.telegram.sendMessage(userId, `
📩 <b>پیام جدید از ادمین:</b>  
🗨️ <i>${replyText}</i>  
                    `, { parse_mode: 'HTML' });

                    // پیام تایید به ادمین
                    await ctx.reply('✅ پاسخ شما برای کاربر ارسال شد.');
                    break;
                }
            }
        } else {
            await ctx.reply('⚠️ لطفاً پیام خود را به همراه شناسه پیام ارسال کنید.');
        }
    }
});

// راه‌اندازی ربات
bot.launch();
console.log('🚀 ربات با موفقیت راه‌اندازی شد!');
