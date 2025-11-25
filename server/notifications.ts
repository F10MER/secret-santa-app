import { Bot } from 'grammy';

export interface NotificationService {
  sendGiftReservedNotification(telegramId: number, itemTitle: string, reservedBy: string): Promise<void>;
  sendEventInviteNotification(telegramId: number, eventName: string, inviterName: string, inviteLink: string): Promise<void>;
  sendDrawCompletedNotification(telegramId: number, eventName: string, receiverName: string): Promise<void>;
  sendDeadlineReminderNotification(telegramId: number, eventName: string, daysLeft: number): Promise<void>;
}

export function createNotificationService(bot: Bot): NotificationService {
  return {
    async sendGiftReservedNotification(telegramId: number, itemTitle: string, reservedBy: string) {
      try {
        await bot.api.sendMessage(
          telegramId,
          `🎁 <b>Подарок зарезервирован!</b>\n\n` +
          `Пользователь <b>${reservedBy}</b> зарезервировал ваш подарок:\n` +
          `"${itemTitle}"\n\n` +
          `Скоро вы получите свой подарок! 🎉`,
          { parse_mode: 'HTML' }
        );
      } catch (error) {
        console.error('[Notifications] Failed to send gift reserved notification:', error);
      }
    },

    async sendEventInviteNotification(telegramId: number, eventName: string, inviterName: string, inviteLink: string) {
      try {
        await bot.api.sendMessage(
          telegramId,
          `🎄 <b>Приглашение в Secret Santa!</b>\n\n` +
          `<b>${inviterName}</b> приглашает вас участвовать в событии:\n` +
          `"${eventName}"\n\n` +
          `Присоединяйтесь по ссылке: ${inviteLink}`,
          { parse_mode: 'HTML' }
        );
      } catch (error) {
        console.error('[Notifications] Failed to send event invite notification:', error);
      }
    },

    async sendDrawCompletedNotification(telegramId: number, eventName: string, receiverName: string) {
      try {
        await bot.api.sendMessage(
          telegramId,
          `🎅 <b>Жеребьевка завершена!</b>\n\n` +
          `Событие: "${eventName}"\n\n` +
          `Вы дарите подарок: <b>${receiverName}</b>\n\n` +
          `Откройте приложение чтобы увидеть wishlist получателя! 🎁`,
          { parse_mode: 'HTML' }
        );
      } catch (error) {
        console.error('[Notifications] Failed to send draw completed notification:', error);
      }
    },

    async sendDeadlineReminderNotification(telegramId: number, eventName: string, daysLeft: number) {
      try {
        await bot.api.sendMessage(
          telegramId,
          `⏰ <b>Напоминание!</b>\n\n` +
          `До события "${eventName}" осталось <b>${daysLeft} ${daysLeft === 1 ? 'день' : 'дней'}</b>!\n\n` +
          `Не забудьте подготовить подарок! 🎁`,
          { parse_mode: 'HTML' }
        );
      } catch (error) {
        console.error('[Notifications] Failed to send deadline reminder:', error);
      }
    },
  };
}
