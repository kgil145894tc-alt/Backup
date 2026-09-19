# UMVCFIND Firestore Database Design

## Firestore Structure

```text
users/{uid}
  recentLocations/{locationId}
  favorites/{locationId}
  notificationReads/{notificationId}

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
| `photoUrl` | String \| null | User's Google profile image URL. Synced from Google login when available. |
| `role` | String | `user` or `admin`. |
| `isActive` | Boolean | Indicates whether the account may use the system. |
| `createdAt` | Timestamp | Date and time the user document was created. |
| `updatedAt` | Timestamp | Date and time the user document was last updated. |

Example path: `users/firebaseAuthUid`

New Google users are created with `role: "user"`. Administrator role changes should be done only through an authorized admin account or the Firebase Console.

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

Document ID: `${featureType}:${featureId}`

| Field | Data type | Description |
|---|---|---|
| `featureId` | String | ID of the viewed campus feature. |
| `featureType` | String | Feature type, such as `building`, `office`, `room`, or `facility`. |
| `name` | String | Display name captured when the feature was opened. |
| `category` | String | Category captured when the feature was opened. |
| `type` | String | Type label captured for display in search/history lists. |
| `userId` | String | Firebase Authentication UID of the signed-in user. |
| `viewedAt` | Number | Millisecond timestamp used for sorting recent places. |
| `viewedAtTimestamp` | Timestamp | Server timestamp for the latest view event. |

Using `${featureType}:${featureId}` as the document ID prevents duplicate history records for the same place and keeps the latest viewing time.

## `users/{uid}/favorites` Subcollection

Document ID: `locationId` from the related `locations` document

| Field | Data type | Description |
|---|---|---|
| `locationId` | String | ID of the favorited `locations` document. |
| `createdAt` | Timestamp | Date and time the location was added to favorites. |

## `users/{uid}/notificationReads` Subcollection

Document ID: `notificationId` from the related `notifications` document

| Field | Data type | Description |
|---|---|---|
| `notificationId` | String | ID of the notification that the user opened. |
| `userId` | String | Firebase Authentication UID of the signed-in user. |
| `readAt` | Timestamp | Date and time the notification was marked read. |
| `readAtMs` | Number | Millisecond timestamp used by the app as a simple fallback value. |

This keeps notification content public while each signed-in user's read/unread state stays private to that account.

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
| `users` | `recentLocations` | One signed-in user has many recently viewed features. | `users/{uid}/recentLocations` |
| `users` | `favorites` | One signed-in user has many favorite locations. | `users/{uid}/favorites` |
| `users` | `notificationReads` | One signed-in user has many read notification markers. | `users/{uid}/notificationReads` |
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
     +-- recentLocations/{featureType:featureId} --> locations/rooms/map features
     |
     +-- favorites/{locationId} --------------> locations/{locationId}
     |
     +-- notificationReads/{notificationId} --> notifications/{notificationId}

appConfig/campus
  - allowedEmailDomains
  - defaultMapCenter
```
