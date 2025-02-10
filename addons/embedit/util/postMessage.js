import GeoJSON from "ol/format/GeoJSON";

import {SEND_EVENTS} from "../constants/events";

/**
 * Sends a message to the form iframe.
 * @param {Object} content The message content.
 * @param {String} url The url of the form iframe.
 * @param {String} fallbackUrl The url to use if the originUrl is invalid (e.g. relative url).
 * @return {void}
 */
function sendMessage (content, url, fallbackUrl) {
    const iframe = document.getElementById("embedit-iframe");

    if (!iframe) {
        // eslint-disable-next-line no-console
        console.log("Failed to post message. Cannot find target iframe element.");
        return;
    }

    let urlInst;

    try {
        urlInst = new URL(url);
    }
    catch {
        urlInst = new URL(fallbackUrl);
    }

    iframe.contentWindow.postMessage(content, urlInst.origin);
}

/**
 * Send the endDrawing message
 * @param {Object} param0 The content.
 * @param {Object} param0.feature The feature to send.
 * @param {String} param0.id The id of the feature.
 * @param {String} param0.projection The epsg code of the feature.
 * @param {String} url The url of the form iframe.
 * @param {String} fallbackUrl The url to use if the originUrl is invalid (e.g. relative url).
 * @return {void}
 */
export function sendFeature ({feature, itemId, columnId, projection}, url, fallbackUrl) {
    const format = new GeoJSON({
            dataProjection: projection,
            featureProjection: projection
        }),
        content = {
            type: SEND_EVENTS.sendFeature,
            payload: {
                itemId,
                columnId,
                geom: format.writeFeatureObject(feature)
            }
        };

    sendMessage(content, url, fallbackUrl);
}

/**
 * Send the selectingStopped message
 * @param {Object} payload The payload to send.
 * @param {String} payload.itemId The id of the item.
 * @param {String} payload.columnId The id of the column.
 * @param {String} url The url of the form iframe.
 * @param {String} fallbackUrl The url to use if the originUrl is invalid (e.g. relative url).
 * @return {void}
 */
export function sendSelectingStopped (payload, url, fallbackUrl) {
    sendMessage({
        type: SEND_EVENTS.selectingStopped,
        payload
    }, url, fallbackUrl);
}

/**
 * Send the drawingStopped message
 * @param {Object} payload The payload to send.
 * @param {String} payload.itemId The id of the item.
 * @param {String} payload.columnId The id of the column.
 * @param {String} url The url to the form iframe.
 * @param {String} fallbackUrl The url to use if the originUrl is invalid (e.g. relative url).
 * @return {void}
 */
export function sendDrawingStopped (payload, url, fallbackUrl) {
    sendMessage({
        type: SEND_EVENTS.drawingStopped,
        payload
    }, url, fallbackUrl);
}

/**
 * Send the drawingStarted message
 * @param {Object} payload The payload to send.
 * @param {String} payload.itemId The id of the item.
 * @param {String} payload.columnId The id of the column.
 * @param {String} url The url to the form iframe.
 * @param {String} fallbackUrl The url to use if the originUrl is invalid (e.g. relative url).
 * @return {void}
 */
export function sendDrawingStarted (payload, url, fallbackUrl) {
    sendMessage({
        type: SEND_EVENTS.drawingStarted,
        payload
    }, url, fallbackUrl);
}

/**
 * Receive a message.
 * @param {String} originUrl The url of the iframe.
 * @param {MessageEvent} message The message.
 * @param {String} fallbackUrl The url to use if the originUrl is invalid (e.g. relative url).
 * @returns {MessageEvent|undefined} The message or undefined.
 */
export function receiveMessage (originUrl, message, fallbackUrl) {
    let urlInst;

    try {
        urlInst = new URL(originUrl);
    }
    catch {
        urlInst = new URL(fallbackUrl);
    }

    if (message.origin !== urlInst.origin) {
        return undefined;
    }

    return message;
}

/**
 * Send the selectingStopped message
 * @param {Object} payload The payload to send.
 * @param {String} payload.itemId The id of the item.
 * @param {String} payload.columnId The id of the column.
 * @param {String} url The url of the form iframe.
 * @param {String} fallbackUrl The url to use if the originUrl is invalid (e.g. relative url).
 * @return {void}
 */
export function sendLocatingStopped (payload, url, fallbackUrl) {
    sendMessage({
        type: SEND_EVENTS.locatingStopped,
        payload
    }, url, fallbackUrl);
}
/**
 * Send the locationModifyStopped message
 * @param {Object} payload The payload to send.
 * @param {String} payload.itemId The id of the item.
 * @param {String} payload.columnId The id of the column.
 * @param {String} url The url of the form iframe.
 * @param {String} fallbackUrl The url to use if the originUrl is invalid (e.g. relative url).
 * @return {void}
 */
export function sendLocationModifyStopped (payload, url, fallbackUrl) {
    sendMessage({
        type: SEND_EVENTS.locationModifyStopped,
        payload
    }, url, fallbackUrl);
}

/**
 * Send the editRecord message
 * @param {Object} payload The payload to send.
 * @param {String} payload.itemId The id of the item.
 * @param {String} payload.columnId The id of the column.
 * @param {String} url The url of the form iframe.
 * @param {String} fallbackUrl The url to use if the originUrl is invalid (e.g. relative url).
 * @return {void}
 */
export function sendEditRecord (payload, url, fallbackUrl) {
    sendMessage({
        type: SEND_EVENTS.editRecord,
        payload
    }, url, fallbackUrl);
}
