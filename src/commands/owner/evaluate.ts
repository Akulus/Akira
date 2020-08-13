import AkiraClient from '../../services/client';
import { Message } from 'eris';
import { inspect } from 'util';

export = {
    description: 'Evaluates command on fly.',
    syntax: '<JavaScript code>',
    examples: ['1+2', 'Math.random() + Math.floor(1.442)'],
    aliases: ['eval', 'e'],
    permissionLevel: 3,
    cooldown: 0,

    /**
     * Main, logic element of the command.
     * @param client {AkiraClient}
     * @param message {Message}
     * @param args {string[]}
     * @returns {Promise<void>}
     */
    async execute(client: AkiraClient, message: Message, args: string[]): Promise<void | Message> {
        if (!args[0]) return message.channel.createMessage('Provide JavaScript code to run.');
        if (args.join(' ').length > 1000) return message.channel.createMessage('Too many arguments! *(Max 1000)*');

        try {
            let evaled: string | unknown = await eval(args.join(' '));

            if (typeof evaled !== 'string') {
                evaled = inspect(evaled);
            }

            const result: string = sanitize(evaled);
            if (result.length > 1900) {
                console.log(result);
                return message.channel.createMessage('🛠️ **[SUCCESS]** Your result has been sended into console because it\'s too long to display.');
            }

            if (result || result !== '') return message.channel.createMessage(`🛠️ **[SUCCESS]** Result of evaluated code\n\`\`\`js\n${result}\n\`\`\``);
            else return message.channel.createMessage('🛠️ **[SUCCESS]** Done.');
        } catch (error) {
            return message.channel.createMessage(`🛠️ **[FAIL]** Result of evaluated code \n\`\`\`js\n${sanitize(error)}\n\`\`\``);
        }
    }
}

/**
 * This function makes sure that result can be displayed
 * @param text {unknown}
 * @returns {string}
 */
function sanitize(text: string | unknown): string {
    if (typeof text === 'string') {
        return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
    } else {
        return String(text);
    }
}
