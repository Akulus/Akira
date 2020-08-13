"use strict";
module.exports = {
    description: 'Shows basic memory usage.',
    aliases: ['mem', 'ram'],
    permissionLevel: 0,
    cooldown: 1.5,
    /**
     * Main, logic element of the command.
     * @param client {AkiraClient}
     * @param message {Message}
     * @param args {string[]}
     * @returns {Promise<void>}
     */
    async execute(client, message, args) {
        client.createMessage(message.channel.id, `Memory usage: ${(process.memoryUsage().heapUsed / 1048576).toFixed(1)}MB`);
    }
};
