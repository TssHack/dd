const { Telegraf } = require('telegraf');

const BOT_TOKEN = '7669314020:AAFaNAD56Sc23EQ5fsDc_DNYXr77dnfmQ4w';
const ADMIN_ID = '7257163892';

const bot = new Telegraf(BOT_TOKEN);

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

        // ارسال پیام به ادمین با دکمه برای پاسخ
        await bot.telegram.sendMessage(ADMIN_ID, `
📩 <b>پیام ناشناس جدید:</b>  
🆔 شناسه پیام: <code>${messageId}</code>  
💬 متن پیام:  
<pre>${ctx.message.text}</pre>  
📌 برای پاسخ دادن، روی دکمه زیر کلیک کنید:
        `, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '✉️ پاسخ به این پیام', callback_data: `reply_${messageId}` }]
                ]
            }
        });

        // تاییدیه زیبا به کاربر
        await ctx.replyWithChatAction('typing');
        await new Promise(resolve => setTimeout(resolve, 1000));

        return ctx.replyWithHTML(`
✅ <b>پیام شما ناشناس ارسال شد!</b>  
📨 منتظر پاسخ از ادمین باشید.
        `);
    }
});

// پاسخ دادن ادمین به پیام ناشناس
bot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery.data;
    
    // بررسی اینکه آیا دکمه پاسخ به پیام ناشناس فشرده شده است
    if (data.startsWith('reply_')) {
        const messageId = data.split('_')[1];
        const userId = anonymousMessages[messageId]?.userId;
        
        if (userId) {
            const replyText = "پاسخ شما از طرف ادمین ارسال شد.";  // این متن می‌تواند توسط ادمین تغییر یابد

            // ارسال پاسخ به کاربر
            await bot.telegram.sendMessage(userId, `
📩 <b>پیام جدید از ادمین:</b>  
🗨️ <i>${replyText}</i>  
            `, { parse_mode: 'HTML' });

            // تایید به ادمین
            await ctx.answerCbQuery('✅ پاسخ شما ارسال شد!');
        } else {
            await ctx.answerCbQuery('⚠️ پیام ناشناس پیدا نشد.');
        }
    }
});

// راه‌اندازی ربات
bot.launch();
console.log('🚀 ربات با موفقیت راه‌اندازی شد!');
