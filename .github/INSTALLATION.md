<h1 align="center">Installation process</h1>

Follow below steps to install & run Akira on your computer. Below tutorial was made for total newbies.

### 🛠️ **Requirements**
- [Node.js](https://nodejs.org/en/) *~14.8.0*
- [FFmpeg](https://ffmpeg.org/)
- [Python](https://www.python.org/) ~3.8.5

⚠️ Node.js can download python & other required tools if you install all addiditonal elements during installation.

### 📦 **Installation**
0. Download all needed programs from higher requirements tab.
1. Download latest stable version of Akira - *[Go to releases](https://github.com/Znudzony/Akira/releases/)*.
2. Unzip package to any folder & open it.
3. Open console & type `npm install` to download & install all required dependencies.
4. Rename `.env.example` file to `.env` and fill it with below scheme:
- Don't even try to steal any of these ID's - they are here only as example.
- To set more than 1 owner - add `,` between member ID's like I did below.
```env
BOT_TOKEN=Njc4MzQqMzM4NTA0MzY3MDv0.XkhYmg.ZY_D9S7Ug-GxbbdLidbjBf5JXj7
CLIENT_ID=678341338504364074
OWNERS=390394829789593601, 215553356452724747
DEFAULT_PLAYLIST_TAG=AMS
DEFAULT_VOLUME=35
```
> If you don't have your own bot yet - [Create one](https://discord.com/developers/applications) <br />

5. Open console inside bot files and type `npm run start` command to launch bot.
6. Add bot to your server and make sure that it have enough permissions before you go to step 5.
- Example invitation: `https://discord.com/oauth2/authorize?client_id=BOT_CLIENT_ID&scope=bot&permissions=0` <br /> *(remember to fill client ID)*
7. Configure bot so it will be able to join and start streaming music to your voice channel. *('a!' is a default prefix)* <br />
    7.1 Type `a!config channel <voice channel ID>` to bind bot to selected voice channel. <br />
    7.2 After setting channel, you can enable stream by typing `a!config radio enable`. <br />
      - If bot does not join automatically - you can always trigger bot manually by typing `a!reconnect`. <br /> <br />
8. Done! At this point bot should successfuly stream music selected from your `songs.json` file. <br /> <br />

> *Tip: You can change default bot prefix - `a!config prefix <new prefix>`*
