/**
 * Embedit addon state definition
 * @typedef {Object} EmbeditAddonState
 * @property {String} defaultStyleId The default style ID
 * @property {String} drawIndicatorStyleId The style ID for draw indicator
 * @property {String} drawStyleId The style ID for drawing
 * @property {String} highlightStyleId The style ID for highlighting
 * @property {String} hoverStyleId The style ID for hover effect
 * @property {String} icon Icon next to title
 * @property {String} id ID of the viewer component
 * @property {String} name Displayed as title
 * @property {String[]} styleId List of all style IDs that are used by the addon
 * @property {String[]} supportedMapModes Supported map modes
 * @property {String} url The URL of the form iframe
 */

const state = {
    defaultStyleId: undefined,
    drawIndicatorStyleId: undefined,
    drawStyleId: undefined,
    highlightStyleId: undefined,
    hoverStyleId: undefined,
    icon: 'bi-pencil-square',
    id: 'embedit',
    name: 'additional:modules.tools.embedit.name',
    styleId: undefined,
    supportedMapModes: [ '2D' ],
    url: undefined
};

export default state;
