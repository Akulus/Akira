import AkiraClient from './utils/client.js';
import pkg from 'dotenv';
pkg.config();

const client = new AkiraClient();

client.launch(process.env.BOT_TOKEN);
