/// <reference types="@altv/types-client" />
import * as alt from 'alt';
import * as native from 'natives';
import { createPedEditCamera, destroyPedEditCamera, setFov, setZPos } from './camera';

const fModel = alt.hash('mp_f_freemode_01');
const mModel = alt.hash(`mp_m_freemode_01`);
const url = `http://resource/client/html/index.html`;
let view;
let oldData = {};
let prevData = {};
let tempData = {};
let readyInterval;

native.requestModel(fModel);
native.requestModel(mModel);

alt.onServer('character:Edit', handleEdit);
alt.onServer('character:Sync', handleSync);
alt.onServer(`character:FinishSync`, handleFinishSync);

function handleEdit(_oldData) {
    oldData = _oldData;

    if (!view) {
        view = new alt.WebView(url);
        view.on('character:ReadyDone', handleReadyDone);
        view.on('character:Done', handleDone);
        view.on('character:Cancel', handleCancel);
        view.on('character:Sync', handleSync);
    }

    view.focus();
    showCursor(true);
    createPedEditCamera();
    setFov(50);
    setZPos(0.6);
    native.freezeEntityPosition(alt.Player.local.scriptID, true);
    readyInterval = alt.setInterval(waitForReady, 100);
}

function closeView() {
    if (view && view.destroy) {
        view.destroy();
    }

    oldData = null;
    view = null;
    showCursor(false);
    native.freezeEntityPosition(alt.Player.local.scriptID, false);
    destroyPedEditCamera();
}

function handleDone(newData) {
    alt.emitServer('character:Done', JSON.stringify(newData));
    closeView();
}

function handleCancel() {
    alt.emitServer('character:Done', JSON.stringify(oldData));
    closeView();
}

function waitForReady() {
    if (!view) {
        return;
    }

    view.emit('character:Ready');
}

function handleReadyDone() {
    if (readyInterval !== undefined || readyInterval !== null) {
        alt.clearInterval(readyInterval);
        readyInterval = null;
    }

    view.emit('character:SetData', oldData);
}

function showCursor(state) {
    try {
        alt.showCursor(state);
    } catch (err) {
        return;
    }
}

function handleFinishSync() {
    native.setPedHeadBlendData(alt.Player.local.scriptID, 0, 0, 0, 0, 0, 0, 0, 0, 0, false);
    native.setPedHeadBlendData(
        alt.Player.local.scriptID,
        tempData.faceFather,
        tempData.faceMother,
        0,
        tempData.skinFather,
        tempData.skinMother,
        0,
        parseFloat(tempData.faceMix),
        parseFloat(tempData.skinMix),
        0,
        false
    );

    // Facial Features
    for (let i = 0; i < tempData.structure.length; i++) {
        const value = tempData.structure[i];
        native.setPedFaceFeature(alt.Player.local.scriptID, i, value);
    }

    // Overlay Features - NO COLORS
    for (let i = 0; i < tempData.opacityOverlays.length; i++) {
        const overlay = tempData.opacityOverlays[i];
        native.setPedHeadOverlay(alt.Player.local.scriptID, overlay.id, overlay.value, parseFloat(overlay.opacity));
    }

    // Hair
    const collection = native.getHashKey(tempData.hairOverlay.collection);
    const overlay = native.getHashKey(tempData.hairOverlay.overlay);
    native.addPedDecorationFromHashes(alt.Player.local.scriptID, collection, overlay);
    native.setPedComponentVariation(alt.Player.local.scriptID, 2, tempData.hair, 0, 0);
    native.setPedHairColor(alt.Player.local.scriptID, tempData.hairColor1, tempData.hairColor2);

    // Facial Hair
    native.setPedHeadOverlay(alt.Player.local.scriptID, 1, tempData.facialHair, tempData.facialHairOpacity);
    native.setPedHeadOverlayColor(alt.Player.local.scriptID, 1, 1, tempData.facialHairColor1, tempData.facialHairColor1);

    // Eyebrows
    native.setPedHeadOverlay(alt.Player.local.scriptID, 2, tempData.eyebrows, 1);
    native.setPedHeadOverlayColor(alt.Player.local.scriptID, 2, 1, tempData.eyebrowsColor1, tempData.eyebrowsColor1);

    // Decor
    for (let i = 0; i < tempData.colorOverlays.length; i++) {
        const overlay = tempData.colorOverlays[i];
        const color2 = overlay.color2 ? overlay.color2 : overlay.color1;
        native.setPedHeadOverlay(alt.Player.local.scriptID, overlay.id, overlay.value, parseFloat(overlay.opacity));
        native.setPedHeadOverlayColor(alt.Player.local.scriptID, overlay.id, 1, overlay.color1, color2);
    }

    // Eyes
    native.setPedEyeColor(alt.Player.local.scriptID, tempData.eyes);

    if (tempData.sex === 0) {
        native.setPedComponentVariation(alt.Player.local.scriptID, 3, 15, 0, 0); // arms
        native.setPedComponentVariation(alt.Player.local.scriptID, 4, 14, 0, 0); // pants
        native.setPedComponentVariation(alt.Player.local.scriptID, 6, 35, 0, 0); // shoes
        native.setPedComponentVariation(alt.Player.local.scriptID, 8, 15, 0, 0); // shirt
        native.setPedComponentVariation(alt.Player.local.scriptID, 11, 15, 0, 0); // torso
    } else {
        native.setPedComponentVariation(alt.Player.local.scriptID, 3, 15, 0, 0); // arms
        native.setPedComponentVariation(alt.Player.local.scriptID, 4, 14, 0, 0); // pants
        native.setPedComponentVariation(alt.Player.local.scriptID, 6, 34, 0, 0); // shoes
        native.setPedComponentVariation(alt.Player.local.scriptID, 8, 15, 0, 0); // shirt
        native.setPedComponentVariation(alt.Player.local.scriptID, 11, 91, 0, 0); // torso
    }

    prevData = tempData;
}

async function handleSync(data) {
    tempData = data;

    native.clearPedBloodDamage(alt.Player.local.scriptID);
    native.clearPedDecorations(alt.Player.local.scriptID);
    native.setPedHeadBlendData(alt.Player.local.scriptID, 0, 0, 0, 0, 0, 0, 0, 0, 0, false);

    const modelNeeded = data.sex === 0 ? fModel : mModel;
    if (modelNeeded !== native.getEntityModel(alt.Player.local.scriptID)) { // native.getEntityModel can be replaced with alt.Player.local.model in later updates.
        alt.emitServer(`character:AwaitModel`, data.sex);
    } else {
        handleFinishSync();
    }
}
