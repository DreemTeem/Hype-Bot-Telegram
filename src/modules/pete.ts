import * as TelegramBot from 'node-telegram-bot-api';

export class RatQuotes {
    private HBot: TelegramBot;
    private quoteSource = {
        nounOne: [
            'shape',
            'fabric',
            'integrity',
            'honor',
            'value',
            'health',
            'power',
            'potency',
            'influence',
            'agency',
            'determination',
            'strength',
        ],
        nounTwo: [
            'resolve',
            'constitution',
            'democracy',
            'foundations',
            'hopes',
            'lives',
            'republic',
            'dreams',
            'possibilities',
            'direction',
            'values',
            'union',
            'togetherness',
            'ambitions',
            'strengths',
            'passion',
            'pragmatism',
            'character',
            'identity',
            'freedom',
            'positivity',
            'nation',
            'families',
            'spririt',
            'valor',
            'libert',
        ],
        verbOne: [
            'dependent on',
            'embiggened by',
            'further bolstered by',
            'resonantly expanded by',
            'constantly informed by',
            'forever defined by',
            'relies on',
        ],
        nounThree: [
            'actions',
            'experience',
            'future',
            'coalition',
            'fellowship',
            'unity',
            'character',
            'actions',
            'experience',
            'future',
            'coalition',
            'fellowship',
            'unity',
            'character',
            'actions',
            'experience',
            'future',
            'coalition',
            'fellowship',
            'unity',
            'character',
            'bread prices',
        ],
    };

    constructor(botReference: TelegramBot) {
        this.HBot = botReference;
        this.getPeteQuote();
    }

    private getPeteQuote() {
        this.HBot.onText(/^\/mayopete/gi, (msg, match) => {
            this.HBot.sendMessage(msg.chat.id, this.genPeteQuote(), { parse_mode: 'HTML' });
        });
    }

    private genPeteQuote() {
        const { nounOne, nounTwo, nounThree, verbOne } = this.quoteSource;
        const giveRand = (maxLen: number) => {
            return Math.floor(Math.random() * Math.floor(maxLen));
        };

        const finalString = `The ${nounOne[giveRand(nounOne.length)]} of our ${nounTwo[giveRand(nounTwo.length)]} is ${verbOne[giveRand(verbOne.length)]} our ${nounThree[giveRand(nounThree.length)]}.`;
        return finalString;
    }
}
