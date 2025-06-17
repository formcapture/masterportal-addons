/**
 * User type definition
 * @typedef {Object} EmbeditAddonState
 * @property {String} id id of the viewer component
 * @property {String} name displayed as title (config-param)
 * @property {String} icon icon next to title (config-param)
 * @property {Boolean} deactivateGFI flag if tool should deactivate gfi (config-param)
 * @property {String[]} supportedMapModes supported map modes
 * @property {String} url The url of the form iframe
 */

const state = {
    defaultStyleId: "",
    drawIndicatorStyleId: "",
    drawStyleId: "",
    highlightStyleId: "",
    hoverStyleId: "",
    icon: "bi-pencil-square",
    id: "embedit",
    name: "additional:modules.tools.embedit.name",
    styleId: [],
    supportedMapModes: ["2D"],
    url: ""
};

export default state;
