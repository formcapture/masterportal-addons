export const getFeatureByIds = (itemId, columnId, layer) => {
    return layer.getSource().getFeatures().filter(
        (feature) => feature.get('itemId') === itemId && feature.get('columnId') === columnId
    );
};

export const hasEqualId = (id1, id2) => {
    return id1.itemId === id2.itemId && id1.columnId === id2.columnId;
};
