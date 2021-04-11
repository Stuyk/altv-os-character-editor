![](https://i.imgur.com/CEZRYfS.jpeg)

# Open Source - Character Editor - alt:V

[❤️ Become a Sponsor of my Open Source Work](https://github.com/sponsors/Stuyk/)

[⌨️ Learn how to script for alt:V](https://altv.stuyk.com/)

⭐ This repository if you found it useful!

---

# Description

This script allows a player to be sent to a character editor screen. Where they may customize their facial appearances.

Includes presets, makeup, hairstyles, face customization for all features, and overlays.

Also includes the ability to export character code and import it.

**Note:** This is not a clothing editor.

## Installing Dependencies / Installation

**I cannot stress this enough. Ensure you have NodeJS 13+ or you will have problems.**

-   [NodeJS 13+](https://nodejs.org/en/download/current/)
-   An Existing or New Gamemode
-   General Scripting Knowledge

After simply add the name of this resource to your `server.cfg` resource section.

`altv-os-character-editor`

Then simply clone this repository into your main server resources folder.

```
cd resources
git clone https://github.com/Stuyk/altv-os-character-editor
```

Ensure your `package.json` includes this property:

```json
"type": "module"
```

## Usage

Generally speaking what you want to do with this resource is up to you.
However, there's a few rules and endpoints you need to use to sync players.

**New Character Steps**

1. Show the editor to the player.
2. Player finishes.
3. Store the data sent up to server.
4. Resynchronize the player's face from the server using `character:Sync`
5. Done.

**Existing Character Steps**

1. Pull Data from Database Somewhere
2. Send through `character:Sync`
3. Done.

### Synchronization of Player Data

When a player creates their character you will get data similar to this:

```js
{
    sex: 1,
    faceFather: 44,
    faceMother: 38,
    skinFather: 16,
    skinMother: 23,
    faceMix: 0.5,
    skinMix: 0.1,
    ...
}
```

What you want to do with this data is store it somewhere.
When they rejoin your server you need to take this data and feed it through an alt event.

```js
const someData = {
    sex: 1,
    faceFather: 44,
    faceMother: 38,
    skinFather: 16,
    skinMother: 23,
    faceMix: 0.5,
    skinMix: 0.1,
    ...
}

alt.emit('character:Sync', player, someData);
```

### Toggle Character Editor

The character editor will take whatever location that the player is in currently and use it for their customization pivot point.

All you need to do is call an event with the character's old data if present.

```js
alt.emit('character:Edit', player);

// OR

alt.emit('character:Edit', player, some_Data_Goes_Here);
```

### Completion of Character Editing

After completing their edit the data will be sent up to the server.

Use the data to resync the player.

Store the data or do whatever you want with it.

```js
alt.on('character:Done', (player, data) => {
    alt.emit('character:Sync', player, data);
    player.pos = player.pos; // This is used to prevent interior bugs. May require a small delay.
    console.log(data);
});
```
