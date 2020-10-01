<h1 align="center">How to create new, custom playlist</h1>

Follow below steps if u want to create your own playlist.

### 💽 **Creation process**
1. Open playlists folder => `Akira/bot/playlists/`.
2. Create new .json file. File name should be the same as playlist TAG to make it simpler.
3. Open `your_new_playlist.json` and copy & paste below schema:
```json
{
    "title": "Full playlist title",
    "tag": "AAA",
    "author": "Playlist's author(s)",
    "songs": [
        {
            "title": "First song",
            "author": "A - man",
            "url": "https://www.youtube.com/watch?v=sjnUdKFUkvI"
        },
        {
            "title": "Second song",
            "author": "B - woman",
            "url": "https://www.youtube.com/watch?v=-G8oXE3Q_dc"
        }
    ]
}
```
> You should already see the schemat. Just put inside `songs` array a new song object. Playlist needs at least **10** songs, but doesn't have top limit.
<br />
4. That's basically it. Put as much songs as you love to & save file. Next modify start playlist TAG inside your `.env` file and run bot.