// Events that can be received by the embedit addon
export const RECEIVE_EVENTS = {
        /**
         * Creates a layer and starts a draw interaction.
         * Expects a geojson geometry, a column name and the geometry type as payload.
         */
        startDrawing: 'embedit/startDrawing',
        /**
         * Clear features from draw layer and removes interaction.
         */
        stopDrawing: 'embedit/stopDrawing',
        /**
         * Add features to the highlight layer.
         * Expects a list of objects containing a geojson geometry
         * and the respective column name as payload.
         */
        startHighlighting: 'embedit/startHighlighting',
        /**
         * Clear features from highlight layer.
         */
        stopHighlighting: 'embedit/stopHighlighting',
        /**
         * Starts a geolocation.
         */
        startLocating: 'embedit/startLocating',
        /**
         * Starts a modify interaction of a given geometry.
         */
        startModify: 'embedit/startModify',
        /**
         * Stops a modify interaction of a given geometry.
         */
        stopModify: 'embedit/stopModify',
        /**
         * Update the features in the highlight layer with the given data.
         * Replaces existing feature with the same column name or adds new feature.
         */
        updateHighlightingWith: 'embedit/updateHighlightingWith',
        /**
         * Creates selection interaction with a specific layer filter.
         */
        startSelecting: 'embedit/startSelecting',
        /**
         * Removes the selection interaction from map.
         */
        stopSelecting: 'embedit/stopSelecting',
        /**
         * Add features to the displayFormData layer.
         * Expects a list of objects containing a geojson geometry
         * and the respective column name as payload.
         */
        displayFormData: 'embedit/displayFormData',
        /**
         * Clears all features of the displayFormData layer.
         */
        clearFormData: 'embedit/clearFormData',
        /**
         * Zooms to extent of given features.
         * Expects a list of objects containing a geojson geometry
         */
        zoomToFeature: 'embedit/zoomToFeature',
        /**
         * Enables item selection on the map.
         */
        enableItemSelection: 'embedit/enableItemSelection',
        /**
         * Disables item selection on the map.
         */
        disableItemSelection: 'embedit/disableItemSelection'
    },

    // Events that will be sent by the embedit addon
    SEND_EVENTS = {
        /**
         * Triggered when the draw interaction started.
         * Sends the column name for which the drawing is started.
         */
        drawingStarted: 'embedit/drawingStarted',
        /**
         * Triggered when the draw interaction was stopped.
         */
        drawingStopped: 'embedit/drawingStopped',
        /**
         * Triggered when the select interaction was stopped.
         */
        selectingStopped: 'embedit/selectingStopped',
        /**
         * Triggered when the user selects or draws a feature.
         * Sends the selected feature.
         */
        sendFeature: 'embedit/sendFeature',
        /**
         * Triggered when the geolocating has stopped.
         */
        locatingStopped: 'embedit/locatingStopped',
        /**
         * Triggered when the modify location has stopped.
         */
        locationModifyStopped: 'embedit/locationModifyStopped',
        editRecord: 'embedit/editRecord'
    };
