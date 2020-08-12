"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("dotenv/config");
const dotenv_config_1 = tslib_1.__importDefault(require("./services/test/dotenv-config"));
const client_1 = tslib_1.__importDefault(require("./services/client"));
const commandParser_1 = tslib_1.__importDefault(require("./services/commandParser"));
async () => await dotenv_config_1.default();
// Initialize client
const client = new client_1.default();
// Message event catcher
client.on('messageCreate', (message) => commandParser_1.default(client, message));
// Link start
client.init();
