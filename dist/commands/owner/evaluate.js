"use strict";
const util_1 = require("util");
/**
 * This function makes sure that result can be displayed
 * @param text {unknown}
 * @returns {string}
 */
function sanitize(text) {
    if (typeof text === 'string') {
        return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
    }
    else {
        return String(text);
    }
}
module.exports = {
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
    async execute(client, message, args) {
        if (!args[0])
            return message.channel.send('Provide JavaScript code to run.');
        if (args.join(' ').length > 1000)
            return message.channel.send('Too many arguments! *(Max 1000)*');
        try {
            let evaled = await eval(args.join(' '));
            if (typeof evaled !== 'string') {
                evaled = util_1.inspect(evaled);
            }
            const result = sanitize(evaled);
            if (result.length > 1900) {
                console.log(result);
                return message.channel.send('🛠️ **[SUCCESS]** Your result has been sended into console because it\'s too long to display.');
            }
            if (result || result !== '')
                return message.channel.send(`🛠️ **[SUCCESS]** Result of evaluated code\n\`\`\`js\n${result}\n\`\`\``);
            else
                return message.channel.send('🛠️ **[SUCCESS]** Done.');
        }
        catch (error) {
            return message.channel.send(`🛠️ **[FAIL]** Result of evaluated code \n\`\`\`js\n${sanitize(error)}\n\`\`\``);
        }
    }
};
