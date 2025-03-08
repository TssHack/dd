
const axios = require('axios');

const BOT_TOKEN = '7669314020:AAFaNAD56Sc23EQ5fsDc_DNYXr77dnfmQ4w';
const ADMIN_ID = '7257163892';

const bot = new Telegraf(BOT_TOKEN);

// دایره کلمات و عبارات
const responseDictionary = {
    "سلام": ["سلام!", "سلام به شما!", "درود بر شما!", "هی، سلام! 👋"],
    "خداحافظ": ["خداحافظ! 👋", "بدرود!", "خدانگهدار!", "امیدوارم روز خوبی داشته باشید!"],
    "کمک": ["چطور می‌توانم کمک کنم؟ 🤔", "چه کمکی از دست من برمی‌آید؟ 💡", "در چه زمینه‌ای نیاز به کمک دارید؟"],
    "چه خبر؟": ["همه چیز عالیه!", "هیچی خاصی! تو چه خبر؟", "همه چیز خوبه, مرسی که پرسیدی! 😊"],
    "پیام ناشناس": ["لطفاً پیام خود را بنویسید تا برای ادمین ارسال شود. ✨", "پیام شما بدون نمایش نام ارسال خواهد شد. ✉️"],
};

// دکمه‌های شیشه‌ای
const startKeyboard = [
    [
        { text: 'ارسال پیام ناشناس ✉️', callback_data: 'sendanon' },
        { text: 'راهنما 📚', callback_data: 'help' }
    ]
];

// دستور استارت با دکمه‌های شیشه‌ای
bot.start((ctx) => {
    ctx.replyWithHTML('<b>سلام!</b> 👋\nبرای ارسال پیام ناشناس به من، روی دکمه زیر کلیک کن یا از دستور <code>/sendanon</code> استفاده کن.', {
        reply_markup: {
            inline_keyboard: startKeyboard
        }
    });

    // اطلاع‌رسانی به ادمین
    const user = ctx.from;
    bot.telegram.sendMessage(ADMIN_ID, `
یک کاربر جدید ربات را استارت کرده است. 🎉
نام کاربر: ${user.first_name} ${user.last_name || ''}
یوزرنیم: @${user.username || 'ندارد'}
آیدی کاربر: ${user.id}
زمان استارت: ${new Date().toLocaleString()}
📝
`);
});

// دریافت دکمه‌های شیشه‌ای
bot.on('callback_query', (ctx) => {
    const callbackData = ctx.callbackQuery.data;

    if (callbackData === 'sendanon') {
        ctx.answerCbQuery('لطفا پیام خود را وارد کنید. پیام شما بدون نمایش نام ارسال خواهد شد. ✨');
        ctx.replyWithHTML('<b>لطفا پیام خود را وارد کنید:</b>\n<code>پیام شما ناشناس ارسال خواهد شد.</code> 🌟');
    } else if (callbackData === 'help') {
        ctx.answerCbQuery('راهنمای استفاده از ربات 📚');
        ctx.replyWithHTML(`
            <b>راهنما:</b> 🔍
            این ربات به شما این امکان را می‌دهد که پیام‌های ناشناس برای ادمین ارسال کنید. ✉️
            کافیست پیام خود را وارد کنید و ادمین آن را دریافت خواهد کرد. 📬
            <i>برای شروع، از دکمه‌های زیر استفاده کنید.</i> 👇
        `);
    }
});

// دریافت پیام‌های ناشناس
bot.on('text', (ctx) => {
    if (ctx.chat.type === 'private') {
        const userMessage = ctx.message.text;

        if (!userMessage.startsWith('/sendanon')) {
            bot.telegram.sendMessage(ADMIN_ID, `
پیام ناشناس از کاربر @${ctx.from.username || 'نامشخص'} (${ctx.from.id}):
<pre>${userMessage}</pre>
`, { parse_mode: 'HTML' });
            ctx.replyWithHTML('<b>پیام شما به صورت ناشناس برای ادمین ارسال شد. ✅</b>');
        }
    }
});

// دستور ارسال پیام ناشناس
bot.command('sendanon', (ctx) => {
    ctx.replyWithHTML('<b>لطفا پیام خود را وارد کنید:</b>\n<code>پیام شما ناشناس ارسال خواهد شد.</code> ✨');
});

// پاسخ به پیام‌ها با استفاده از دایره کلمات
bot.on('text', async (ctx) => {
    const message = ctx.message.text;

    // جستجو در دایره کلمات
    for (let key in responseDictionary) {
        if (message.includes(key)) {
            const responses = responseDictionary[key];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            ctx.reply(randomResponse);
            return;
        }
    }

    // اگر هیچ کلمه‌ای پیدا نشد، از API استفاده می‌کنیم
    const replyTo = ctx.message.reply_to_message;
    if (replyTo && replyTo.from.username === ctx.botInfo.username) {
        try {
            const response = await axios.get(`https://open.wiki-api.ir/apis-1/ReadyAnswer?q=${encodeURIComponent(message)}`);
            if (response.data && response.data.results) {
                ctx.reply(response.data.results, { reply_to_message_id: ctx.message.message_id });
            } else {
                ctx.reply('پاسخی یافت نشد!', { reply_to_message_id: ctx.message.message_id });
            }
        } catch (error) {
            ctx.reply('خطا در دریافت پاسخ از API!', { reply_to_message_id: ctx.message.message_id });
        }
    }
});

// ارسال پیام‌ها در گروه‌ها
bot.on('text', async (ctx) => {
    if (ctx.chat.type !== 'supergroup' && ctx.chat.type !== 'group') return;

    const message = ctx.message.text;
    const replyTo = ctx.message.reply_to_message;

    if (message === 'سلام') {
        ctx.reply('سلام');
    } else if (replyTo && replyTo.from.username === ctx.botInfo.username) {
        try {
            const response = await axios.get(`https://open.wiki-api.ir/apis-1/ReadyAnswer?q=${encodeURIComponent(message)}`);
            if (response.data && response.data.results) {
                ctx.reply(response.data.results, { reply_to_message_id: ctx.message.message_id });
            } else {
                ctx.reply('پاسخی یافت نشد!', { reply_to_message_id: ctx.message.message_id });
            }
        } catch (error) {
            ctx.reply('خطا در دریافت پاسخ از API!', { reply_to_message_id: ctx.message.message_id });
        }
    }
});

bot.launch();
console.log('ربات فعال شد! 🚀');
