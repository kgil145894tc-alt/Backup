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
  onFeaturePress?: (feature: SelectedMapFeature) => void;
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
  onFeaturePress,
}: OSMMapProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
    }

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [onFeaturePress]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        event: "set-current-location",
        location: currentLocation,
      },
      "*",
    );
  }, [currentLocation]);

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
            background: #ffb020;
            height: 20px;
            width: 20px;
          }

          .campus-category-marker {
            align-items: center;
            display: flex;
            justify-content: center;
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
            zoomControl: true,
            maxBoundsViscosity: 0.25
          }).setView(
            [7.4259, 125.7939],
            18
          );

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

          const locationStyle = {
            color: "#f3ead4",
            className: "campus-location-shape",
            weight: 2,
            fillColor: "#efe2c5",
            fillOpacity: 0.9
          };


          function getMapFeatureStyle(feature) {
            const type = feature.properties?.type;

            switch (type) {
              case "hallway":
                return {
                  color: "#f5f1df",
                  weight: 2,
                  fillColor: "#f4f0dc",
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
            html: '<div class="campus-pin category"></div>',
            iconSize: [26, 26],
            iconAnchor: [13, 24]
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

          window.addEventListener("message", function (event) {
            if (event.data && event.data.event === "set-current-location") {
              setCurrentLocation(event.data.location);
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
                const marker = L.marker(
                  layer.getBounds().getCenter(),
                  {
                    icon: categoryMarkerIcon,
                    zIndexOffset: 900
                  }
                ).addTo(map);

                marker.on("click", function () {
                  postSelectedFeature(properties);
                  selectFeatureLayer(featureKey);
                });
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
                  zIndexOffset: 800
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
              style: locationStyle,
              onEachFeature: function (feature, layer) {
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
              map.fitBounds(
                selectedFeature.layer.getBounds(),
                {
                  padding: [60, 60],
                  maxZoom: 20
                }
              );
            }

          }

          function focusSelectedCategory() {
            if (!selectedCategory || !categoryFeatureBounds.length) {
              return;
            }

            const bounds = categoryFeatureBounds.reduce(
              function (nextBounds, featureBounds) {
                return nextBounds.extend(featureBounds);
              },
              L.latLngBounds(
                categoryFeatureBounds[0].getSouthWest(),
                categoryFeatureBounds[0].getNorthEast()
              )
            );

            map.fitBounds(
              bounds,
              {
                padding: [70, 70],
                maxZoom: 20
              }
            );
          }

          setTimeout(() => {
            map.invalidateSize();

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

            map.fitBounds(
              campusBounds,
              {
                padding: [8, 8],
                maxZoom: 20
              }
            );

            map.setZoom(
              Math.min(map.getZoom() + 1, 21)
            );

            if (map.setBearing) {
              map.setBearing(${mapBearing});
            }

            updateRoomLabels();
            if (selectedFeatureKey) {
              focusSelectedFeature();
            } else {
              focusSelectedCategory();
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
