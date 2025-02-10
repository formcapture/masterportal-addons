# Masterportal Addon embedit

Purpose: Embed a form to manage data.

## Installation
1. Copy this folder to `masterportal/addons`.
2. If the Addon has a `package.json` be sure to install the dependencies.
3. Add the Addon to `addonsConf.json`:
    ```
    "embedit": {
      "vue": true,
      "type": "tool"
    }
    ```
4. Add the addon to your `config.js`:
   ```
   addons: ["embedit"]
   ```

5. Configure your Addon in `config.json` witihin a section of `mainMenu` or `secondaryMenu`:
   ```
          {
            "type": "embedit",
            "url": "http://my.url"
          },
   ```

Please check the configuration chapter below for detailed instructions.

6. Deactivate the GetFeatureInfo tool while using this addon to avoid conflicting interactions, e.g. while selecting features for a form input.

## Configuration

While it is not mandatory to set the different `styleIds`, it is though highly recommended in order to better distinguish the different phases of displaying and editing.

| Name | Required | Type | Default / Fallback | Description |
|---|---|---|---|---|
| url | yes | string | - | URL to form. e.g. /form-backend/app/?view=table&formId=trinkwasserbrunnen |
| defaultStyleId | no | string | „default“ | The styleId in your style.json that is used to display form data |
| highlightStyleId | no | string | „default“ | The styleId in your style.json that is used to highlight form data |
| drawStyleId | no | string | „default“ | The styleId in your style.json that is used for drawn features |
| drawIndicatorStyleId | no | string | „default“ | The styleId in your style.json that is used while drawing features |
| hoverStyleId | no | string | "defaultHighlightFeaturesPoint" / "defaultHighlightFeaturesPolygon" / "defaultHighlighLine" | The styleId in your style.json that is used for hovering features (when selecting geometries) |
| styleId | no | string[] | [] | All styleIds are are referenced in the above parameters MUST be added to an array here (Masterportal core logic) |

### Example

```
  {
    "type": "embedit",
    "url": "/form-backend/app/?view=table&formId=kompensationsflaechen",
    "defaultStyleId": "default-blue",
    "highlightStyleId": "highlight",
    "drawStyleId": "draw",
    "drawIndicatorStyleId": "drawIndicator",
    "hoverStyleId": "hover"
    "styleId": ["default-blue", "highlight", "draw", "hover", "drawIndicator"]
  }
```

## Language/Translation

1. The language files can be found under ./addons/{addon-name}/locales/{language}/additional.json.

2. A translation is implemented this way:

    `i18next.t("additional:modules.tools.example.title"),` , see more Examples[https://bitbucket.org/geowerkstatt-hamburg/addons/src/dev_vue/populationRequest/locales/de/additional.json]
