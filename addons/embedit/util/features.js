export const getFeatureByIds = (itemId, columnId, layer) => {
    return layer.getSource().getFeatures().filter(
        (feature) => feature.get('itemId') === itemId && feature.get('columnId') === columnId
    );
};

export const hasEqualId = (id1, id2) => {
    return id1.itemId === id2.itemId && id1.columnId === id2.columnId;
};

export const getExtraProperties = (item) => {
    const exclude = new Set(["itemId", "columnId", "id", "geom"]);
    return Object.fromEntries(
        Object.entries(item).filter(([key]) => !exclude.has(key))
    );
};
