const { Telegraf } = require('telegraf');

const BOT_TOKEN = '7669314020:AAFaNAD56Sc23EQ5fsDc_DNYXr77dnfmQ4w';
const ADMIN_ID = '7257163892';

const bot = new Telegraf(BOT_TOKEN);

// استفاده از session داخلی خود Telegraf
bot.use(Telegraf.session());

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
        ctx.session = ctx.session || {};
        ctx.session.anonymousMode = true;

        await ctx.replyWithHTML(`
<b>📝 لطفاً پیام خود را ارسال کنید:</b>  
<code>✉️ پیام شما به صورت ناشناس برای ادمین ارسال خواهد شد.</code>
        `);
    }
});

// دریافت پیام ناشناس
bot.on('text', async (ctx) => {
    ctx.session = ctx.session || {};
    
    if (ctx.session.anonymousMode) {
        ctx.session.anonymousMode = false;
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
📌 برای پاسخ دادن، روی این پیام ریپلای کنید و شناسه پیام را در ابتدای پاسخ بنویسید.
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
        const messageText = ctx.message.text;

        if (replyTo && messageText) {
            const parts = messageText.split(' ');
            const messageId = parts.shift();
            const replyText = parts.join(' ').trim();

            if (anonymousMessages[messageId]) {
                const userId = anonymousMessages[messageId].userId;

                // ارسال پاسخ با افکت زیبا
                await bot.telegram.sendMessage(userId, `
📩 <b>پیام جدید از ادمین:</b>  
🗨️ <i>${replyText}</i>  
                `, { parse_mode: 'HTML' });

                await ctx.reply('✅ پاسخ شما برای کاربر ارسال شد.');
            } else {
                await ctx.reply('⚠️ شناسه پیام معتبر نیست.');
            }
        }
    }
});

// راه‌اندازی ربات
bot.launch();
console.log('🚀 ربات با موفقیت راه‌اندازی شد!');
