import { useEffect, useMemo, useRef, type ElementRef } from "react";
import { WebView } from "react-native-webview";
import buildingsData from "../src/data/buildings.json";
import campusBoundary from "../src/data/campusBoundary";
import locationsData from "../src/data/locations.json";
export type {
  CurrentMapLocation,
  SelectedMapFeature,
} from "../src/types/campus";
import type {
  CurrentMapLocation,
  SelectedMapFeature,
} from "../src/types/campus";

type OSMMapProps = {
  selectedFeatureId?: string;
  selectedFeatureType?: string;
  currentLocation?: CurrentMapLocation;
  onFeaturePress?: (feature: SelectedMapFeature) => void;
};

export default function OSMMap({
  selectedFeatureId,
  selectedFeatureType,
  currentLocation,
  onFeaturePress,
}: OSMMapProps) {
  const webViewRef = useRef<ElementRef<typeof WebView>>(null);

  const boundaryCoordinates = campusBoundary
    .map((point) => `[${point.latitude}, ${point.longitude}]`)
    .join(",");

  useEffect(() => {
    if (!currentLocation) {
      return;
    }

    webViewRef.current?.injectJavaScript(`
      window.setCurrentLocation(${JSON.stringify(currentLocation)});
      true;
    `);
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
        </style>
      </head>

      <body>
        <div id="map"></div>

        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script src="https://unpkg.com/leaflet-rotate@0.2.8/dist/leaflet-rotate-src.js"></script>

        <script>
          /*
           * ==========================
           * MAP
           * ==========================
           */

          const map = L.map("map", {
            rotate: true,
            bearing: 232,
            touchRotate: false,
            rotateControl: false,
            zoomControl: true,
            maxBoundsViscosity: 1.0
          }).setView(
            [7.4259, 125.7939],
            18
          );


          /*
           * ==========================
           * OPEN STREET MAP
           * ==========================
           */

          L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
              maxZoom: 22,

              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
          ).addTo(map);


          /*
           * ==========================
           * SCHOOL GATE
           * ==========================
           */

          L.marker([
            7.4263413,
            125.7934517
          ])
            .addTo(map)
            .bindPopup("School Gate");


          /*
           * ==========================
           * CAMPUS BOUNDARY
           * ==========================
           */

          const campusBoundary = [
            ${boundaryCoordinates}
          ];

          const campusBounds =
            L.latLngBounds(campusBoundary);
          const paddedCampusBounds =
            campusBounds.pad(0.08);

          L.polygon(
            campusBoundary,
            {
              color: "blue",
              weight: 3,
              fillOpacity: 0.15
            }
          )
            .addTo(map)
            .bindPopup("School Campus");


          /*
           * ==========================
           * QGIS GEOJSON LAYERS
           * ==========================
           */

          const buildingCollection =
            ${JSON.stringify(buildingsData)};

          const locationCollection =
            ${JSON.stringify(locationsData)};

          const selectedFeatureId =
            ${JSON.stringify(selectedFeatureId ?? null)};

          const selectedFeatureType =
            ${JSON.stringify(selectedFeatureType ?? null)};

          const selectedFeatureKey =
            selectedFeatureId && selectedFeatureType
              ? selectedFeatureType + "-" + selectedFeatureId
              : null;

          const featureLayers = {};
          let activeFeatureKey = selectedFeatureKey;


          /*
           * Building style
           */

          const buildingStyle = {
            color: "#d32f2f",
            weight: 2,
            fillColor: "#ef5350",
            fillOpacity: 0.3
          };


          /*
           * Location / room style
           */

          const locationStyle = {
            color: "#2e7d32",
            weight: 2,
            fillColor: "#66bb6a",
            fillOpacity: 0.35
          };

          const selectedStyle = {
            color: "#0d47a1",
            weight: 5,
            fillColor: "#42a5f5",
            fillOpacity: 0.7
          };

          const currentLocationIcon = L.divIcon({
            className: "current-location-marker",
            html:
              '<div style="' +
              'width:18px;' +
              'height:18px;' +
              'border-radius:50%;' +
              'background:#1976d2;' +
              'border:3px solid white;' +
              'box-shadow:0 2px 8px rgba(0,0,0,0.35);' +
              '"></div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          let currentLocationMarker = null;
          let currentLocationCircle = null;

          /*
           * ==========================
           * CURRENT LOCATION
           * ==========================
           */

          window.setCurrentLocation = function (currentLocation) {
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
          };


          /*
           * ==========================
           * FEATURE POPUP + HOVER
           * ==========================
           */

          function postSelectedFeature(properties) {
            const payload = {
              id: String(properties.id || ""),
              name: String(properties.name || "Unnamed"),
              type: String(properties.type || ""),
              category: String(properties.category || ""),
              floors: properties.floors,
              description: properties.description
            };

            const message = JSON.stringify({
              event: "feature-selected",
              feature: payload
            });

            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(message);
            }
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

          function bindFeature(
            feature,
            layer,
            defaultStyle
          ) {
            const properties = feature.properties || {};
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

            layer.bindPopup(
              "<b>" +
              escapeHtml(properties.name || "Unnamed") +
              "</b><br>" +
              escapeHtml(properties.category || "")
            );

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
            }
          }


          /*
           * ==========================
           * BUILDINGS
           * ==========================
           */

          L.geoJSON(
            buildingCollection,
            {
              style: buildingStyle,

              onEachFeature: function (
                feature,
                layer
              ) {
                bindFeature(
                  feature,
                  layer,
                  buildingStyle
                );
              }
            }
          ).addTo(map);


          /*
           * ==========================
           * LOCATIONS / ROOMS
           * ==========================
           */

          L.geoJSON(
            locationCollection,
            {
              style: locationStyle,

              onEachFeature: function (
                feature,
                layer
              ) {
                bindFeature(
                  feature,
                  layer,
                  locationStyle
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

            selectedFeature.layer.openPopup();
          }


          /*
           * ==========================
           * FIX MAP SIZE
           * ==========================
           */

          setTimeout(() => {
            map.invalidateSize();

            map.setMaxBounds(
              paddedCampusBounds
            );

            map.setMinZoom(
              map.getBoundsZoom(
                campusBounds,
                false,
                [8, 8]
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

            map.setMinZoom(map.getZoom());

            if (map.setBearing) {
              map.setBearing(232);
            }

            focusSelectedFeature();
          }, 500);

        </script>
      </body>
    </html>
  `,
    [boundaryCoordinates, selectedFeatureId, selectedFeatureType],
  );

  return (
    <WebView
      ref={webViewRef}
      source={{ html }}
      style={{ flex: 1 }}
      originWhitelist={["*"]}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      scrollEnabled={false}
      onLoadEnd={() => {
        if (!currentLocation) {
          return;
        }

        webViewRef.current?.injectJavaScript(`
          window.setCurrentLocation(${JSON.stringify(currentLocation)});
          true;
        `);
      }}
      onMessage={(event) => {
        try {
          const message = JSON.parse(event.nativeEvent.data) as {
            event?: string;
            feature?: SelectedMapFeature;
          };

          if (message.event === "feature-selected" && message.feature) {
            onFeaturePress?.(message.feature);
          }
        } catch {
          // Ignore non-JSON messages from the WebView.
        }
      }}
    />
  );
}
