import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import ProceedArrow from "../../../assets/design/icons/proceed-arrow.svg";
import OfficialPage, { officialDetailStyles } from "@/components/OfficialPage";
import { loadCampusData } from "../../services/campusDataStore";
import {
  initialAdminLocations,
  isMaintenanceAdminLocation,
  type AdminLocation,
} from "../../utils/adminLocations";
import { saveCurrentHistoryItem } from "../../utils/guestHistory";

function getFeatureFromParams(
  features: AdminLocation[],
  featureId?: string,
  featureType?: string,
) {
  if (!featureId || !featureType) {
    return undefined;
  }

  return features.find(
    (feature) => feature.id === featureId && feature.type === featureType,
  );
}

export default function LocationDetailsScreen() {
  const { featureId, featureType } = useLocalSearchParams<{
    featureId?: string;
    featureType?: string;
  }>();
  const [features, setFeatures] =
    useState<AdminLocation[]>(initialAdminLocations);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      void loadCampusData().then((snapshot) => {
        if (isActive) {
          setFeatures(snapshot.visibleLocations);
        }
      });

      return () => {
        isActive = false;
      };
    }, []),
  );

  const feature = useMemo(
    () => getFeatureFromParams(features, featureId, featureType),
    [featureId, featureType, features],
  );

  useEffect(() => {
    if (!feature) {
      return;
    }

    void saveCurrentHistoryItem({
      featureId: feature.id,
      featureType: feature.type,
      name: feature.name,
      category: feature.category,
      type: feature.type,
    });
  }, [feature]);

  if (!feature) {
    return (
      <OfficialPage title="Location not found" subtitle="This campus place is unavailable.">
        <Pressable style={officialDetailStyles.button} onPress={() => router.back()}>
          <Text style={officialDetailStyles.buttonText}>Go Back</Text>
        </Pressable>
      </OfficialPage>
    );
  }

  return (
    <OfficialPage title={feature.name} subtitle={feature.category}>
      {isMaintenanceAdminLocation(feature) ? (
        <View style={styles.statusNotice}>
          <Text style={styles.statusNoticeText}>
            This location is currently marked as under maintenance.
          </Text>
        </View>
      ) : null}

      <View style={styles.detailGrid}>
        <DetailItem label="Type" value={feature.type} />
        <DetailItem label="Category" value={feature.category} />
        {feature.floors !== undefined ? (
          <DetailItem label="Floors" value={String(feature.floors)} />
        ) : null}
        {feature.floor ? <DetailItem label="Floor" value={feature.floor} /> : null}
      </View>

      {feature.aliases?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Also Known As</Text>
          <View style={styles.aliasList}>
            {feature.aliases.map((alias) => (
              <Text key={alias} style={styles.aliasPill}>
                {alias}
              </Text>
            ))}
          </View>
        </View>
      ) : null}

      <InfoSection title="Description">
        {feature.description ??
          "No description has been added for this location yet."}
      </InfoSection>

      <InfoSection title="Navigation">
        {feature.directions ??
          "Open this place on the campus map to highlight its exact building or room shape."}
      </InfoSection>

      {feature.nearby ? (
        <InfoSection title="Nearby">{feature.nearby}</InfoSection>
      ) : null}

      {feature.accessibility ? (
        <InfoSection title="Accessibility">{feature.accessibility}</InfoSection>
      ) : null}

      <Pressable
        style={officialDetailStyles.button}
        onPress={() => {
          if (feature.type === "building") {
            router.push({
              pathname: "/building-floors",
              params: { buildingId: feature.id },
            });
            return;
          }

          router.push({
            pathname: "/(tabs)/map",
            params: {
              featureId: feature.id,
              featureType: feature.type,
              locateOnly: "1",
            },
          });
        }}
      >
        <Text style={officialDetailStyles.buttonText}>
          {feature.type === "building" ? "View Floors and Rooms" : "View on Map"}
        </Text>
        <ProceedArrow width={16} height={19} accessible={false} />
      </Pressable>
    </OfficialPage>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function InfoSection({
  children,
  title,
}: {
  children: string;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={officialDetailStyles.bodyText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 22,
  },

  statusNotice: {
    backgroundColor: "#F7E5E3",
    borderColor: "#CDA6AA",
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 18,
    padding: 12,
  },

  statusNoticeText: {
    color: "#AF2532",
    fontFamily: "HelpBold",
    fontSize: 14,
    lineHeight: 20,
  },

  detailItem: {
    ...officialDetailStyles.card,
    flexGrow: 1,
    minWidth: 120,
    padding: 14,
  },

  detailLabel: {
    color: "#6C757D",
    fontFamily: "HelpBold",
    fontSize: 12,
    marginBottom: 5,
    textTransform: "uppercase",
  },

  detailValue: {
    color: "#3C4147",
    fontFamily: "HelpBold",
    fontSize: 16,
    textTransform: "capitalize",
  },

  section: {
    marginBottom: 20,
  },

  aliasList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  aliasPill: {
    backgroundColor: "#F7E5E3",
    borderColor: "#CDA6AA",
    borderRadius: 999,
    borderWidth: 1,
    color: "#3C4147",
    fontFamily: "HelpBold",
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  sectionTitle: {
    color: "#AF2532",
    fontFamily: "HelpBold",
    fontSize: 18,
    marginBottom: 8,
  },
});
