import AkiraClient from './utils/client.js';
import pkg from 'dotenv';
pkg.config();

const client = new AkiraClient();

client.launch(process.env.BOT_TOKEN);

setInterval(function () {
    console.log(`${Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100}MB`);
}, 10 * 1000);
