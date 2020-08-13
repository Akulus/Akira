import AkiraClient from '../../services/client';
import { Message } from 'eris';

export = {
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
    async execute(client: AkiraClient, message: Message, args: string[]): Promise<void> {
        client.createMessage(message.channel.id, `Memory usage: ${(process.memoryUsage().heapUsed / 1048576).toFixed(1)}MB`);
    }
}
