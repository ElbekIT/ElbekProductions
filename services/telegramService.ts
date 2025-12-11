
import { OrderFormState } from '../types';

const BOT_TOKEN = '8157679512:AAF_0ubDzox0tyD0qsfwkAdqvCUYoHxLkDA';
const CHAT_ID = '7714287797';

export const sendOrderToTelegram = async (order: OrderFormState): Promise<boolean> => {
  const designLabels: Record<string, string> = {
    preview: '🖼 YouTube Preview',
    banner: '🚩 Kanal Banneri',
    avatar: '👤 Avatarka',
    logo: '🎨 Logotip'
  };

  const gameLabels: Record<string, string> = {
    pubg: '🔫 PUBG Mobile',
    minecraft: '⛏ Minecraft',
    csgo: '🎯 CS:GO / CS2',
    vlog: '📹 Vlog / Lifestyle',
    gta: '🚔 GTA V',
    valorant: '💠 Valorant',
    freefire: '🔥 Free Fire',
    roblox: '🟥 Roblox',
    fifa: '⚽️ EA FC (FIFA)',
    cod: '🪖 Call of Duty',
    dota: '⚔️ Dota 2',
    standoff: '🔫 Standoff 2',
    other: '🎲 Boshqa'
  };

  const message = `
<b>💎 YANGI BEPUL BUYURTMA</b>
➖➖➖➖➖➖➖➖
👤 <b>Mijoz:</b> <a href="https://t.me/${order.telegramUsername.replace('@', '')}">${order.firstName} ${order.lastName}</a>
📧 <b>Email:</b> ${order.email || 'Kiritilmagan'}
📱 <b>Tel:</b> ${order.phone}
🌐 <b>Username:</b> @${order.telegramUsername.replace('@', '')}
➖➖➖➖➖➖➖➖
🎮 <b>O'yin:</b> ${gameLabels[order.selectedGame]}
🛠 <b>Xizmat:</b> ${designLabels[order.selectedDesign]}
💰 <b>Narxi:</b> BEPUL (0 so'm)
➖➖➖➖➖➖➖➖
📝 <b>Izoh:</b>
<i>${order.comment}</i>
`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    return data.ok;
  } catch (error) {
    console.error('Telegram send error:', error);
    return false;
  }
};

// NEW: Send OTP Verification Code
export const sendVerificationCodeToTelegram = async (userTelegramId: string, code: string): Promise<{ success: boolean; error?: string }> => {
  const message = `
<b>🔐 ELBEK PRODUCTIONS TASDIQLASH</b>
➖➖➖➖➖➖➖➖
Sizning tasdiqlash kodingiz:
<code>${code}</code>

⚠️ Bu kodni hech kimga bermang.
`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: userTelegramId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    
    if (!data.ok) {
        if (data.description?.includes('chat not found')) {
            return { success: false, error: 'bot_not_started' };
        }
        return { success: false, error: data.description };
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'network_error' };
  }
};
