import {
  GoogleGenerativeAI,
  GenerativeModel,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

import TelegramBot = require("node-telegram-bot-api");

export class HypeAI {
  private HBot: TelegramBot;
  private genAI: GoogleGenerativeAI;
  private aiModel: GenerativeModel;

  constructor(botReference: TelegramBot, token: string) {
    this.HBot = botReference;
    this.genAI = new GoogleGenerativeAI(token);

    // const safetySettings = [
    //   {
    //     category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    //     threshold: HarmBlockThreshold.BLOCK_NONE,
    //   },
    //   {
    //     category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    //     threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    //   },
    //
    //   {
    //     category: HarmCategory.HARM_CATEGORY_UNSPECIFIED,
    //     threshold: HarmBlockThreshold.BLOCK_NONE,
    //   },
    //
    //   {
    //     category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    //     threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    //   },
    //   {
    //     category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    //     threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    //   },
    // ];

    this.aiModel = this.genAI.getGenerativeModel({
      model: "gemini-pro",
      // safetySettings: safetySettings,
    });

    this.hypeAiRespond();
  }

  private hypeAiRespond() {
    this.HBot.onText(/^\/ask (.+)/gi, (msg, match) => {
      if (Boolean(match[1].trim()) && match[1].trim().length > 10) {
        this.handleAiPrompt(match[1])
          .then((aiRes) => {
            this.HBot.sendMessage(msg.chat.id, aiRes, {
              parse_mode: "Markdown",
            });
          })
          .catch((er) => {
            console.error({
              log: "[ERROR]: HB ASK MODULE ERROR",
              error: er,
            });
            this.HBot.sendMessage(
              msg.chat.id,
              "whoops, my brain is out of order",
              {
                parse_mode: "HTML",
              }
            );
          });
      } else {
        this.HBot.sendMessage(
          msg.chat.id,
          "you gotta give me an actual prompt ¯\\_(ツ)_/¯",
          {
            parse_mode: "HTML",
          }
        );
      }
    });
  }

  private handleAiPrompt = async (prompt: string) => {
    const result = await this.aiModel.generateContent(prompt);
    // NOTE: Just following the google instructions here
    const response = await result.response;
    return response.text();
  };
}
