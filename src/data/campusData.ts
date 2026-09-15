import buildingsCollection from "./buildings.json";
import locationsCollection from "./locations.json";
import type {
  BuildingProperties,
  CampusFeature,
  CampusFeatureCategory,
  CampusFeatureCollection,
  CampusFeatureType,
  LocationProperties,
  SelectedMapFeature,
} from "../types/campus";

export const buildings =
  buildingsCollection as CampusFeatureCollection<BuildingProperties>;

export const locations =
  locationsCollection as CampusFeatureCollection<LocationProperties>;

export const campusFeatures: CampusFeature[] = [
  ...buildings.features,
  ...locations.features,
];

export const campusFeatureSummaries: SelectedMapFeature[] =
  campusFeatures.map((feature) => ({
    id: feature.properties.id,
    name: feature.properties.name,
    type: feature.properties.type as CampusFeatureType,
    category: feature.properties.category as CampusFeatureCategory,
    floors:
      "floors" in feature.properties
        ? feature.properties.floors
        : undefined,
    description:
      "description" in feature.properties
        ? feature.properties.description
        : undefined,
  }));

export const campusCategories: CampusFeatureCategory[] = Array.from(
  new Set(campusFeatureSummaries.map((feature) => feature.category)),
);
