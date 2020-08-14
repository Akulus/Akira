import { readdirSync } from 'fs';
import AkiraClient from './client';
import { join } from 'path';
import commandTypes from '../typings/command';

/**
 * Detects & loads all commands for AkiraClient
 * @param client {AkiraClient}
 * @returns {void}
 */
function handleCommands(client: AkiraClient): void {
    const mainFile: string = join(__dirname, '..', 'commands');

    // Loop process for every found directory
    for (const dir of readdirSync(mainFile)) {
        // Find files in actual directory
        const commandFiles = readdirSync(join(mainFile, dir));

        // Register every found command file
        for (const file of commandFiles) {
            if (file.endsWith('.js')) {
                const command: commandTypes = require(join(mainFile, dir, file)) //eslint-disable-line

                // Define command
                command.name = file.slice(0, -3);
                command.category = dir.toLowerCase();

                // Register new command
                client.commands.set(command.name, command);

                client.log(`Loaded ${join(mainFile, dir, file)}`);
            } else {
                client.log(`Unable to load ${join(mainFile, dir, file)}`, 'warn');
            }
        }
    }

    client.log(`Finished process! Handled ${client.commands.size} command(s).`);
}

export default handleCommands;
