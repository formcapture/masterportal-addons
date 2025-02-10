import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";

export function getStyleFunction(styleId) {
    return (ft) => {
        const styleObject = styleList.returnStyleObject(styleId);
        const style = createStyle.createStyle(styleObject, ft);

        return style;
    }
}

export function getDefaultHoverStyleFunction() {
    return (ft) => {
        // get geom type and return default style
        const geomType = ft.getGeometry().getType();
        let styleId;
        switch (geomType) {
            case "Polygon":
                styleId = "defaultHighlightFeaturesPolygon";
                break;
            case "LineString":
                styleId = "defaultHighlightFeaturesLine";
                break;
            case "Point":
                styleId = "defaultHighlightFeaturesPoint";
                break;
            default:
                styleId = "defaultHighlightFeaturesPolygon";
                break;
        }
        const styleObject = styleList.returnStyleObject(styleId);
        const style = createStyle.createStyle(styleObject, ft);

        return style;
    }
}
