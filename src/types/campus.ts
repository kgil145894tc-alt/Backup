export type CampusFeatureId = string;

export type CampusFeatureType =
  | "building"
  | "facility"
  | "faculty"
  | "food"
  | "laboratory"
  | "office"
  | "room";

export type CampusFeatureCategory =
  | "Building"
  | "Facility"
  | "Faculty"
  | "Food"
  | "Laboratory"
  | "Office"
  | "Room";

export type Coordinate = [longitude: number, latitude: number];

export type PolygonGeometry = {
  type: "Polygon";
  coordinates: Coordinate[][];
};

export type BuildingProperties = {
  id: CampusFeatureId;
  name: string;
  type: "building";
  category: "Building";
  floors: number;
  description: string;
};

export type LocationProperties = {
  id: CampusFeatureId;
  name: string;
  type: Exclude<CampusFeatureType, "building">;
  category: Exclude<CampusFeatureCategory, "Building">;
};

export type CampusFeatureProperties =
  | BuildingProperties
  | LocationProperties;

export type CampusFeature<
  TProperties extends CampusFeatureProperties = CampusFeatureProperties,
> = {
  type: "Feature";
  properties: TProperties;
  geometry: PolygonGeometry;
};

export type CampusFeatureCollection<
  TProperties extends CampusFeatureProperties = CampusFeatureProperties,
> = {
  type: "FeatureCollection";
  name: string;
  features: CampusFeature<TProperties>[];
};

export type BuildingFeature = CampusFeature<BuildingProperties>;

export type LocationFeature = CampusFeature<LocationProperties>;

export type SelectedMapFeature = {
  id: CampusFeatureId;
  name: string;
  type: CampusFeatureType;
  category: CampusFeatureCategory;
  floors?: number | string;
  description?: string;
};

export type CurrentMapLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
};
