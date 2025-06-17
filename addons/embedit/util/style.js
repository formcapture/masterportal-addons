import createStyle from '@masterportal/masterportalapi/src/vectorStyle/createStyle';
import styleList from '@masterportal/masterportalapi/src/vectorStyle/styleList';

export function getStyleFunction(styleId) {
    return (ft) => {
        const styleObject = styleList.returnStyleObject(styleId);
        return createStyle.createStyle(styleObject, ft);
    }
}

export function getDefaultHoverStyleFunction() {
    return (ft) => {
        // get geom type and return default style
        const geomType = ft.getGeometry().getType();
        let styleId;
        switch (geomType) {
            case 'Polygon':
                styleId = 'defaultHighlightFeaturesPolygon';
                break;
            case 'LineString':
                styleId = 'defaultHighlightFeaturesLine';
                break;
            case 'Point':
                styleId = 'defaultHighlightFeaturesPoint';
                break;
            default:
                styleId = 'defaultHighlightFeaturesPolygon';
                break;
        }
        const styleObject = styleList.returnStyleObject(styleId);
        return createStyle.createStyle(styleObject, ft);
    }
}
