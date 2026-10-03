import { useEffect, useMemo, useRef } from "react";

import benchesData from "@/data/benches.json";
import buildingsData from "@/data/buildings.json";
import campusBoundary from "@/data/campusBoundary";
import locationsData from "@/data/locations.json";
import mapFeaturesData from "@/data/mapFeatures.json";
import type { CurrentMapLocation, SelectedMapFeature } from "./OSMMap";

type OSMMapProps = {
  selectedFeatureId?: string;
  selectedFeatureType?: string;
  selectedCategory?: string;
  hiddenFeatureKeys?: string[];
  featureOverrides?: SelectedMapFeature[];
  openSelectedPopup?: boolean;
  currentLocation?: CurrentMapLocation;
  currentLocationFocusRequest?: number;
  onFeaturePress?: (feature: SelectedMapFeature) => void;
  onMapReady?: () => void;
};

const mapBearing = 232;

export default function OSMMap({
  selectedFeatureId,
  selectedFeatureType,
  selectedCategory,
  hiddenFeatureKeys = [],
  featureOverrides = [],
  openSelectedPopup = true,
  currentLocation,
  currentLocationFocusRequest = 0,
  onFeaturePress,
  onMapReady,
}: OSMMapProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastCurrentLocationFocusRequest = useRef(currentLocationFocusRequest);

  const boundaryCoordinates = campusBoundary
    .map((point) => `[${point.latitude}, ${point.longitude}]`)
    .join(",");

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const message = event.data as {
        event?: string;
        feature?: SelectedMapFeature;
      };

      if (message.event === "feature-selected" && message.feature) {
        onFeaturePress?.(message.feature);
      }

      if (message.event === "map-ready") {
        onMapReady?.();
      }
    }

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [onFeaturePress, onMapReady]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        event: "set-current-location",
        location: currentLocation,
      },
      "*",
    );
  }, [currentLocation]);

  useEffect(() => {
    if (
      !currentLocation ||
      currentLocationFocusRequest === 0 ||
      currentLocationFocusRequest === lastCurrentLocationFocusRequest.current
    ) {
      return;
    }

    lastCurrentLocationFocusRequest.current = currentLocationFocusRequest;

    iframeRef.current?.contentWindow?.postMessage(
      {
        event: "focus-current-location",
        location: currentLocation,
      },
      "*",
    );
  }, [currentLocation, currentLocationFocusRequest]);

  const html = useMemo(
    () => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />

        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />

        <style>
          html,
          body,
          #map {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
          }

          body,
          #map {
            background: #9fc985;
          }

          .leaflet-tile-pane {
            opacity: 0.12;
            filter: saturate(0.55) contrast(0.85) brightness(1.12);
          }

          .leaflet-overlay-pane svg path {
            vector-effect: non-scaling-stroke;
          }

          .campus-building-shape {
            filter: drop-shadow(0 4px 3px rgba(71, 35, 41, 0.26));
          }

          .campus-location-shape {
            filter: drop-shadow(0 2px 2px rgba(63, 58, 44, 0.16));
          }

          .campus-map-label {
            background: #ffffff;
            border: 1px solid rgba(99, 35, 48, 0.08);
            border-radius: 4px;
            box-shadow: 0 3px 8px rgba(51, 39, 32, 0.18);
            color: #652234;
            font-size: 9px;
            font-weight: 800;
            line-height: 1.1;
            max-width: 96px;
            padding: 4px 7px;
            text-align: center;
            white-space: normal;
          }

          .campus-room-label {
            color: #3f3326;
            font-size: 8px;
            max-width: 88px;
            padding: 3px 6px;
          }

          .leaflet-tooltip.campus-map-label::before {
            display: none;
          }

          .campus-gate-marker,
          .campus-current-location-marker {
            align-items: center;
            display: flex;
            justify-content: center;
          }

          .campus-pin {
            background: #2f8f57;
            border: 2px solid #ffffff;
            border-radius: 50% 50% 50% 0;
            box-shadow: 0 2px 6px rgba(31, 61, 38, 0.32);
            height: 18px;
            transform: rotate(-45deg);
            width: 18px;
          }

          .campus-pin::after {
            background: #ffffff;
            border-radius: 50%;
            content: "";
            height: 6px;
            left: 4px;
            position: absolute;
            top: 4px;
            width: 6px;
          }

          .campus-pin.gate {
            background: #d85c32;
          }

          .campus-pin.category {
            background: #ef1f2f;
            height: 28px;
            width: 28px;
          }

          .campus-category-marker {
            align-items: center;
            display: flex;
            justify-content: center;
            overflow: visible;
            pointer-events: auto;
            z-index: 9000 !important;
          }

          .campus-selected-marker {
            height: 74px;
            position: relative;
            transform: translateY(-8px);
            width: 74px;
          }

          .campus-selected-marker::before,
          .campus-selected-marker::after,
          .campus-selected-marker .pulse-ring {
            animation: campus-marker-pulse 1.9s ease-out infinite;
            background: rgba(239, 31, 47, 0.2);
            border-radius: 50%;
            content: "";
            height: 54px;
            left: 10px;
            position: absolute;
            top: 8px;
            width: 54px;
          }

          .campus-selected-marker::after {
            animation-delay: 0.45s;
          }

          .campus-selected-marker .pulse-ring {
            animation-delay: 0.9s;
          }

          .campus-selected-marker .pin-wrap {
            animation: campus-marker-bounce 1.05s ease-in-out infinite;
            height: 52px;
            left: 11px;
            position: absolute;
            top: 0;
            transform-origin: 50% 100%;
            width: 52px;
            z-index: 2;
          }

          .campus-selected-marker .pin-shadow {
            animation: campus-marker-shadow 1.05s ease-in-out infinite;
            background: rgba(92, 12, 20, 0.28);
            border-radius: 50%;
            bottom: 5px;
            filter: blur(2px);
            height: 8px;
            left: 22px;
            position: absolute;
            width: 30px;
            z-index: 1;
          }

          .campus-selected-marker .pin-body {
            background: linear-gradient(145deg, #ff463f 0%, #dc1128 58%, #a70d1d 100%);
            border: 3px solid #ffffff;
            border-radius: 50% 50% 50% 0;
            box-shadow:
              0 10px 16px rgba(88, 12, 20, 0.34),
              inset -5px -6px 9px rgba(120, 6, 17, 0.28),
              inset 5px 5px 10px rgba(255, 125, 112, 0.42);
            height: 38px;
            left: 7px;
            position: absolute;
            top: 4px;
            transform: rotate(-45deg);
            width: 38px;
          }

          .campus-selected-marker .pin-body::after {
            background: #ffffff;
            border-radius: 50%;
            box-shadow: inset 0 1px 3px rgba(92, 12, 20, 0.16);
            content: "";
            height: 13px;
            left: 10px;
            position: absolute;
            top: 10px;
            width: 13px;
          }

          @keyframes campus-marker-pulse {
            0% {
              opacity: 0.55;
              transform: scale(0.55);
            }

            72% {
              opacity: 0.04;
              transform: scale(1.45);
            }

            100% {
              opacity: 0;
              transform: scale(1.65);
            }
          }

          @keyframes campus-marker-bounce {
            0%,
            100% {
              transform: translateY(0) scale(1);
            }

            50% {
              transform: translateY(-8px) scale(1.03);
            }
          }

          @keyframes campus-marker-shadow {
            0%,
            100% {
              opacity: 0.3;
              transform: scale(1);
            }

            50% {
              opacity: 0.16;
              transform: scale(0.72);
            }
          }
        </style>
      </head>

      <body>
        <div id="map"></div>

        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script src="https://unpkg.com/leaflet-rotate@0.2.8/dist/leaflet-rotate-src.js"></script>

        <script>
          const map = L.map("map", {
            rotate: true,
            bearing: ${mapBearing},
            touchRotate: false,
            rotateControl: false,
            zoomControl: false,
            maxBoundsViscosity: 0.25
          }).setView(
            [7.4259, 125.7939],
            18
          );

          map.createPane("selected-marker-pane");
          map.getPane("selected-marker-pane").style.zIndex = 760;

          function smoothFocusBounds(bounds, options) {
            const focusOptions = Object.assign(
              {
                animate: true,
                duration: 1.25,
                easeLinearity: 0.18
              },
              options || {}
            );

            if (map.flyToBounds) {
              map.flyToBounds(bounds, focusOptions);
              return;
            }

            map.fitBounds(bounds, focusOptions);
          }

          function smoothFocusCenter(center, zoom) {
            const focusOptions = {
              animate: true,
              duration: 0.75,
              easeLinearity: 0.25
            };

            if (map.flyTo) {
              map.flyTo(center, zoom, focusOptions);
              return;
            }

            map.setView(center, zoom, focusOptions);
          }

          L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
              maxZoom: 22,
              opacity: 0.4,
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
          ).addTo(map);

          const gateIcon = L.divIcon({
            className: "campus-gate-marker",
            html: '<div class="campus-pin gate"></div>',
            iconSize: [24, 24],
            iconAnchor: [12, 22]
          });

          L.marker([
            7.4263413,
            125.7934517
          ], {
            icon: gateIcon
          })
            .addTo(map)
            .bindPopup("School Gate");

          const campusBoundary = [
            ${boundaryCoordinates}
          ];

          const campusBounds =
            L.latLngBounds(campusBoundary);
          const paddedCampusBounds =
            campusBounds.pad(0.75);

          L.polygon(
            campusBoundary,
            {
              color: "#f4f1df",
              weight: 5,
              fillColor:"#a8d18f",
              fillOpacity: 1
            }
          )
            .addTo(map)
            .bindPopup("School Campus");

          const buildingCollection =
            ${JSON.stringify(buildingsData)};

          const locationCollection =
            ${JSON.stringify(locationsData)};

          const mapFeatureCollection =
            ${JSON.stringify(mapFeaturesData)};

          const benchCollection =
            ${JSON.stringify(benchesData)};
          
          const selectedFeatureId =
            ${JSON.stringify(selectedFeatureId ?? null)};

          const selectedFeatureType =
            ${JSON.stringify(selectedFeatureType ?? null)};

          const selectedCategory =
            ${JSON.stringify(selectedCategory ?? null)};

          const openSelectedPopup =
            ${JSON.stringify(openSelectedPopup)};

          const hiddenFeatureKeys =
            new Set(${JSON.stringify(hiddenFeatureKeys)});

          const featureOverrides =
            new Map(
              ${JSON.stringify(featureOverrides)}.map(function (feature) {
                return [
                  String(feature.type || "") + "-" + String(feature.id || ""),
                  feature
                ];
              })
            );

          const selectedFeatureKey =
            selectedFeatureId && selectedFeatureType
              ? selectedFeatureType + "-" + selectedFeatureId
              : null;

          const featureLayers = {};
          const categoryFeatureBounds = [];
          const roomLabelLayers = [];
          const roomLabelMinZoom = 20;
          let activeFeatureKey = selectedFeatureKey;
          let pendingSelectedMarker = null;

          function getFeatureKey(feature) {
            const properties = feature.properties || {};

            return properties.type && properties.id
              ? properties.type + "-" + properties.id
              : null;
          }

          function getAdminFeatureKey(properties) {
            return properties.type && properties.id
              ? properties.type + ":" + properties.id
              : null;
          }

          function getMergedProperties(feature) {
            const properties = feature.properties || {};
            const featureKey = getFeatureKey(feature);
            const override = featureKey
              ? featureOverrides.get(featureKey)
              : null;

            return override
              ? Object.assign({}, properties, override)
              : properties;
          }

          function isHiddenFeature(feature) {
            const featureKey = getFeatureKey(feature);
            const adminFeatureKey = getAdminFeatureKey(
              feature.properties || {}
            );

            return Boolean(
              (featureKey && hiddenFeatureKeys.has(featureKey)) ||
              (adminFeatureKey && hiddenFeatureKeys.has(adminFeatureKey))
            );
          }

          const buildingStyle = {
            color: "#f6e8d6",
            className: "campus-building-shape",
            weight: 3,
            fillColor: "#a91f3f",
            fillOpacity: 0.96
          };

          const roomPalette = {
            classroom: "#7CC7E8",
            laboratory: "#5FD0B5",
            office: "#F2B84B",
            library: "#A78BFA",
            restroom: "#67E8F9",
            food: "#F97373",
            facility: "#22C55E",
            restricted: "#EF6B6B",
            hallway: "#E5E7EB"
          };

          function getLocationFillColor(feature) {
            const properties = getMergedProperties(feature);
            const name = String(properties.name || "").toLowerCase();
            const category = String(properties.category || "").toLowerCase();
            const type = String(properties.type || "").toLowerCase();

            if (
              name === "cr" ||
              name.includes("restroom") ||
              name.includes("comfort room")
            ) {
              return roomPalette.restroom;
            }

            if (name.includes("library") || name.includes("learning and information")) {
              return roomPalette.library;
            }

            if (category === "laboratory" || type === "laboratory") {
              return roomPalette.laboratory;
            }

            if (
              category === "office" ||
              category === "faculty" ||
              type === "office" ||
              type === "faculty"
            ) {
              return roomPalette.office;
            }

            if (category === "food" || type === "food") {
              return roomPalette.food;
            }

            if (category === "security" || name.includes("guard")) {
              return roomPalette.restricted;
            }

            if (category === "facility" || type === "facility") {
              return roomPalette.facility;
            }

            return roomPalette.classroom;
          }

          function getLocationStyle(feature) {
            return {
              color: "#ffffff",
              className: "campus-location-shape",
              weight: 2,
              fillColor: getLocationFillColor(feature),
              fillOpacity: 0.88
            };
          }


          function getMapFeatureStyle(feature) {
            const type = feature.properties?.type;

            switch (type) {
              case "hallway":
                return {
                  color: "#ffffff",
                  weight: 2,
                  fillColor: roomPalette.hallway,
                  fillOpacity: 0.95
                };
              case "court":
                return {
                  color: "#f3ead4",
                  weight: 3,
                  fillColor: "#4f9f78",
                  fillOpacity: 0.86
                };
              case "parking":
                return {
                  color: "#f3ead4",
                  weight: 2,
                  fillColor: "#9ea59a",
                  fillOpacity: 0.88
                };
              default:
                return {
                  color: "#777777",
                  weight: 1,
                  fillOpacity: 0.5
                };
            }
          }

          function createBenchIcon(rotation) {
            const rotationDegrees =
              typeof rotation === "number"
                ? rotation
                : 0;

            return L.divIcon({
            className: "bench-marker",
            html:
              '<div style="' +
              'width:18px;' +
              'height:8px;' +
              'background:#f2dfbd;' +
              'border:2px solid #d5c59e;' +
              'border-radius:3px;' +
              'box-shadow:0 1px 4px rgba(68,49,34,0.24);' +
              'transform:rotate(' + rotationDegrees + 'deg);' +
              'transform-origin:center;' +
              '"></div>',
            iconSize: [22, 12],
            iconAnchor: [11, 6]
            });
          }

          const selectedStyle = {
            color: "#ffcf54",
            weight: 5,
            fillColor: "#ffd970",
            fillOpacity: 0.76
          };

          const currentLocationIcon = L.divIcon({
            className: "campus-current-location-marker",
            html:
              '<div style="' +
              'width:16px;' +
              'height:16px;' +
              'border-radius:50%;' +
              'background:#1976d2;' +
              'border:3px solid white;' +
              'box-shadow:0 2px 8px rgba(0,0,0,0.35);' +
              '"></div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const categoryMarkerIcon = L.divIcon({
            className: "campus-category-marker",
            html:
              '<div class="campus-selected-marker">' +
              '<span class="pulse-ring"></span>' +
              '<span class="pin-shadow"></span>' +
              '<span class="pin-wrap"><span class="pin-body"></span></span>' +
              '</div>',
            iconSize: [74, 74],
            iconAnchor: [37, 58],
            popupAnchor: [0, -58]
          });

          let currentLocationMarker = null;
          let currentLocationCircle = null;

          function setCurrentLocation(currentLocation) {
            if (
              !currentLocation ||
              typeof currentLocation.latitude !== "number" ||
              typeof currentLocation.longitude !== "number"
            ) {
              return;
            }

            const currentLatLng = [
              currentLocation.latitude,
              currentLocation.longitude
            ];

            if (currentLocationCircle) {
              currentLocationCircle.setLatLng(currentLatLng);
              currentLocationCircle.setRadius(currentLocation.accuracy || 8);
            } else {
              currentLocationCircle = L.circle(
                currentLatLng,
                {
                  radius: currentLocation.accuracy || 8,
                  color: "#1976d2",
                  weight: 1,
                  fillColor: "#64b5f6",
                  fillOpacity: 0.16,
                  interactive: false
                }
              ).addTo(map);
            }

            if (currentLocationMarker) {
              currentLocationMarker.setLatLng(currentLatLng);
            } else {
              currentLocationMarker = L.marker(
                currentLatLng,
                {
                  icon: currentLocationIcon,
                  interactive: false
                }
              ).addTo(map);
            }
          }

          function focusCurrentLocation(currentLocation) {
            setCurrentLocation(currentLocation);

            if (
              !currentLocation ||
              typeof currentLocation.latitude !== "number" ||
              typeof currentLocation.longitude !== "number"
            ) {
              return;
            }

            map.flyTo(
              [
                currentLocation.latitude,
                currentLocation.longitude
              ],
              Math.max(map.getZoom(), 20),
              {
                animate: true,
                duration: 1.1,
                easeLinearity: 0.18
              }
            );
          }

          window.addEventListener("message", function (event) {
            if (event.data && event.data.event === "set-current-location") {
              setCurrentLocation(event.data.location);
            }

            if (event.data && event.data.event === "focus-current-location") {
              focusCurrentLocation(event.data.location);
            }
          });

          function postSelectedFeature(properties) {
            window.parent.postMessage(
              {
                event: "feature-selected",
                feature: {
                  id: String(properties.id || ""),
                  name: String(properties.name || "Unnamed"),
                  type: String(properties.type || ""),
                  category: String(properties.category || ""),
                  floors: properties.floors,
                  description: properties.description
                }
              },
              "*"
            );
          }

          function escapeHtml(value) {
            return String(value || "")
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
          }

          function selectFeatureLayer(featureKey) {
            if (!featureKey || !featureLayers[featureKey]) {
              return;
            }

            if (
              activeFeatureKey &&
              activeFeatureKey !== featureKey &&
              featureLayers[activeFeatureKey]
            ) {
              featureLayers[activeFeatureKey].layer.setStyle(
                featureLayers[activeFeatureKey].defaultStyle
              );
            }

            activeFeatureKey = featureKey;
            featureLayers[featureKey].layer.setStyle(selectedStyle);

            if (featureLayers[featureKey].layer.bringToFront) {
              featureLayers[featureKey].layer.bringToFront();
            }
          }

          function addPendingSelectedMarker() {
            if (!pendingSelectedMarker) {
              return;
            }

            const addMarker = pendingSelectedMarker;
            pendingSelectedMarker = null;
            addMarker();
          }

          function addSelectedMarkerAfterFocus(delayMs) {
            if (!pendingSelectedMarker) {
              return;
            }

            let fallbackId = null;
            let startFallbackId = null;
            let isComplete = false;

            function handleFocusEnd() {
              if (isComplete) {
                return;
              }

              isComplete = true;
              map.off("movestart", handleFocusStart);
              map.off("moveend", handleFocusEnd);

              if (fallbackId) {
                clearTimeout(fallbackId);
              }

              if (startFallbackId) {
                clearTimeout(startFallbackId);
              }

              addPendingSelectedMarker();
            }

            function handleFocusStart() {
              if (startFallbackId) {
                clearTimeout(startFallbackId);
              }

              map.once("moveend", handleFocusEnd);
              fallbackId = setTimeout(handleFocusEnd, delayMs);
            }

            map.once("movestart", handleFocusStart);
            startFallbackId = setTimeout(function () {
              map.off("movestart", handleFocusStart);
              fallbackId = setTimeout(handleFocusEnd, delayMs);
            }, 120);
          }

          function bindFeature(feature, layer, defaultStyle) {
            const properties = getMergedProperties(feature);
            const featureKey =
              properties.type && properties.id
                ? properties.type + "-" + properties.id
                : null;

            if (featureKey) {
              featureLayers[featureKey] = {
                layer,
                defaultStyle
              };
            }

            layer.on("click", function () {
              postSelectedFeature(properties);
              selectFeatureLayer(featureKey);
            });

            layer.on("mouseover", function () {
              this.setStyle({
                weight: featureKey === activeFeatureKey ? 6 : 4,
                fillOpacity: 0.75
              });
            });

            layer.on("mouseout", function () {
              this.setStyle(
                featureKey === activeFeatureKey
                  ? selectedStyle
                  : defaultStyle
              );
            });

            if (featureKey === selectedFeatureKey) {
              layer.setStyle(selectedStyle);

              if (!openSelectedPopup && layer.getBounds) {
                pendingSelectedMarker = function () {
                  const marker = L.marker(
                    layer.getBounds().getCenter(),
                    {
                      icon: categoryMarkerIcon,
                      pane: "selected-marker-pane",
                      zIndexOffset: 9000
                    }
                  ).addTo(map);

                  marker.on("click", function () {
                    postSelectedFeature(properties);
                    selectFeatureLayer(featureKey);
                  });
                };
              }
            }

            if (
              selectedCategory &&
              properties.category === selectedCategory &&
              layer.getBounds
            ) {
              const marker = L.marker(
                layer.getBounds().getCenter(),
                {
                  icon: categoryMarkerIcon,
                  pane: "selected-marker-pane",
                  zIndexOffset: 8000
                }
              ).addTo(map);

              marker.on("click", function () {
                postSelectedFeature(properties);
                selectFeatureLayer(featureKey);
              });

              categoryFeatureBounds.push(layer.getBounds());
            }
          }

          function addMapLabel(layer, text) {
            if (!text || !layer.getBounds) {
              return;
            }

            layer.bindTooltip(text, {
              permanent: true,
              direction: "center",
              className: "campus-map-label"
            });
          }

          function addRoomLabel(layer, text) {
            if (!text || !layer.getBounds) {
              return;
            }

            layer.bindTooltip(text, {
              permanent: false,
              direction: "center",
              className: "campus-map-label campus-room-label"
            });

            roomLabelLayers.push(layer);
          }

          function updateRoomLabels() {
            const shouldShowLabels = map.getZoom() >= roomLabelMinZoom;

            roomLabelLayers.forEach(function (layer) {
              if (shouldShowLabels) {
                layer.openTooltip();
              } else {
                layer.closeTooltip();
              }
            });
          }

          map.on("zoomend", updateRoomLabels);


          /*
           * ==========================
           * MAP-ONLY FEATURES
           * ==========================
           */

          L.geoJSON(mapFeatureCollection, {
            filter: function (feature) {
              return feature.properties?.type !== "gate";
            },
            style: getMapFeatureStyle,
            onEachFeature: function (feature, layer) {
              const properties = feature.properties || {};

              if (
                properties.type === "court" ||
                properties.type === "parking"
              ) {
                addMapLabel(layer, properties.name);
              }
            },
            interactive: false
          }).addTo(map);

          L.geoJSON(benchCollection, {
            pointToLayer: function (feature, latlng) {
              return L.marker(latlng, {
                icon: createBenchIcon(feature.properties?.rotation),
                interactive: false
              });
            }
          }).addTo(map);

          L.geoJSON(
            buildingCollection,
            {
              filter: function (feature) {
                return !isHiddenFeature(feature);
              },
              style: buildingStyle,
              onEachFeature: function (feature, layer) {
                bindFeature(feature, layer, buildingStyle);
                const properties = getMergedProperties(feature);

                addMapLabel(
                layer, 
                properties.name
                );
              }
            }
          ).addTo(map);

          L.geoJSON(
            locationCollection,
            {
              filter: function (feature) {
                return !isHiddenFeature(feature);
              },
              style: getLocationStyle,
              onEachFeature: function (feature, layer) {
                const locationStyle = getLocationStyle(feature);

                bindFeature(feature, layer, locationStyle);
                const properties = getMergedProperties(feature);

                addRoomLabel(
                  layer,
                  properties.name
                );
              }
            }
          ).addTo(map);

          function focusSelectedFeature() {
            if (!selectedFeatureKey) {
              return;
            }

            const selectedFeature =
              featureLayers[selectedFeatureKey];

            if (!selectedFeature) {
              return;
            }

            selectedFeature.layer.setStyle(selectedStyle);
            activeFeatureKey = selectedFeatureKey;

            if (selectedFeature.layer.bringToFront) {
              selectedFeature.layer.bringToFront();
            }

            if (selectedFeature.layer.getBounds) {
              const selectedBounds = selectedFeature.layer.getBounds();
              if (selectedFeatureType === "building") {
                addSelectedMarkerAfterFocus(2200);
                smoothFocusBounds(
                  selectedBounds,
                  {
                    padding: [60, 60],
                    maxZoom: 20
                  }
                );
              } else {
                addSelectedMarkerAfterFocus(1800);
                smoothFocusCenter(selectedBounds.getCenter(), 20);
              }
            } else {
              addPendingSelectedMarker();
            }

          }

          function applyDefaultCampusView() {
            map.fitBounds(
              campusBounds,
              {
                padding: [8, 8],
                maxZoom: 20,
                animate: false
              }
            );

            map.setZoom(
              Math.min(map.getZoom() + 1, 21),
              {
                animate: false
              }
            );
          }

          function focusSelectedCategory() {
            if (!selectedCategory || !categoryFeatureBounds.length) {
              return;
            }
          }

          setTimeout(() => {
            map.invalidateSize({
              animate: false,
              pan: false
            });

            map.setMaxBounds(
              paddedCampusBounds
            );

            map.setMinZoom(
              Math.max(
                map.getBoundsZoom(
                campusBounds,
                false,
                [8, 8]
                ) - 1,
                16
              )
            );

            if (map.setBearing) {
              map.setBearing(${mapBearing});
            }

            updateRoomLabels();
            if (selectedFeatureKey) {
              applyDefaultCampusView();
              requestAnimationFrame(function () {
                focusSelectedFeature();
                window.parent.postMessage(
                  {
                    event: "map-ready"
                  },
                  "*"
                );
              });
            } else {
              applyDefaultCampusView();
              focusSelectedCategory();
              window.parent.postMessage(
                {
                  event: "map-ready"
                },
                "*"
              );
            }
          }, 500);
        </script>
      </body>
    </html>
  `,
    [boundaryCoordinates, featureOverrides, hiddenFeatureKeys, openSelectedPopup, selectedCategory, selectedFeatureId, selectedFeatureType],
  );

  return (
    <iframe
      ref={iframeRef}
      srcDoc={html}
      title="UMVCFIND campus map"
      style={{
        width: "100%",
        height: "100%",
        border: 0,
      }}
      onLoad={() => {
        iframeRef.current?.contentWindow?.postMessage(
          {
            event: "set-current-location",
            location: currentLocation,
          },
          "*",
        );
      }}
    />
  );
}
