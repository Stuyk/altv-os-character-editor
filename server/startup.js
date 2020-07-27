/// <reference types="@altv/types-server" />
import alt from 'alt-server';

alt.on('character:Edit', handleCharacterEdit);
alt.on('character:Sync', handleCharacterSync);
alt.onClient('character:Done', handleDone);

function handleCharacterEdit(player, oldData = null) {
    if (!player || !player.valid) {
        return;
    }

    alt.emitClient(player, 'character:Edit', oldData);
}

function handleCharacterSync(player, data) {
    if (!player || !player.valid) {
        return;
    }

    alt.emitClient(player, 'character:Sync', data);
}

function handleDone(player, newData) {
    alt.emit('character:Done', player, newData);
}
