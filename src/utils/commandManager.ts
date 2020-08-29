import AkiraClient from './client';
import { Collection, Message } from 'discord.js';
import commandTypes from '../typings/command';
import { readdirSync } from 'fs';
import { join } from 'path';

export default class CommandManager {
    constructor(client: AkiraClient) {
        this.client = client;
    }

    private readonly client: AkiraClient
    private readonly commands = new Collection<string, commandTypes>()

    /**
     * Detects & binds all command files.
     * @returns {TypeError | void}
     */
    registerCommands(): TypeError | void {
        for (const file of readdirSync(join(__dirname, '..', 'commands'))) {
            if (!file.endsWith('.js')) return new TypeError(`[Command Manager] File ${file} have invalid file extension.`);

            const command: commandTypes = require(join(__dirname, "..", "commands", file)) //eslint-disable-line
            command.name = file.slice(0, -3);

            this.commands.set(command.name, command);
        }
        console.log(`[Command Manager] Detected ${this.commands.size} commands.`);
    }

    /**
     * Run basic check for message conditions.
     * @param {Message} [msg]
     * @returns {void}
     */
    async parseMessage(msg: Message): Promise<void> {
        console.log(msg.content);
    }
}
