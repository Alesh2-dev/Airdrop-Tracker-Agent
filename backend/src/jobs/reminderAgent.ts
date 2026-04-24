import cron from 'node-cron';
import { getUpcomingDeadlines } from '../services/airdropService';
import { sendNotification } from '../services/notificationService';

const formatDeadline = (deadline: Date): string => {
  const now = new Date();
  const diff = new Date(deadline).getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours < 1) return `⚠️ ${minutes} minutes`;
  if (hours < 24) return `⏰ ${hours}h ${minutes}m`;
  return `📅 ${Math.floor(hours / 24)} days`;
};

const runReminderCheck = async (): Promise<void> => {
  console.log(`[Agent] Running deadline check at ${new Date().toLocaleTimeString()}`);

  try {
    // Check airdrops expiring within 24 hours
    const upcoming = await getUpcomingDeadlines(24);

    if (upcoming.length === 0) {
      console.log('[Agent] No upcoming deadlines in the next 24 hours.');
      return;
    }

    for (const airdrop of upcoming) {
      const remaining = airdrop.total_tasks - airdrop.completed_tasks;
      const timeLeft = formatDeadline(airdrop.deadline);

      let urgency = '';
      const hoursLeft = (new Date(airdrop.deadline).getTime() - Date.now()) / (1000 * 60 * 60);

      if (hoursLeft < 1) urgency = '🚨 URGENT';
      else if (hoursLeft < 6) urgency = '⚠️ SOON';
      else urgency = '📢 REMINDER';

      const message =
        `${urgency} — *${airdrop.name}* deadline approaching!\n\n` +
        `⏳ Time left: ${timeLeft}\n` +
        `✅ Tasks: ${airdrop.completed_tasks}/${airdrop.total_tasks} done\n` +
        (remaining > 0
          ? `❌ ${remaining} task(s) still incomplete!\n`
          : `🎉 All tasks complete — you're ready!\n`) +
        `\n🔗 ${airdrop.link || 'No link provided'}`;

      await sendNotification(message);
    }
  } catch (err) {
    console.error('[Agent] Error during reminder check:', err);
  }
};

export const startReminderAgent = (): void => {
  console.log('🤖 Reminder Agent started — checking every minute...');

  // Run immediately on start
  runReminderCheck();

  // Then run every minute
  cron.schedule('* * * * *', runReminderCheck);
};

// Allow manual trigger via API
export { runReminderCheck };