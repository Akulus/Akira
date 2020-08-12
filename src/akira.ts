import 'dotenv/config';
import { Message } from 'eris';
import validateConfig from './services/test/dotenv-config';
import AkiraClient from './services/client';
import validateMessage from './services/commandParser'

// Run test to see if .env file is valid
;async () => await validateConfig();

// Initialize client
const client = new AkiraClient();

// Message event catcher
client.on('messageCreate', (message: Message) => validateMessage(client, message));

// Link start
client.init();
