import { Client, VoiceBroadcast, BroadcastDispatcher } from 'discord.js';
import station from './station.json';
import ytdl from 'ytdl-core';

const client = new Client();

const broadcast = client.voice.createBroadcast();

client.on('message', async (msg) => {
    if (!['390394829789593601', '215553356452724747'].includes(msg.author.id)) return;

    await msg.member.voice.channel.join().then((connection) => {
        connection.play(broadcast);
    });

    if (msg.content === 'memory') {
        setInterval(function () {
            console.log(
                `The script uses approximately ${Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100}MB - ${
                    broadcast.subscribers.length
                } channels`
            );
        }, 10 * 1000);
    }
});

async function streamRandom(broadcast: VoiceBroadcast): Promise<void> {
    const randomizer: number = Math.floor(Math.random() * station.length);
    console.log(randomizer);

    const player: BroadcastDispatcher = broadcast.play(ytdl(station[randomizer].url, { highWaterMark: 25 << 50, liveBuffer: 75000 }), { highWaterMark: 1 });

    player.on('error', (error) => {
        console.log(error);
        player.removeAllListeners();
        return streamRandom(broadcast);
    });

    player.on('finish', () => {
        return streamRandom(broadcast);
    });
}

client.login('Njc4MzQxMzM4NTA0MzY0MDc0.XkhYmg.o2lnqy0QMXT20yvDMCzaXOXvP4g').then(() => streamRandom(broadcast));
