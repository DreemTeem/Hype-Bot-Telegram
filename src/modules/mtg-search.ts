import * as TelegramBot from 'node-telegram-bot-api';
import { Card, Cards } from 'scryfall-sdk';

export class MTGSearch {
  private HBot: TelegramBot;

  constructor(botReference: TelegramBot) {
    this.HBot = botReference;
    this.setMTGCommandParser();
  }

  /**
   * Basic setup function to enable our parser to call the search function
   */
  private setMTGCommandParser(): void {
    this.HBot.onText(/^\/mtg/i, (msg: any, match: any): void => {
      const commandArray: string[] = msg.text.split(' ');
      if (commandArray.length === 1) {
        // TODO - Possibly integrate with native help commands?
        this.showMissingQuery(msg);
      } else {
        const fullQueryString: string = commandArray.splice(1, commandArray.length).join(' ');
        const queryObject: any = this.parseQueryString(fullQueryString);
        if (queryObject.flags && queryObject.flags.random) {
          this.getRandomMTGCard(msg);
        } else {
          this.getMTGCards(msg, queryObject.queryString, queryObject.flags);
        }
      }
    });
  }

  /**
   * Wrapper function to tell the user that they didn't provide a search query.
   * @param msg - The initial message sent to the bot. It allows us to send a message back.
   */
  private showMissingQuery(msg: any): void {
    this.HBot.sendMessage(msg.chat.id, `Please provide something for me to search for. Try your favorite card name!`);
  }

  /**
   * Function designed to take in the full query from a user and parse out
   * any and all applicable flags to use to trigger other searches or refine
   * the generic card search.
   * @param fullQueryString - Full query string including search params and flags.
   */
  private parseQueryString(fullQueryString: string): any {
    const indexOfFirstFlag: number = fullQueryString.indexOf(' -');
    // TODO: During flag integtaion- If other flags can be executed without a query before them, find a more robust solution to add them here.
    if (indexOfFirstFlag === -1 && fullQueryString.trim() !== '-r') {
      return {
        queryString: fullQueryString,
      };
    }
    // TODO: Fill out the following flags section with other appropriate flags.
    return {
      flags: {
        random: fullQueryString.indexOf(' -r') >= 0 || fullQueryString.trim() === '-r',
      },
      queryString: fullQueryString.slice(0, indexOfFirstFlag),
    };
  }

  /**
   * Helper function to send the user a random mtg card. This card will be any combination
   * of available API parameters meaning it likely won't be in English.
   * @param msg - The initial message sent to the bot. It allows us to send a message back.
   */
  private getRandomMTGCard(msg: any): void {
    Cards.random().then(
      (card: Card) => {
        const priceCaption: string = card.usd ? `USD Price: $${card.usd}` : null;
        this.HBot.sendPhoto(msg.chat.id, `${card.image_uris.normal}`, { caption: priceCaption });
      },
      (error: any) => {
        // This is for any unhandled errors that we're not expecting.
        this.HBot.sendMessage(msg.chat.id, `${error.response.body.details}`);
      },
    );
  }

  /**
   * Function to fetch MTG card data based on user inputs. If too many or no cards are found,
   * it will let the user know or provide steps for refining their search query.
   * @param msg - The initial message sent to the bot. It allows us to send a message back.
   * @param queryString - The custom query that was provided by the user.
   * @param params - Optional parameter that contains flags to refine the card search.
   */
  private getMTGCards(msg: any, queryString: string, params?: any): void {
    this.HBot.sendMessage(msg.chat.id, `<b>Fetching MTG card results for "${queryString}"</b>\n`, { parse_mode: 'HTML', disable_web_page_preview: true });
    const cardResults: Card[] = [];
    // TODO: Work on flushing out the params provided by the parseQueryString function. Start with sets.
    Cards.search(queryString + ' order:released')
      // Called each time the API finds a card
      .on('data', (card: Card) => {
        cardResults.push(card);
      })
      // Called if the API encounters an error.
      .on('error', (error: any) => {
        // The 'error' object has the following keys: ['name', 'statusCode', 'message', 'error', 'options', 'response']
        // Default API error message from Scryfall can be used at error.response.body.details
        if (error.statusCode === 404) {
          // We use a custom message here because the help link in the orignal message refers to dead link
          this.HBot.sendMessage(msg.chat.id, `Sorry, your search query didn't match any cards. Please try refining your query or removing excess words.`);
        } else {
          // This is for any unhandled errors that we're not expecting.
          this.HBot.sendMessage(msg.chat.id, `${error.response.body.details}`);
        }
      })
      // Called once the API says there are no more cards left for us to get.
      .on('end', () => {
        if (cardResults.length === 1) {
          // If there's only one card, we send the info/image directly.
          this.sendSingleCardResult(msg, cardResults[0]);
        } else {
          const cardMatchFromName: Card = cardResults.find((card) => card.name.toLowerCase() === queryString.toLowerCase());
          if (cardMatchFromName) {
            this.sendSingleCardResult(msg, cardMatchFromName);
          } else {
            // If there are multiple cards, we provide up to the top 5 results and ask the user to refine.
            this.sendMultipleCardResults(msg, cardResults);
          }
        }
      });
  }

  private sendSingleCardResult(msg: any, card: Card): void {
    const priceCaption: string = card.usd ? `USD Price: $${card.usd}` : null;
    this.HBot.sendPhoto(msg.chat.id, `${card.image_uris.normal}`, { caption: priceCaption });
  }

  private sendMultipleCardResults(msg: any, cards: Card[]): void {
    const message: string = `Multiple cards found (${cards.length}). Did you mean one of the following? If not, try refining or changing your query.\n`;
    const maxResultNumber = 5 > cards.length ? cards.length : 5;
    const keyboardCards: TelegramBot.KeyboardButton[][] = [];
    for (let i = 0; i < maxResultNumber; i += 1) {
      const card: Card = cards[i];
      keyboardCards.push([{ text: card.name + ' - ' + card.type_line }]);
      // message += `\t\t\t* ${card.name} <i>(${card.type_line})</i>\n`;
    }
    this.HBot.sendMessage(msg.chat.id, message, {
      reply_markup: {
        keyboard: keyboardCards,
        one_time_keyboard: true,
        selective: true,
      },
      reply_to_message_id: msg.message_id,
    });
  }

}
