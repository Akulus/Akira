"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
/**
 * Detects & loads all commands for AkiraClient
 * @param client {AkiraClient}
 * @returns {void}
 */
function handleCommands(client) {
    const mainFile = path_1.join(__dirname, '..', 'commands');
    // Loop process for every found directory
    for (const dir of fs_1.readdirSync(mainFile)) {
        // Find files in actual directory
        const commandFiles = fs_1.readdirSync(path_1.join(mainFile, dir));
        // Register every found command file
        for (const file of commandFiles) {
            if (file.endsWith('.js')) {
                const command = require(path_1.join(mainFile, dir, file)); //eslint-disable-line
                // Define command
                command.name = file.slice(0, -3);
                command.category = dir.toLowerCase();
                // Register new command
                client.commands.set(command.name, command);
                command.aliases.forEach((alias) => client.aliases.set(alias, command.name));
                client.log(`Loaded ${path_1.join(mainFile, dir, file)}`);
            }
            else {
                client.log(`Unable to load ${path_1.join(mainFile, dir, file)}`, 'warn');
            }
        }
    }
    client.log(`Finished process! Handled ${client.commands.size} command(s).`);
}
exports.default = handleCommands;
