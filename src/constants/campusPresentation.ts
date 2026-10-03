import type { ComponentType } from "react";
import type { ImageSource } from "expo-image";
import type { SvgProps } from "react-native-svg";

import AcademicIcon from "@/assets/design/icons/academic.svg";
import FacilitiesIcon from "@/assets/design/icons/facilities.svg";
import FacilitiesCogIcon from "@/assets/design/icons/facilities-cog.svg";
import FoodIcon from "@/assets/design/icons/food.svg";
import MoreIcon from "@/assets/design/icons/more.svg";
import OfficesIcon from "@/assets/design/icons/offices.svg";
import OtherBuildingsIcon from "@/assets/design/icons/other-building.svg";
import ServicesIcon from "@/assets/design/icons/services.svg";

export type CampusCategoryPresentation = {
  Icon: ComponentType<SvgProps>;
  color: string;
  image: ImageSource | number;
  light?: boolean;
};

const categoryImages = {
  academic: require("../../assets/design/locations/category-academic.png"),
  building: require("../../assets/design/locations/Category-Building.jpg"),
  facility: require("../../assets/design/locations/Category-Facility.jpg"),
  faculty: require("../../assets/design/locations/Category-Faculty.jpg"),
  food: require("../../assets/design/locations/Category-Food.jpg"),
  laboratory: require("../../assets/design/locations/Category-Laboratory.jpg"),
  office: require("../../assets/design/locations/Category-Offices.jpg"),
  room: require("../../assets/design/locations/Category-Room.jpg"),
  security: require("../../assets/design/locations/Category-Security.jpg"),
};

export const preferredCategoryOrder = [
  "Building",
  "Room",
  "Laboratory",
  "Faculty",
  "Office",
  "Facility",
  "Food",
  "Security",
];

export const fallbackCategoryPresentation: CampusCategoryPresentation = {
  color: "#6C757D",
  image: categoryImages.academic,
  Icon: OtherBuildingsIcon,
};

export const categoryPresentation: Record<
  string,
  CampusCategoryPresentation
> = {
  Building: {
    color: "#AF2532",
    image: categoryImages.building,
    Icon: OtherBuildingsIcon,
    light: true,
  },
  Facility: {
    color: "#1EAB58",
    image: categoryImages.facility,
    Icon: FacilitiesCogIcon,
  },
  Faculty: {
    color: "#7B4FC9",
    image: categoryImages.faculty,
    Icon: AcademicIcon,
  },
  Food: {
    color: "#FA5D0E",
    image: categoryImages.food,
    Icon: FoodIcon,
  },
  Laboratory: {
    color: "#208AEF",
    image: categoryImages.laboratory,
    Icon: AcademicIcon,
  },
  Office: {
    color: "#FEBF1F",
    image: categoryImages.office,
    Icon: OfficesIcon,
  },
  Room: {
    color: "#AF2532",
    image: categoryImages.room,
    Icon: AcademicIcon,
    light: true,
  },
  Security: {
    color: "#2F4858",
    image: categoryImages.security,
    Icon: ServicesIcon,
  },
};

export const homeCategoryPresentation: Record<
  string,
  CampusCategoryPresentation
> = {
  Building: {
    ...categoryPresentation.Building,
    Icon: MoreIcon,
  },
  Facility: {
    ...categoryPresentation.Facility,
    color: "#FAE7E9",
    Icon: FacilitiesIcon,
  },
  Faculty: {
    ...categoryPresentation.Faculty,
    color: "#F0E7FA",
  },
  Food: {
    ...categoryPresentation.Food,
    color: "#FAF2DD",
  },
  Laboratory: {
    ...categoryPresentation.Laboratory,
    color: "#E6F1FF",
  },
  Office: categoryPresentation.Office,
  Room: categoryPresentation.Room,
  Security: {
    ...categoryPresentation.Security,
    color: "#E8EEF1",
  },
};

export const fallbackHomeCategoryPresentation: CampusCategoryPresentation = {
  ...fallbackCategoryPresentation,
  color: "#FAF2DD",
  Icon: MoreIcon,
};

export function sortCategoriesByPreferredOrder(categories: string[]) {
  return [...categories].sort((first, second) => {
    const firstIndex = preferredCategoryOrder.indexOf(first);
    const secondIndex = preferredCategoryOrder.indexOf(second);

    if (firstIndex !== -1 || secondIndex !== -1) {
      return (
        (firstIndex === -1 ? Number.MAX_SAFE_INTEGER : firstIndex) -
        (secondIndex === -1 ? Number.MAX_SAFE_INTEGER : secondIndex)
      );
    }

    return first.localeCompare(second);
  });
}

export function toCategoryId(category: string) {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function getLocationImage(item: { category: string; name: string }) {
  const name = item.name.toLowerCase();
  const category = item.category.toLowerCase();

  if (name.includes("cafeteria")) return categoryImages.food;
  if (name.includes("clinic")) return categoryImages.facility;
  if (name.includes("library")) return categoryImages.facility;
  if (name.includes("new") || name.includes("building 2")) {
    return categoryImages.building;
  }
  if (category.includes("academic") || category.includes("room")) {
    return categoryImages.academic;
  }
  if (category.includes("office") || category.includes("admin")) {
    return categoryImages.office;
  }
  if (category.includes("facilit")) return categoryImages.facility;

  return categoryImages.building;
}
