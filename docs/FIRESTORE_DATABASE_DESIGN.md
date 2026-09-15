# UMVCFIND Firestore Database Design

## Firestore Structure

```text
users/{uid}
  recentLocations/{locationId}
  favorites/{locationId}

categories/{categoryId}
buildings/{buildingId}
locations/{locationId}
routes/{routeId}
notifications/{notificationId}
appConfig/campus
```

Guest users do not have a `users` document. Their temporary session and recent searches remain only on their device.

## `users` Collection

Document ID: Firebase Authentication user UID (`uid`)

| Field | Data type | Description |
|---|---|---|
| `email` | String | Authorized University of Mindanao Google email address. |
| `displayName` | String | User's Google display name. |
| `photoUrl` | String \| null | User's Google profile image URL. |
| `role` | String | `user` or `admin`. |
| `isActive` | Boolean | Indicates whether the account may use the system. |
| `createdAt` | Timestamp | Date and time the user document was created. |
| `updatedAt` | Timestamp | Date and time the user document was last updated. |

Example path: `users/firebaseAuthUid`

## `categories` Collection

Document ID: readable category ID, for example `academic-buildings` or `administrative-offices`

| Field | Data type | Description |
|---|---|---|
| `name` | String | Category name displayed in the app. |
| `iconKey` | String | Icon identifier used by the mobile app. |
| `displayOrder` | Number | Order in the category list. |
| `isActive` | Boolean | Indicates whether the category is visible. |
| `createdAt` | Timestamp | Date and time the category was created. |
| `updatedAt` | Timestamp | Date and time the category was last updated. |

Suggested documents: `academic-buildings`, `administrative-offices`, `student-services`, `facilities`, `food-and-dining`, and `entrances-landmarks`.

## `buildings` Collection

Document ID: generated Firestore ID

| Field | Data type | Description |
|---|---|---|
| `buildingCode` | String | Short verified building code, such as `VC-A`. |
| `name` | String | Official building name. |
| `description` | String \| null | Brief building information. |
| `location` | GeoPoint | Building map position. |
| `floorCount` | Number | Total number of floors. |
| `isActive` | Boolean | Indicates whether the building is visible. |
| `createdAt` | Timestamp | Date and time the building was created. |
| `updatedAt` | Timestamp | Date and time the building was last updated. |

## `locations` Collection

Document ID: generated Firestore ID

| Field | Data type | Description |
|---|---|---|
| `name` | String | Location name, such as Registrar's Office or Room 101. |
| `code` | String \| null | Room, office, or facility code. |
| `type` | String | `building`, `room`, `office`, `facility`, `entrance`, or `landmark`. |
| `buildingId` | String \| null | ID of the related document in `buildings`; required for a room or office. |
| `categoryId` | String | ID of the related document in `categories`. |
| `floorLevel` | Number \| null | Floor number; used for rooms and offices. |
| `description` | String \| null | Basic location information. |
| `functionDescription` | String \| null | Office, department, or facility function. |
| `directionsHint` | String \| null | Short instruction for finding the location. |
| `aliases` | Array<String> | Alternative names or search terms. |
| `location` | GeoPoint \| null | Exact map pin. A room may leave this empty and use its building location. |
| `searchKeywords` | Array<String> | Normalized keywords used for simple location searching. |
| `isActive` | Boolean | Indicates whether the location is visible. |
| `createdAt` | Timestamp | Date and time the location was created. |
| `updatedAt` | Timestamp | Date and time the location was last updated. |

## `routes` Collection

Document ID: generated Firestore ID

| Field | Data type | Description |
|---|---|---|
| `originLocationId` | String | ID of the starting document in `locations`. |
| `destinationLocationId` | String | ID of the destination document in `locations`. |
| `distanceMeters` | Number | Estimated walking distance in meters. |
| `estimatedMinutes` | Number | Estimated walking time in minutes. |
| `steps` | Array<Map> | Ordered basic direction steps. Each map contains `instruction` (String) and `order` (Number). |
| `routePoints` | Array<GeoPoint> | Ordered map points used to draw the route. |
| `isAccessible` | Boolean | Indicates whether the route is accessibility-friendly. |
| `isActive` | Boolean | Indicates whether the route may be used. |
| `createdAt` | Timestamp | Date and time the route was created. |
| `updatedAt` | Timestamp | Date and time the route was last updated. |

## `notifications` Collection

Document ID: generated Firestore ID

| Field | Data type | Description |
|---|---|---|
| `title` | String | Notification title. |
| `message` | String | Notification content. |
| `type` | String | `map-update`, `location-update`, or `general`. |
| `createdBy` | String | UID of the administrator who created it. |
| `publishedAt` | Timestamp \| null | Date and time the notification becomes visible. |
| `isActive` | Boolean | Indicates whether the notification is visible. |
| `createdAt` | Timestamp | Date and time the notification was created. |
| `updatedAt` | Timestamp | Date and time the notification was last updated. |

## `users/{uid}/recentLocations` Subcollection

Document ID: `locationId` from the related `locations` document

| Field | Data type | Description |
|---|---|---|
| `locationId` | String | ID of the viewed `locations` document. |
| `viewedAt` | Timestamp | Most recent date and time the user viewed the location. |

Using `locationId` as the document ID prevents duplicate history records for the same location and keeps the latest viewing time.

## `users/{uid}/favorites` Subcollection

Document ID: `locationId` from the related `locations` document

| Field | Data type | Description |
|---|---|---|
| `locationId` | String | ID of the favorited `locations` document. |
| `createdAt` | Timestamp | Date and time the location was added to favorites. |

## `appConfig` Collection

Document ID: `campus`

| Field | Data type | Description |
|---|---|---|
| `campusName` | String | University of Mindanao - Visayan Campus. |
| `allowedEmailDomains` | Array<String> | Confirmed UM Google Workspace domains permitted for Google login. |
| `defaultMapCenter` | GeoPoint | Initial map center. |
| `defaultMapZoom` | Number | Initial map zoom level. |
| `updatedAt` | Timestamp | Date and time the configuration was last updated. |

## Relationships

| Parent data | Related data | Relationship | Stored through |
|---|---|---|---|
| `categories` | `locations` | One category has many locations. | `locations.categoryId` |
| `buildings` | `locations` | One building has many rooms or offices. | `locations.buildingId` |
| `locations` | `routes` | One location can be the start or end of many routes. | `routes.originLocationId`, `routes.destinationLocationId` |
| `users` | `recentLocations` | One signed-in user has many recently viewed locations. | `users/{uid}/recentLocations` |
| `users` | `favorites` | One signed-in user has many favorite locations. | `users/{uid}/favorites` |
| `users` | `notifications` | One administrator can create many notifications. | `notifications.createdBy` |

## Simple Database Diagram

```text
                         categories
                    /{categoryId}
                          |
                          | 1 to many
                          v
buildings -------->   locations   <-------- routes --------> locations
/{buildingId}          /{locationId}       /{routeId}
     |                      ^                 originLocationId
     | 1 to many            |                 destinationLocationId
     +----------------------+                 
       locations.buildingId

users/{uid} ---------------------------------> notifications
     |                                              createdBy
     |
     +-- recentLocations/{locationId} --------> locations/{locationId}
     |
     +-- favorites/{locationId} --------------> locations/{locationId}

appConfig/campus
  - allowedEmailDomains
  - defaultMapCenter
```
