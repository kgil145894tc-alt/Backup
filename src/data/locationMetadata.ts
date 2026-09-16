import type { CampusFeatureId, CampusFeatureType } from "../types/campus";

export type CampusFeatureMetadata = {
  aliases?: string[];
  accessibility?: string;
  directions?: string;
  floor?: string;
  nearby?: string;
  description?: string;
  photoKey?: string;
};

type MetadataKey = `${CampusFeatureType}:${CampusFeatureId}`;

export const campusFeatureMetadata: Partial<
  Record<MetadataKey, CampusFeatureMetadata>
> = {
  "building:ob": {
    aliases: ["OB", "Old Building", "Academic Building"],
    nearby: "Near the Canteen and the main campus walkway.",
    directions:
      "From the main gate, follow the main campus walkway toward the academic rooms beside the Canteen.",
    accessibility:
      "Ground-floor areas may be easier to reach. Upper floors require stairs; confirm accessible routes with campus staff.",
    description:
      "Three-storey academic building with classrooms, laboratories, and AV Room 2.",
    photoKey: "old-building",
  },
  "building:b1": {
    aliases: ["B1", "Building 1", "B-1"],
    nearby: "Near the Chemistry Laboratory, Physical Laboratory, RV1, and the office row.",
    directions:
      "From the main gate, follow the main walkway toward the upper academic building cluster.",
    accessibility:
      "Ground-floor areas may be easier to reach. Upper floors require stairs; confirm accessible routes with campus staff.",
    description:
      "Three-storey academic building with classrooms on Levels 1 to 3.",
    photoKey: "building-b1",
  },
  "building:b2": {
    aliases: ["B2", "Building 2", "B-2"],
    nearby: "Near the Psychology Laboratory, Psychology Faculty Office, Faculty Room, and Comfort Room.",
    directions:
      "From the main gate, follow the main walkway toward the academic building cluster on the right side of the campus map.",
    accessibility:
      "Ground-floor areas may be easier to reach. Upper floors require stairs; confirm accessible routes with campus staff.",
    description:
      "Three-storey academic building with classrooms on Levels 1 to 3.",
    photoKey: "building-b2",
  },
  "building:cr1-building": {
    aliases: ["CR Building", "Comfort Room Building", "Restroom Building", "PWD Restroom"],
    nearby: "Between the Old Building and Building B2.",
    directions:
      "Look for the small building between the nearby academic buildings.",
    accessibility:
      "Campus data lists male, female, and PWD restroom access. Confirm availability and operating hours on site.",
    description: "Three-storey restroom building serving the nearby academic buildings.",
    photoKey: "comfort-room-building",
  },
  "laboratory:psychology-lab": {
    aliases: ["Psych Lab", "Psychology Lab", "Psychology Laboratory"],
    floor: "Ground Floor (Level 1)",
    nearby: "In Building B2, beside the Psychology Faculty Office.",
    directions:
      "Go to Building B2 and look for the laboratory beside the Psychology Faculty Office.",
    accessibility:
      "Ask staff if laboratory access is restricted during class hours.",
    description:
      "Laboratory area used for psychology-related class activities and practical work.",
  },
  "faculty:psychology-faculty": {
    aliases: ["Psych Faculty", "Psychology Faculty", "Psychology Faculty Office"],
    floor: "Ground Floor (Level 1)",
    nearby: "In Building B2, between the Psychology Laboratory and Faculty Room.",
    directions:
      "Go to Building B2 and follow the room row from the Psychology Laboratory toward the Faculty Room.",
    description: "Faculty office for psychology instructors and student consultation.",
  },
  "faculty:faculty": {
    aliases: ["Faculty", "Faculty Room", "Instructors' Room"],
    floor: "Ground Floor (Level 1)",
    nearby: "In Building B2, beside the Psychology Faculty Office and near the Comfort Room.",
    directions:
      "Go to Building B2 and follow the room row past the Psychology Faculty Office.",
    description: "Shared faculty room for instructor work and student consultation.",
  },
  "facility:cr1": {
    aliases: ["CR", "Comfort Room", "Restroom", "B2 Restroom"],
    floor: "Ground Floor (Level 1)",
    nearby: "At the end of the Building B2 room row, near the Faculty Room.",
    directions:
      "Go to the Building B2 side and look for the small facility room at the end of the row.",
    accessibility: "Accessibility features are not yet verified. Confirm availability and operating hours on site.",
  },
  "facility:cr2": {
    aliases: ["CR", "Comfort Room", "Restroom", "Old Building Restroom"],
    nearby: "Near RV2 and RV3 in the standalone room area.",
    directions:
      "Use the campus map to locate the standalone room area near RV2 and RV3.",
    accessibility: "Accessibility features are not yet verified. Confirm availability and operating hours on site.",
  },
  "facility:cr3": {
    aliases: ["CR", "Comfort Room", "Restroom", "Office Row Restroom"],
    floor: "Ground Floor (Level 1)",
    nearby: "Beside the Center for Health Services and Cashier in the office row.",
    directions:
      "Go to the office-side room row and look near the health services area.",
    accessibility: "Accessibility features are not yet verified. Confirm availability and operating hours on site.",
  },
  "room:rv1": {
    aliases: ["RV 1", "Room V1", "Room RV1"],
    floor: "Ground Floor (Level 1)",
    nearby: "In the Building B1 area, beside the Physical Laboratory.",
    directions:
      "Go to the Building B1 area and look for RV1 beside the Physical Laboratory.",
    description: "Classroom identified as RV1 in the campus map data.",
  },
  "room:rv2": {
    aliases: ["RV 2", "Room V2", "Room RV2"],
    floor: "Ground Floor (Level 1)",
    nearby: "Near RV3 and the nearby Comfort Room.",
    directions:
      "Use the campus map to locate the standalone RV room area, then follow the room sequence toward RV3.",
    description: "Classroom identified as RV2 in the campus map data.",
  },
  "room:rv3": {
    aliases: ["RV 3", "Room V3", "Room RV3"],
    floor: "Ground Floor (Level 1)",
    nearby: "Between RV2 and RV4 in the standalone RV room area.",
    directions:
      "Use the campus map to locate the standalone RV room area, then follow the room sequence between RV2 and RV4.",
    description: "Classroom identified as RV3 in the campus map data.",
  },
  "room:rv4": {
    aliases: ["RV 4", "Room V4", "Room RV4"],
    floor: "Ground Floor (Level 1)",
    nearby: "Near the end of the standalone RV room area, beside RV3.",
    directions:
      "Use the campus map to locate the standalone RV room area, then look for the room nearest RV3.",
    description: "Classroom identified as RV4 in the campus map data.",
  },
  "laboratory:chem": {
    aliases: ["Chem Lab", "Chemistry Lab", "Chemistry Laboratory"],
    floor: "Ground Floor (Level 1)",
    nearby: "In the Building B1 area, beside the Physical Laboratory.",
    directions:
      "Go to the Building B1 laboratory row and look for the Chemistry Laboratory beside the Physical Laboratory.",
    accessibility:
      "Laboratory access may require instructor permission or a scheduled class. Accessibility features are not yet verified.",
    description: "Laboratory used for chemistry-related classes and practical activities.",
  },
  "laboratory:physical-laboratory": {
    aliases: ["Physics Lab", "Physical Lab", "Physical Laboratory"],
    floor: "Ground Floor (Level 1)",
    nearby: "In the Building B1 area, between the Chemistry Laboratory and RV1.",
    directions:
      "Go to the Building B1 laboratory row and look for the room between the Chemistry Laboratory and RV1.",
    accessibility:
      "Laboratory access may require instructor permission or a scheduled class. Accessibility features are not yet verified.",
    description: "Laboratory identified as the Physical Laboratory in the campus map data.",
  },
  "office:osa": {
    aliases: ["OSA", "Student Affairs", "Office of Student Affairs"],
    floor: "Ground Floor (Level 1)",
    nearby: "In the office row, beside the Learning and Information Center and near the Cashier.",
    directions:
      "Go to the office row beside the Learning and Information Center and look for the Office of Student Affairs.",
    description:
      "Office for student services, concerns, activities, and related campus support.",
  },
  "facility:library": {
    aliases: ["Library", "LIC", "Learning Center", "Learning and Information Center"],
    floor: "Ground Floor (Level 1)",
    nearby: "In the office row, beside the Office of Student Affairs.",
    directions:
      "Go to the office row and look for the large Learning and Information Center beside OSA.",
    description:
      "Campus learning and information area for reading, research, and student resources.",
  },
  "office:cashier": {
    aliases: ["Payment Office", "Cashier's Office", "Cashier"],
    floor: "Ground Floor (Level 1)",
    nearby: "In the office row, between OSA and the Center for Health Services.",
    directions:
      "Go to the office row and look for the Cashier between OSA and the Center for Health Services.",
    description: "Office for payment and other cashier-related student transactions.",
  },
  "office:cfhs": {
    aliases: ["CFHS", "Clinic", "Health Services", "Center for Health Services"],
    floor: "Ground Floor (Level 1)",
    nearby: "In the office row, beside the Cashier and the nearby Comfort Room.",
    directions:
      "Go to the office row and look beside the Cashier.",
    description:
      "Health services office for basic campus medical assistance and support.",
  },
  "facility:radio-station": {
    aliases: ["Radio Room", "Campus Radio", "Radio Station"],
    nearby: "In the separate campus-side area west of the Old Building.",
    directions:
      "From the Old Building, use the map to follow the path toward the separate campus-side radio station area.",
    description: "Campus radio station facility.",
  },
  "food:canteen": {
    aliases: ["Cafeteria", "Food Area", "Campus Canteen"],
    nearby: "Near the Old Building and the main campus walkway.",
    directions:
      "From the main gate, follow the main walkway toward the Old Building and look for the food area nearby.",
    accessibility: "Accessibility features and operating hours are not yet verified. Confirm on site when needed.",
    description: "Campus food area for snacks, meals, and student breaks.",
  },
  "facility:ict": {
    aliases: ["ICT", "Computer Center", "Information and Communication Technology Center"],
    nearby: "Near the Learning and Information Center and the central campus walkway.",
    directions:
      "From the main walkway, use the map highlight to find the ICT Center near the Learning and Information Center.",
    description:
      "Information and Communication Technology Center for technology-related services.",
  },
  "facility:mrf": {
    aliases: ["MRF", "Materials Recovery Facility", "Waste Management Facility"],
    nearby: "In the outer campus service area, south of the Learning and Information Center.",
    directions:
      "From the main building area, use the map highlight to locate the outer campus service area.",
    description: "Materials recovery facility for campus waste management.",
  },
};
