<script>

import { pointerMove } from 'ol/events/condition';
import { extend } from 'ol/extent';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import Geolocation from 'ol/Geolocation';
import Point from 'ol/geom/Point';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import Select from 'ol/interaction/Select';
import Snap from 'ol/interaction/Snap';
import { mapGetters, mapActions } from 'vuex';

import { RECEIVE_EVENTS } from '../constants/events';
import { INTERACTIONS } from '../constants/interactions';
import { LAYER_NAMES } from '../constants/layerNames';
import actions from '../store/actions';
import getters from '../store/getters';
import { getFeatureByIds, hasEqualId, getExtraProperties } from '../util/features';
import {
    receiveMessage,
    sendDrawingStarted,
    sendDrawingStopped,
    sendFeature,
    sendSelectingStopped,
    sendLocatingStopped,
    sendLocationModifyStopped,
    sendEditRecord
} from '../util/postMessage';
import { getDefaultHoverStyleFunction, getStyleFunction } from '../util/style';

export default {
    name: 'Embedit',
    data () {
        return {
            currentId: {
                itemId: null,
                columnId: null
            }
        };
    },
    computed: {
        ...mapGetters('Modules/Embedit', Object.keys(getters)),
        ...mapGetters('Maps', [ 'projectionCode', 'getLayerById' ])
    },
    created () {
        if (!this.url) {
            this.showErrorAlert(i18next.t('additional:modules.tools.embedit.errorMsg.config'));
            console.error('Invalid URL. Please check your configuration.');
            this.$store.commit('Menu/switchToPreviousComponent', 'mainMenu');
        }
    },
    async mounted () {
        this.registerListener();
        // initialize layers
        const displayLayer = await this.addNewLayerIfNotExists({ layerName: LAYER_NAMES.DISPLAY_LAYER }),
            highlightLayer = await this.addNewLayerIfNotExists({ layerName: LAYER_NAMES.HIGHLIGHT_LAYER }),
            drawLayer = await this.addNewLayerIfNotExists({ layerName: LAYER_NAMES.DRAW_LAYER });

        // set styles
        displayLayer.setStyle(getStyleFunction(this.defaultStyleId ? this.defaultStyleId : 'default'));
        if (this.highlightStyleId) {
            highlightLayer.setStyle(getStyleFunction(this.highlightStyleId ? this.highlightStyleId : 'default'));
        }
        if (this.drawStyleId) {
            drawLayer.setStyle(getStyleFunction(this.drawStyleId) ? getStyleFunction(this.drawStyleId) : 'default');
        }
        // Handle zIndex
        // Use workaround as "alwaysOnTop" param is not handled correctly
        // in masterportal core v3.3.x
        displayLayer.setZIndex(9999997);
        highlightLayer.setZIndex(9999998);
        drawLayer.setZIndex(9999999);
        // Initialize the snap interaction
        this.initSnapInteraction();
    },
    beforeUnmount () {
        this.resetInteractions();
        this.clearHighlightLayer();
        this.clearDisplayLayer();
        this.resetDrawState();
        this.unregisterListener();
    },
    methods: {
        ...mapActions('Maps', [ 'addNewLayerIfNotExists', 'addInteraction', 'removeInteraction', 'zoomToExtent' ]),
        ...mapActions('Modules/Embedit', Object.keys(actions)),
        ...mapActions('Alerting', [ 'addSingleAlert' ]),
        addFeatureTo (itemId, columnId, geom, extraProperties, layer) {
            const feature = new Feature(new GeoJSON({
                dataProjection: this.projectionCode,
                featureProjection: this.projectionCode
            }).readGeometry(geom));

            feature.set('itemId', itemId);
            feature.set('columnId', columnId);
            // set extra properties if provided
            if (extraProperties) {
                Object.keys(extraProperties).forEach(key => {
                    feature.set(key, extraProperties[key]);
                });
            }
            layer.getSource().addFeature(feature);
        },
        removeFeatureFrom (itemId, columnId, layer) {
            const featureToRemove = getFeatureByIds(itemId, columnId, layer);

            if (featureToRemove) {
                layer.getSource().removeFeature(featureToRemove);
            }
        },
        clearDrawLayer () {
            const drawLayer = this.getLayerById(LAYER_NAMES.DRAW_LAYER);
            if (!drawLayer) {
                return;
            }
            drawLayer.getSource().clear();
        },
        clearHighlightLayer () {
            const highlightLayer = this.getLayerById(LAYER_NAMES.HIGHLIGHT_LAYER);
            if (!highlightLayer) {
                return;
            }
            highlightLayer.getSource().clear();
        },
        clearDisplayLayer () {
            const displayLayer = this.getLayerById(LAYER_NAMES.DISPLAY_LAYER);
            if (!displayLayer) {
                return;
            }
            displayLayer.getSource().clear();
        },
        getInteractionById (id) {
            const map = mapCollection.getMap('2D'),
                interactions = map.getInteractions().getArray(),
                index = interactions.findIndex((interaction) => {
                    return interaction.get('tid') === id;
                });

            if (index > -1) {
                return map.getInteractions().getArray()[index];
            }
            return undefined;
        },
        onSelect (evt) {
            const {
                itemId,
                columnId
            } = this.currentId;

            sendFeature(
                {
                    feature: evt.selected[0],
                    itemId,
                    columnId,
                    projection: this.projectionCode
                },
                this.url,
                window.location.href
            );
        },
        initDrawInteraction (geomType) {
            const drawLayer = this.getLayerById(LAYER_NAMES.DRAW_LAYER);
            if (!drawLayer) {
                return;
            }
            const drawInteraction = new Draw({
                    type: geomType,
                    source: drawLayer.getSource(),
                    style: getStyleFunction(this.drawIndicatorStyleId ? this.drawIndicatorStyleId : 'default')
                });

            drawInteraction.set('tid', INTERACTIONS.draw);
            this.addInteraction(drawInteraction);
            drawInteraction.setActive(false);
            drawInteraction.on('drawend', this.onDrawEnd.bind(this));
            drawInteraction.on('drawstart', this.onDrawStart.bind(this));
        },
        initModifyInteraction (options) {
            const modifyInteraction = new Modify(options);

            modifyInteraction.set('tid', INTERACTIONS.modify);
            this.addInteraction(modifyInteraction);
            modifyInteraction.on('modifyend', this.onModifyEnd);
        },
        initSnapInteraction () {
            const drawLayer = this.getLayerById(LAYER_NAMES.DRAW_LAYER),
                snapInteraction = new Snap({
                    source: drawLayer.getSource()
                });

            snapInteraction.set('tid', INTERACTIONS.snap);
            this.addInteraction(snapInteraction);
            snapInteraction.setActive(false);
        },
        onDrawStart () {
            const drawLayer = this.getLayerById(LAYER_NAMES.DRAW_LAYER);
            if (!drawLayer) {
                return;
            }
            drawLayer.getSource().clear();
        },
        onDrawEnd (evt) {
            const feature = evt.feature,
                drawLayerSource = this.getLayerById(LAYER_NAMES.DRAW_LAYER).getSource(),
                {
                    itemId,
                    columnId
                } = this.currentId;

            drawLayerSource.getFeatures().forEach(f => {
                if (f !== feature) {
                    drawLayerSource.removeFeature(f);
                }
            });

            sendFeature(
                { feature, itemId, columnId, projection: this.projectionCode },
                this.url,
                window.location.href
            );
        },
        onModifyEnd (evt) {
            const feature = evt.features.getArray()[0],
                {
                    itemId,
                    columnId
                } = this.currentId;

            sendFeature(
                { feature, itemId, columnId, projection: this.projectionCode },
                this.url,
                window.location.href
            );
        },
        resetDrawState () {
            this.clearDrawLayer();
            this.currentId = {
                itemId: null,
                columnId: null
            };
        },
        resetInteractions () {
            const {
                itemId,
                columnId
            } = this.currentId;

            // send stop events for running interactions
            if (this.getInteractionById(INTERACTIONS.draw)) {
                this.removeInteraction(this.getInteractionById(INTERACTIONS.draw));
                sendDrawingStopped({ itemId, columnId }, this.url, window.location.href);
            }
            if (this.getInteractionById(INTERACTIONS.modify)) {
                this.removeInteraction(this.getInteractionById(INTERACTIONS.modify));
                sendLocationModifyStopped({ itemId, columnId }, this.url, window.location.href);
            }
            if (this.getInteractionById(INTERACTIONS.select)) {
                this.removeInteraction(this.getInteractionById(INTERACTIONS.select));
                sendSelectingStopped({ itemId, columnId }, this.url, window.location.href);
            }
            if (this.getInteractionById(INTERACTIONS.selectHover)) {
                this.removeInteraction(this.getInteractionById(INTERACTIONS.selectHover));
            }
            if (this.getInteractionById(INTERACTIONS.itemSelect)) {
                this.removeInteraction(this.getInteractionById(INTERACTIONS.itemSelect));
            }
            if (this.getInteractionById(INTERACTIONS.itemSelectHover)) {
                this.removeInteraction(this.getInteractionById(INTERACTIONS.itemSelectHover));
            }
            this.stopInteraction(INTERACTIONS.snap);
        },
        onStartDrawing (payload) {
            const { geom, itemId, columnId, geomType } = payload,
                type = (geom && geom.type) !== undefined ? geom.type : (geomType !== undefined ? geomType : 'Point'),
                drawLayer = this.getLayerById(LAYER_NAMES.DRAW_LAYER),
                highlightLayer = this.getLayerById(LAYER_NAMES.HIGHLIGHT_LAYER);

            this.resetDrawState();

            // Initialize the draw interaction
            this.initDrawInteraction(type);

            if (columnId !== null && columnId !== undefined) {
                this.currentId = {
                    columnId,
                    itemId
                };
                // remove feature from highlight layer
                this.removeFeatureFrom(itemId, columnId, highlightLayer);
                if (geom) {
                    // for start we assume to receive a geojson geometry
                    // TODO check the payload
                    this.addFeatureTo(itemId, columnId, geom, undefined, drawLayer);
                }
            }
            this.startInteraction(INTERACTIONS.draw);
            this.startInteraction(INTERACTIONS.snap);

            this.initModifyInteraction({
                source: drawLayer.getSource()
            });
        },
        onStartHighlighting (payload) {
            this.clearHighlightLayer();
            const drawLayer = this.getLayerById(LAYER_NAMES.DRAW_LAYER),
                highlightLayer = this.getLayerById(LAYER_NAMES.HIGHLIGHT_LAYER),
                currentDrawFeature = drawLayer.getSource().getFeatures()[drawLayer.getSource().getFeatures().length];

            payload.forEach(item => {
                if (currentDrawFeature) {
                    const drawFeatureId = {
                            itemId: currentDrawFeature.get('itemId'),
                            columnId: currentDrawFeature.get('columnId')
                        },
                        featureId = {
                            itemId: item.itemId,
                            columnId: item.columnId
                        };

                    if (hasEqualId(drawFeatureId, featureId)) {
                        return;
                    }
                }
                const extraProperties = getExtraProperties(item) || undefined;
                this.addFeatureTo(item.itemId, item.columnId, item.geom, extraProperties, highlightLayer);
            }, this);
        },
        onDisplayFormData (payload) {
            const displayLayer = this.getLayerById(LAYER_NAMES.DISPLAY_LAYER);

            this.clearDisplayLayer();
            this.clearHighlightLayer();

            payload.forEach(item => {
                const extraProperties = getExtraProperties(item) || undefined;
                this.addFeatureTo(item.itemId, item.columnId, item.geom, extraProperties, displayLayer);
            }, this);
        },
        onStopHighlighting () {
            this.clearHighlightLayer();
        },
        onStartSelecting (payload) {
            const { layerId, itemId, columnId } = payload,
                selectionLayer = this.getLayerById(layerId);

            if (columnId !== null && columnId !== undefined) {
                this.currentId = {
                    itemId,
                    columnId
                };
            }

            if (!selectionLayer) {
                const errorMsg = i18next.t('additional:modules.tools.embedit.errorMsg.selectionLayer', { layerId });

                console.error(errorMsg);
                this.showErrorAlert(errorMsg);
                sendSelectingStopped({ itemId, columnId }, this.url, window.location.href);
                return;
            }

            // create new select interaction with layer filter

            const selectFeatureInteraction = new Select({
                layers: [ selectionLayer ]
            });

            selectFeatureInteraction.set('tid', INTERACTIONS.select);
            // add interaction to map
            this.addInteraction(selectFeatureInteraction);

            // hover selection

            const selectHoverFeatureInteraction = new Select({
                condition: pointerMove,
                layers: [ selectionLayer ],
                style: this.hoverStyleId ? getStyleFunction(this.hoverStyleId) :
                    getDefaultHoverStyleFunction()
            });

            selectHoverFeatureInteraction.set('tid', INTERACTIONS.selectHover);

            this.addInteraction(selectHoverFeatureInteraction);

            // create modify interaction with specific feature collection
            this.initModifyInteraction({
                features: selectFeatureInteraction.getFeatures()
            });

            selectFeatureInteraction.on('select', this.onSelect);
        },
        onStartLocating (payload) {
            const { columnId, itemId } = payload,
                projection = mapCollection.getMap('2D').getView().getProjection(),
                highlightLayer = this.getLayerById(LAYER_NAMES.HIGHLIGHT_LAYER);

            if (columnId !== null && columnId !== undefined) {
                this.currentId = {
                    columnId,
                    itemId
                };
                // remove feature from highlight layer
                this.removeFeatureFrom(itemId, columnId, highlightLayer);
            }

            this.geolocation = new Geolocation({ tracking: true, projection: projection });
            this.geolocation.on('change', this.onChangeLocation);
        },
        onChangeLocation (evt) {
            const position = evt.target.getPosition(),
                feature = new Feature({
                    geometry: new Point(position),
                    name: 'Geolocation Feature'
                }),
                {
                    itemId,
                    columnId
                } = this.currentId;

            sendFeature({
                feature,
                itemId,
                columnId,
                projection: this.projectionCode
            },
            this.url,
            window.location.href
            );
            // unset and geolocation
            this.geolocation.setTracking(false);
            this.geolocation = undefined;
            sendLocatingStopped({ itemId, columnId }, this.url, window.location.href);
        },
        onStartModify (payload) {
            const { geom, columnId, itemId } = payload,
                drawLayer = this.getLayerById(LAYER_NAMES.DRAW_LAYER),
                highlightLayer = this.getLayerById(LAYER_NAMES.HIGHLIGHT_LAYER);

            this.resetDrawState();

            if (columnId !== null && columnId !== undefined) {
                this.currentId = {
                    columnId,
                    itemId
                };
                // remove feature from highlight layer
                this.removeFeatureFrom(itemId, columnId, highlightLayer);
                if (geom) {
                    // for start we assume to receive a geojson geometry
                    this.addFeatureTo(itemId, columnId, geom, undefined, drawLayer);
                }
            }
            this.initModifyInteraction({
                source: drawLayer.getSource()
            });
        },
        zoomToFeature (payload) {
            const features = payload.map(p => new Feature(new GeoJSON({
                    dataProjection: this.projectionCode,
                    featureProjection: this.projectionCode
                }).readGeometry(p.geom))
                ),
                // get extent of all features
                extent = features.map(f => f.getGeometry().getExtent()).reduce(extend);

            this.zoomToExtent({
                extent,
                options: { maxZoom: 8 }
            });
        },
        enableItemSelection () {
            const displayLayer = this.getLayerById(LAYER_NAMES.DISPLAY_LAYER),
                selectFeatureInteraction = new Select({
                    layers: [ displayLayer ]
                }),
                selectHoverFeatureInteraction = new Select({
                    layers: [ displayLayer ],
                    condition: pointerMove,
                    style: this.hoverStyleId ? getStyleFunction(this.hoverStyleId) :
                        getDefaultHoverStyleFunction()
                });

            selectFeatureInteraction.set('tid', INTERACTIONS.itemSelect);
            selectHoverFeatureInteraction.set('tid', INTERACTIONS.itemSelectHover);

            this.addInteraction(selectFeatureInteraction);
            this.addInteraction(selectHoverFeatureInteraction);

            selectFeatureInteraction.on('select', (evt) => {
                const selectedFeature = evt.selected[0],
                    itemId = selectedFeature.get('itemId'),
                    columnId = selectedFeature.get('columnId');

                this.disableItemSelection();
                sendEditRecord({ itemId, columnId }, this.url, window.location.href);
            });
        },
        disableItemSelection () {
            if (this.getInteractionById(INTERACTIONS.itemSelect)) {
                this.removeInteraction(this.getInteractionById(INTERACTIONS.itemSelect));
            }
            if (this.getInteractionById(INTERACTIONS.itemSelectHover)) {
                this.removeInteraction(this.getInteractionById(INTERACTIONS.itemSelectHover));
            }
        },
        eventListener (evt) {
            const message = receiveMessage(this.url, evt, window.location.href),
                evtType = message.data.type,
                evtPayload = message.data.payload;

            switch (evtType) {
                case RECEIVE_EVENTS.startDrawing:
                    this.resetInteractions();
                    this.onStartDrawing(evtPayload);
                    sendDrawingStarted({
                        itemId: evtPayload.itemId,
                        columnId: evtPayload.columnId
                    }, this.url, window.location.href);
                    break;
                case RECEIVE_EVENTS.startLocating:
                    this.resetInteractions();
                    this.onStartLocating(evtPayload);
                    break;
                case RECEIVE_EVENTS.startModify:
                    this.resetInteractions();
                    this.onStartModify(evtPayload);
                    break;
                case RECEIVE_EVENTS.stopModify:
                    this.resetInteractions();
                    this.resetDrawState();
                    break;
                case RECEIVE_EVENTS.startSelecting:
                    this.resetInteractions();
                    this.resetDrawState();
                    this.onStartSelecting(evtPayload);
                    break;
                case RECEIVE_EVENTS.stopDrawing:
                    this.resetInteractions();
                    this.resetDrawState();
                    break;
                case RECEIVE_EVENTS.stopSelecting:
                    this.resetInteractions();
                    this.resetDrawState();
                    break;
                case RECEIVE_EVENTS.startHighlighting:
                    this.onStartHighlighting(evtPayload);
                    break;
                case RECEIVE_EVENTS.stopHighlighting:
                    this.onStopHighlighting();
                    break;
                case RECEIVE_EVENTS.displayFormData:
                    this.onDisplayFormData(evtPayload);
                    break;
                case RECEIVE_EVENTS.clearFormData:
                    this.clearDisplayLayer();
                    break;
                case RECEIVE_EVENTS.zoomToFeature:
                    this.zoomToFeature(evtPayload);
                    break;
                case RECEIVE_EVENTS.enableItemSelection:
                    this.enableItemSelection();
                    break;
                case RECEIVE_EVENTS.disableItemSelection:
                    this.disableItemSelection();
                    break;
                default:
                    break;
            }
        },
        registerListener () {
            window.addEventListener('message', this.eventListener);
        },
        unregisterListener () {
            window.removeEventListener('message', this.eventListener);
        },
        showErrorAlert (msg) {
            const alertError = {
                category: 'error',
                title: 'Embedit',
                content: msg,
                displayClass: 'error',
                multipleAlert: false
            };

            this.addSingleAlert(alertError);
        },
        startInteraction (id) {
            this.getInteractionById(id).setActive(true);
        },
        stopInteraction (id) {
            this.getInteractionById(id).setActive(false);
        }
    }
};

</script>

<template>
  <iframe
    id="embedit-iframe"
    title="Form Edit"
    :src="url"
  />
</template>

<style scoped>
    #embedit-iframe {
        height: 100%;
    }
</style>
