import TelegramBot = require('node-telegram-bot-api');
import { hypeResponses } from '../helpers/hype-responses';

export class TextResponses {
  private HBot: TelegramBot;

  constructor(botReference: TelegramBot) {
    this.HBot = botReference;
    this.setBasicHypeResponses();
    this.setBasicTextCommands();
    this.setVolcelResponse();
  }

  private setVolcelResponse(): void {
    this.HBot.onText(/^\/volcel/i, (msg: any, match: any): void => {
      const VOLCEL_POLICE_IMG = 'https://i.imgur.com/P5UMuVz.jpg';
      const volcelResponse =
        `🚨 WARNING WARNING 🚨 \n\n` +
        `😫 THIS CHAT HAS BECOME TOO THIRSTY 😫 \n\n` +
        `💦 PLEASE KEEP YOUR VITAL ESSENCES TO YOURSELVES AT ALL TIMES 💦`;
      this.HBot.sendPhoto(msg.chat.id, VOLCEL_POLICE_IMG, { caption: volcelResponse });
    });
  }

  private setBasicHypeResponses(): void {
    this.HBot.onText(/h+y+p+e+/i, (msg: any, match: any): void => {
      this.HBot.sendMessage(msg.chat.id, hypeResponses[Math.floor(Math.random() * hypeResponses.length)]);
    });
  }

  private setBasicTextCommands(): void {
    this.HBot.onText(/^\/shrug/i, (msg: any, match: any): void => {
      this.HBot.sendMessage(msg.chat.id, '¯\\_(ツ)_/¯');
    });

    this.HBot.onText(/(russia|russian|dotka|vodka)/gi, (msg, match) => {
      this.HBot.sendMessage(msg.chat.id, 'REALLL SOVIETTTT DAAAAAMAAAAAAAAAGGGGGEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE');
    });
  }
}
