<h1 align="center">Akira あきら</h1>
<h3 align="center">Your new music bot focused around music stations</h3>
<p align="center">
  <img alt="GitHub all releases" src="https://img.shields.io/github/downloads/Razzels0/Akira/total?logo=GitHub">
  <img alt="GitHub repo size" src="https://img.shields.io/github/repo-size/Razzels0/Akira">
  <img alt="GitHub license" src="https://img.shields.io/github/license/Razzels0/Akira?logo=Apache%20Spark&logoColor=white">
  <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/Razzels0/Akira?logo=TypeScript">
  <img alt="Discord main library" src="https://img.shields.io/badge/Library-Discord.js-blue?logo=Discord&logoColor=white">
</p>

---

> Akira is probably the best music discord bot focused in 100% at to become radio station. Just fill .json file with your favourite songs and bot will automatically download songs and play them randomly. Commands has been reduced to minimum because Akira can do all hard stuff automatically for you - just show her where should join and she will join and surprise you with music quality.

# 👋 Getting started
1. Install all required programs & prepare bot files. [Click here to get more info.]
2. Rename `.env.example` file to `.env` and fill it with below scheme:
- Don't even try to steal any of these ID's - they are here only as example.
- To set more than 1 owner - add `,` between member ID's like I did below.
```env
BOT_TOKEN=Njc4MzQqMzM4NTA0MzY3MDv0.XkhYmg.ZY_D9S7Ug-GxbbdLidbjBf5JXj7
CLIENT_ID=678341338504364074
OWNERS=390394829789593601, 215553356452724747
```
> If you don't have your own bot yet - [Create one](https://discord.com/developers/applications) <br />

3. Open console inside bot files and type `npm run start` command to launch bot.
- If you got any error - that means you make something bad during installation process or one of your data inside `.env` file is invalid.
4. Add bot to your server and make sure that it have enough permissions before you go to step 5.
- Example invitation: `https://discord.com/oauth2/authorize?client_id=BOT_CLIENT_ID&scope=bot&permissions=0` <br /> *(remember to fill client ID)*
5. Configure bot so it will be able to join and start streaming music to your voice channel. *('a!' is a default prefix)* <br />
    5.1 Type `a!config channel <voice channel ID>` to bind bot to selected voice channel. <br />
    5.2 After setting channel, you can enable stream by typing `a!config radio enable`. <br />
      - If bot does not join automatically - you can always trigger bot manually by typing `a!reconnect`. <br /> <br />
6. Done! At this point bot should successfuly stream music selected from your `songs.json` file. <br /> <br />

# 📖 Other
1. [Installation process.](xxx.com)

<br /> <br />

## 🤝 Contributing
1. [Fork the repository.](https://github.com/Razzels0/Akira/fork)
2. Clone your fork. `git clone https://github.com/your-username/Akira.git`
3. Create your feature branch. `git checkout -b my-new-feature`
4. Commit your changes. `git commit -am 'Add some feature'`
5. Push to the branch. `git push origin my-new-feature`
6. Submit a pull request

## 👤 Author
**Akira** © [Razzels](https://github.com/Razzels0) <br />
Authored and maintained by Razzels. <br />
> Github [@Razzels0](https://github.com/Razzels0) <br />
> Discord `Razzels#8039`
