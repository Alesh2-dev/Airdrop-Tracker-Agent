import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export const sendTelegramMessage = async (message: string): Promise<boolean> => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return false;
  }

  try {
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }
    );
    return true;
  } catch (err) {
    console.error('Telegram send failed:', err);
    return false;
  }
};

export const sendNotification = async (message: string): Promise<void> => {
  const telegramSent = await sendTelegramMessage(message);

  if (!telegramSent) {
    // Fallback to console
    console.log('\n🔔 NOTIFICATION');
    console.log('━'.repeat(50));
    console.log(message);
    console.log('━'.repeat(50));
  } else {
    console.log('Telegram notification sent');
  }
};