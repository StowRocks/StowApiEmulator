# Stash API Compatibility Analysis

Deep analysis comparing StowApiEmulator implementation against reference Stash server at `~/Source/stash`.

## Executive Summary

**Overall Compatibility: ~60% for iOS app needs, ~5% for full Stash API**

The emulator implements the **minimum viable subset** needed for the Stow iOS app to function, not a complete Stash replacement. It provides read-only TMDB data with minimal write operations (ratings/favorites).

---

## Query Compatibility

### ✅ Implemented Queries

| Query              | Stash Signature                                                | Emulator Signature                         | Compatible?     | Notes                                   |
| ------------------ | -------------------------------------------------------------- | ------------------------------------------ | --------------- | --------------------------------------- |
| `findScenes`       | `findScenes(scene_filter, scene_ids, ids, filter)`             | `findScenes(filter, scene_filter)`         | ⚠️ Partial      | Missing `ids` parameter                 |
| `findPerformers`   | `findPerformers(performer_filter, filter, performer_ids, ids)` | `findPerformers(filter, performer_filter)` | ⚠️ Partial      | Missing `ids` parameter                 |
| `findStudios`      | `findStudios(studio_filter, filter, ids)`                      | `findStudios(filter, studio_filter)`       | ⚠️ Partial      | Missing `ids` parameter                 |
| `findTags`         | `findTags(tag_filter, filter, ids)`                            | `findTags(filter, tag_filter)`             | ⚠️ Partial      | Missing `ids` parameter                 |
| `findSceneMarkers` | `findSceneMarkers(scene_marker_filter, filter, ids)`           | `findSceneMarkers(filter)`                 | ❌ Incompatible | Missing `scene_marker_filter` and `ids` |
| `findGalleries`    | `findGalleries(gallery_filter, filter, ids)`                   | `findGalleries(filter, gallery_filter)`    | ✅ Compatible   | Returns empty (not applicable)          |
| `findGroups`       | `findGroups(group_filter, filter, ids)`                        | `findGroups(filter)`                       | ⚠️ Partial      | Missing `group_filter` and `ids`        |
| `findImages`       | `findImages(image_filter, filter, image_ids, ids)`             | `findImages(filter, image_filter)`         | ⚠️ Partial      | Missing `ids` parameter                 |
| `systemStatus`     | N/A (not in Stash)                                             | `systemStatus()`                           | ✅ Custom       | Emulator-specific                       |

### ❌ Missing Critical Queries

- `findScene(id, checksum)` - Single scene lookup
- `findPerformer(id)` - Single performer lookup
- `findStudio(id)` - Single studio lookup
- `findTag(id)` - Single tag lookup
- `findGallery(id)` - Single gallery lookup
- `findGroup(id)` - Single group lookup
- `findImage(id, checksum)` - Single image lookup

**Impact:** iOS app may fail when trying to fetch individual items by ID.

---

## Type Compatibility

### Scene Type

| Field               | Stash Type                    | Emulator Type   | Compatible? | Notes                                               |
| ------------------- | ----------------------------- | --------------- | ----------- | --------------------------------------------------- |
| `id`                | `ID!`                         | `ID!`           | ✅          |                                                     |
| `title`             | `String`                      | `String`        | ✅          |                                                     |
| `code`              | `String`                      | `String`        | ✅          |                                                     |
| `details`           | `String`                      | `String`        | ✅          |                                                     |
| `director`          | `String`                      | `String`        | ✅          |                                                     |
| `urls`              | `[String!]!`                  | `[String]`      | ⚠️          | Emulator allows null, Stash requires non-null array |
| `date`              | `String`                      | `String`        | ✅          |                                                     |
| `rating100`         | `Int`                         | `Int`           | ✅          |                                                     |
| `organized`         | `Boolean!`                    | `Boolean`       | ⚠️          | Stash requires non-null, emulator allows null       |
| `o_counter`         | `Int`                         | `Int`           | ✅          |                                                     |
| `resume_time`       | `Float`                       | `Float`         | ✅          |                                                     |
| `play_duration`     | `Float`                       | `Float`         | ✅          |                                                     |
| `play_count`        | `Int`                         | `Int`           | ✅          |                                                     |
| `paths`             | `ScenePathsType!`             | `ScenePaths`    | ⚠️          | Different type names                                |
| `files`             | `[VideoFile!]!`               | `[VideoFile]`   | ⚠️          | Emulator allows null                                |
| `performers`        | `[Performer!]!`               | `[Performer]`   | ⚠️          | Emulator allows null                                |
| `tags`              | `[Tag!]!`                     | `[Tag]`         | ⚠️          | Emulator allows null                                |
| `studio`            | `Studio`                      | `Studio`        | ✅          |                                                     |
| `scene_markers`     | `[SceneMarker!]!`             | `[SceneMarker]` | ⚠️          | Emulator allows null                                |
| `galleries`         | `[Gallery!]!`                 | `[Gallery]`     | ⚠️          | Emulator allows null                                |
| **Missing Fields**  |                               |                 |             |                                                     |
| `url`               | `String` (deprecated)         | ❌              | ❌          | Not implemented                                     |
| `interactive`       | `Boolean!`                    | ❌              | ❌          | Not implemented                                     |
| `interactive_speed` | `Int`                         | ❌              | ❌          | Not implemented                                     |
| `captions`          | `[VideoCaption!]`             | ❌              | ❌          | Not implemented                                     |
| `created_at`        | `Time!`                       | ❌              | ❌          | Not implemented                                     |
| `updated_at`        | `Time!`                       | ❌              | ❌          | Not implemented                                     |
| `last_played_at`    | `Time`                        | ❌              | ❌          | Not implemented                                     |
| `play_history`      | `[Time!]!`                    | ❌              | ❌          | Not implemented                                     |
| `o_history`         | `[Time!]!`                    | ❌              | ❌          | Not implemented                                     |
| `groups`            | `[SceneGroup!]!`              | ❌              | ❌          | Not implemented                                     |
| `movies`            | `[SceneMovie!]!` (deprecated) | ❌              | ❌          | Not implemented                                     |
| `stash_ids`         | `[StashID!]!`                 | ❌              | ❌          | Not implemented                                     |
| `sceneStreams`      | `[SceneStreamEndpoint!]!`     | ❌              | ❌          | Not implemented                                     |

**Compatibility: 60% of iOS app required fields, 30% of all Stash fields**

### ScenePaths Type

| Field                 | Stash    | Emulator | Compatible? |
| --------------------- | -------- | -------- | ----------- |
| `screenshot`          | `String` | `String` | ✅          |
| `preview`             | `String` | ❌       | ❌          |
| `stream`              | `String` | `String` | ✅          |
| `webp`                | `String` | ❌       | ❌          |
| `vtt`                 | `String` | `String` | ✅          |
| `sprite`              | `String` | `String` | ✅          |
| `funscript`           | `String` | ❌       | ❌          |
| `interactive_heatmap` | `String` | ❌       | ❌          |
| `caption`             | `String` | ❌       | ❌          |

**Compatibility: 44%**

### Performer Type

| Field                | Stash Type               | Emulator Type | Compatible? | Notes                               |
| -------------------- | ------------------------ | ------------- | ----------- | ----------------------------------- |
| `id`                 | `ID!`                    | `ID!`         | ✅          |                                     |
| `name`               | `String!`                | `String`      | ⚠️          | Stash requires non-null             |
| `disambiguation`     | `String`                 | `String`      | ✅          |                                     |
| `urls`               | `[String!]!`             | `[String]`    | ⚠️          | Different nullability               |
| `gender`             | `GenderEnum`             | `String`      | ⚠️          | Emulator uses String, not enum      |
| `favorite`           | `Boolean!`               | `Boolean`     | ⚠️          | Stash requires non-null             |
| `rating100`          | `Int`                    | `Int`         | ✅          |                                     |
| `image_path`         | `String`                 | `String`      | ✅          |                                     |
| `scene_count`        | `Int!`                   | `Int`         | ⚠️          | Stash requires non-null             |
| **All other fields** | Various                  | Implemented   | ✅          | twitter, instagram, birthdate, etc. |
| **Missing Fields**   |                          |               |             |                                     |
| `tags`               | `[Tag!]!`                | ❌            | ❌          | Not implemented                     |
| `scenes`             | `[Scene!]!`              | ❌            | ❌          | Not implemented                     |
| `stash_ids`          | `[StashID!]!`            | ❌            | ❌          | Not implemented                     |
| `created_at`         | `Time!`                  | ❌            | ❌          | Not implemented                     |
| `updated_at`         | `Time!`                  | ❌            | ❌          | Not implemented                     |
| `groups`             | `[Group!]!`              | ❌            | ❌          | Not implemented                     |
| `movies`             | `[Movie!]!` (deprecated) | ❌            | ❌          | Not implemented                     |
| `custom_fields`      | `Map!`                   | ❌            | ❌          | Not implemented                     |

**Compatibility: 70% of iOS app required fields, 40% of all Stash fields**

### Studio Type

| Field              | Stash Type            | Emulator Type | Compatible? | Notes                   |
| ------------------ | --------------------- | ------------- | ----------- | ----------------------- |
| `id`               | `ID!`                 | `ID!`         | ✅          |                         |
| `name`             | `String!`             | `String`      | ⚠️          | Stash requires non-null |
| `url`              | `String` (deprecated) | `String`      | ✅          |                         |
| `urls`             | `[String!]!`          | ❌            | ❌          | Not implemented         |
| `parent_studio`    | `Studio`              | `Studio`      | ✅          |                         |
| `child_studios`    | `[Studio!]!`          | `[Studio]`    | ⚠️          | Different nullability   |
| `image_path`       | `String`              | `String`      | ✅          |                         |
| `scene_count`      | `Int!` (with depth)   | `Int`         | ⚠️          | Missing depth parameter |
| `rating100`        | `Int`                 | `Int`         | ✅          |                         |
| `details`          | `String`              | `String`      | ✅          |                         |
| `aliases`          | `[String!]!`          | `[String]`    | ⚠️          | Different nullability   |
| **Missing Fields** |                       |               |             |                         |
| `tags`             | `[Tag!]!`             | ❌            | ❌          | Not implemented         |
| `ignore_auto_tag`  | `Boolean!`            | ❌            | ❌          | Not implemented         |
| `image_count`      | `Int!` (with depth)   | ❌            | ❌          | Not implemented         |
| `gallery_count`    | `Int!` (with depth)   | ❌            | ❌          | Not implemented         |
| `performer_count`  | `Int!` (with depth)   | ❌            | ❌          | Not implemented         |
| `group_count`      | `Int!` (with depth)   | ❌            | ❌          | Not implemented         |
| `stash_ids`        | `[StashID!]!`         | ❌            | ❌          | Not implemented         |
| `favorite`         | `Boolean!`            | ❌            | ❌          | Not implemented         |
| `created_at`       | `Time!`               | ❌            | ❌          | Not implemented         |
| `updated_at`       | `Time!`               | ❌            | ❌          | Not implemented         |
| `groups`           | `[Group!]!`           | ❌            | ❌          | Not implemented         |
| `o_counter`        | `Int`                 | ❌            | ❌          | Not implemented         |
| `custom_fields`    | `Map!`                | ❌            | ❌          | Not implemented         |

**Compatibility: 60% of iOS app required fields, 30% of all Stash fields**

### Tag Type

| Field                | Stash Type          | Emulator Type | Compatible? | Notes                       |
| -------------------- | ------------------- | ------------- | ----------- | --------------------------- |
| `id`                 | `ID!`               | `ID!`         | ✅          |                             |
| `name`               | `String!`           | `String`      | ⚠️          | Stash requires non-null     |
| `description`        | `String`            | `String`      | ✅          |                             |
| `sort_name`          | `String`            | `String`      | ✅          |                             |
| `favorite`           | `Boolean!`          | `Boolean`     | ⚠️          | Stash requires non-null     |
| `aliases`            | `[String!]!`        | `[String]`    | ⚠️          | Different nullability       |
| `ignore_auto_tag`    | `Boolean!`          | `Boolean`     | ⚠️          | Stash requires non-null     |
| `scene_count`        | `Int!` (with depth) | `Int`         | ⚠️          | Missing depth parameter     |
| `performer_count`    | `Int!` (with depth) | `Int`         | ⚠️          | Missing depth parameter     |
| `scene_marker_count` | `Int!` (with depth) | `Int`         | ⚠️          | Missing depth parameter     |
| `image_path`         | `String`            | `String`      | ✅          |                             |
| `image_count`        | `Int!` (with depth) | `Int`         | ⚠️          | Missing depth parameter     |
| `gallery_count`      | `Int!` (with depth) | `Int`         | ⚠️          | Missing depth parameter     |
| `parent_count`       | `Int!`              | `Int`         | ⚠️          | Stash requires non-null     |
| `child_count`        | `Int!`              | `Int`         | ⚠️          | Stash requires non-null     |
| `created_at`         | `Time!`             | `String`      | ⚠️          | Wrong type (String vs Time) |
| `updated_at`         | `Time!`             | `String`      | ⚠️          | Wrong type (String vs Time) |
| `parents`            | `[Tag!]!`           | `[Tag]`       | ⚠️          | Different nullability       |
| `children`           | `[Tag!]!`           | `[Tag]`       | ⚠️          | Different nullability       |
| **Missing Fields**   |                     |               |             |                             |
| `stash_ids`          | `[StashID!]!`       | ❌            | ❌          | Not implemented             |
| `studio_count`       | `Int!` (with depth) | ❌            | ❌          | Not implemented             |
| `group_count`        | `Int!` (with depth) | ❌            | ❌          | Not implemented             |
| `custom_fields`      | `Map!`              | ❌            | ❌          | Not implemented             |

**Compatibility: 75% of iOS app required fields, 50% of all Stash fields**

### SceneMarker Type

| Field              | Stash Type | Emulator Type | Compatible? | Notes                   |
| ------------------ | ---------- | ------------- | ----------- | ----------------------- |
| `id`               | `ID!`      | `ID!`         | ✅          |                         |
| `title`            | `String!`  | `String`      | ⚠️          | Stash requires non-null |
| `seconds`          | `Float!`   | `Float`       | ⚠️          | Stash requires non-null |
| `screenshot`       | `String!`  | `String`      | ⚠️          | Stash requires non-null |
| `preview`          | `String!`  | `String`      | ⚠️          | Stash requires non-null |
| `stream`           | `String!`  | `String`      | ⚠️          | Stash requires non-null |
| `primary_tag`      | `Tag!`     | `Tag`         | ⚠️          | Stash requires non-null |
| `tags`             | `[Tag!]!`  | `[Tag]`       | ⚠️          | Different nullability   |
| `scene`            | `Scene!`   | `Scene`       | ⚠️          | Stash requires non-null |
| **Missing Fields** |            |               |             |                         |
| `end_seconds`      | `Float`    | ❌            | ❌          | Not implemented         |
| `created_at`       | `Time!`    | ❌            | ❌          | Not implemented         |
| `updated_at`       | `Time!`    | ❌            | ❌          | Not implemented         |

**Compatibility: 75% of iOS app required fields, 60% of all Stash fields**

---

## Mutation Compatibility

### ✅ Implemented Mutations

| Mutation          | Stash Signature                                 | Emulator Signature                              | Compatible? | Notes                                               |
| ----------------- | ----------------------------------------------- | ----------------------------------------------- | ----------- | --------------------------------------------------- |
| `sceneUpdate`     | `sceneUpdate(input: SceneUpdateInput!)`         | `sceneUpdate(input: SceneUpdateInput!)`         | ⚠️ Partial  | Only supports `rating100`, `organized`, `o_counter` |
| `performerUpdate` | `performerUpdate(input: PerformerUpdateInput!)` | `performerUpdate(input: PerformerUpdateInput!)` | ⚠️ Partial  | Only supports `favorite`, `rating100`               |

### ❌ Missing Critical Mutations

**Scene Mutations:**

- `sceneCreate` - Create new scenes
- `sceneMerge` - Merge scenes
- `bulkSceneUpdate` - Bulk updates
- `sceneDestroy` - Delete scenes
- `sceneAddO` / `sceneDeleteO` - O-counter with timestamps
- `sceneAddPlay` / `sceneDeletePlay` - Play count with timestamps
- `sceneSaveActivity` - Resume time and play duration
- `sceneGenerateScreenshot` - Generate screenshots

**Performer Mutations:**

- `performerCreate` - Create performers
- `performerDestroy` - Delete performers
- `bulkPerformerUpdate` - Bulk updates
- `performerMerge` - Merge performers

**Studio/Tag/Marker Mutations:**

- All create/update/destroy operations
- Bulk operations
- Merge operations

**Impact:** iOS app cannot create, delete, or fully update any entities.

---

## Input Type Compatibility

### SceneUpdateInput

| Field                | Stash              | Emulator  | Compatible? |
| -------------------- | ------------------ | --------- | ----------- |
| `id`                 | `ID!`              | `ID!`     | ✅          |
| `rating100`          | `Int`              | `Int`     | ✅          |
| `organized`          | `Boolean`          | `Boolean` | ✅          |
| `o_counter`          | `Int` (deprecated) | `Int`     | ✅          |
| **All other fields** | Various            | ❌        | ❌          |

**Compatibility: 15% of all fields**

### PerformerUpdateInput

| Field                | Stash     | Emulator  | Compatible? |
| -------------------- | --------- | --------- | ----------- |
| `id`                 | `ID!`     | `ID!`     | ✅          |
| `favorite`           | `Boolean` | `Boolean` | ✅          |
| `rating100`          | `Int`     | `Int`     | ✅          |
| **All other fields** | Various   | ❌        | ❌          |

**Compatibility: 10% of all fields**

---

## Filter Compatibility

### FindFilterType

| Field       | Stash               | Emulator | Compatible? | Notes                          |
| ----------- | ------------------- | -------- | ----------- | ------------------------------ |
| `q`         | `String`            | `String` | ✅          | Text search                    |
| `page`      | `Int`               | `Int`    | ✅          | Pagination                     |
| `per_page`  | `Int`               | `Int`    | ✅          | Page size                      |
| `sort`      | `String`            | `String` | ✅          | Sort field                     |
| `direction` | `SortDirectionEnum` | `String` | ⚠️          | Emulator uses String, not enum |

**Compatibility: 100% for basic fields**

### SceneFilterType

| Field                 | Stash                             | Emulator                          | Compatible? | Notes                        |
| --------------------- | --------------------------------- | --------------------------------- | ----------- | ---------------------------- |
| `performers`          | `MultiCriterionInput`             | `MultiCriterionInput`             | ✅          | Filter by performers         |
| `tags`                | `HierarchicalMultiCriterionInput` | `HierarchicalMultiCriterionInput` | ⚠️          | Missing depth support        |
| `studios`             | `HierarchicalMultiCriterionInput` | `HierarchicalMultiCriterionInput` | ⚠️          | Missing depth support        |
| **All other filters** | Various                           | ❌                                | ❌          | rating, date, duration, etc. |

**Compatibility: 15% of all filters**

### PerformerFilterType

| Field                 | Stash                  | Emulator               | Compatible? |
| --------------------- | ---------------------- | ---------------------- | ----------- |
| `name`                | `StringCriterionInput` | `StringCriterionInput` | ✅          |
| `favorite`            | `Boolean`              | `Boolean`              | ✅          |
| **All other filters** | Various                | ❌                     | ❌          |

**Compatibility: 10% of all filters**

---

## Critical Incompatibilities

### 1. **Non-Null Type Mismatches**

**Problem:** Stash uses `!` (non-null) for many fields, emulator allows null.

**Examples:**

- `Scene.organized: Boolean!` (Stash) vs `Boolean` (Emulator)
- `Scene.urls: [String!]!` (Stash) vs `[String]` (Emulator)
- `Performer.name: String!` (Stash) vs `String` (Emulator)
- `Performer.favorite: Boolean!` (Stash) vs `Boolean` (Emulator)

**Impact:** GraphQL clients expecting non-null values may crash when receiving null.

**Fix Required:** Add `!` to all required fields in emulator schema.

### 2. **Missing `ids` Parameter**

**Problem:** All Stash `find*` queries support `ids: [ID!]` for fetching specific items. Emulator doesn't support this.

**Impact:** iOS app cannot fetch specific items by ID list.

**Fix Required:** Add `ids` parameter to all find queries and implement filtering.

### 3. **Missing Single Item Queries**

**Problem:** Stash has `findScene(id)`, `findPerformer(id)`, etc. Emulator doesn't.

**Impact:** iOS app cannot fetch individual items by ID.

**Fix Required:** Implement single-item queries for all types.

### 4. **Type vs String for Enums**

**Problem:**

- Stash: `gender: GenderEnum` (MALE, FEMALE, etc.)
- Emulator: `gender: String`

**Impact:** Type safety lost, invalid values possible.

**Fix Required:** Define proper enum types.

### 5. **Time vs String for Timestamps**

**Problem:**

- Stash: `created_at: Time!` (custom scalar)
- Emulator: `created_at: String` or missing

**Impact:** Date parsing issues, timezone problems.

**Fix Required:** Implement `Time` scalar type.

### 6. **Missing Depth Parameters**

**Problem:** Stash count fields support `depth` parameter for hierarchical queries:

- `scene_count(depth: Int): Int!`
- `tag.scene_count(depth: 2)` counts scenes in tag and child tags

**Impact:** Cannot query hierarchical data correctly.

**Fix Required:** Add depth parameter support to all count fields.

### 7. **Missing Filter Modifiers**

**Problem:** Stash filters support complex modifiers:

- `EQUALS`, `NOT_EQUALS`, `GREATER_THAN`, `LESS_THAN`
- `INCLUDES`, `EXCLUDES`, `IS_NULL`, `NOT_NULL`
- `MATCHES_REGEX`, `NOT_MATCHES_REGEX`

Emulator only supports basic equality.

**Impact:** Advanced filtering doesn't work.

**Fix Required:** Implement full filter modifier support.

---

## Recommendations

### For iOS App Compatibility (Priority 1)

1. **Add non-null markers** to required fields:

   ```graphql
   organized: Boolean!
   favorite: Boolean!
   urls: [String!]!
   ```

2. **Implement single-item queries:**

   ```graphql
   findScene(id: ID!): Scene
   findPerformer(id: ID!): Performer
   findStudio(id: ID!): Studio
   findTag(id: ID!): Tag
   ```

3. **Add `ids` parameter** to all find queries:

   ```graphql
   findScenes(ids: [ID!], filter: FindFilterType, scene_filter: SceneFilterType)
   ```

4. **Fix enum types:**
   ```graphql
   enum GenderEnum { MALE, FEMALE, TRANSGENDER_MALE, TRANSGENDER_FEMALE, INTERSEX, NON_BINARY }
   gender: GenderEnum
   ```

### For Full Stash Compatibility (Priority 2)

5. **Implement Time scalar:**

   ```graphql
   scalar Time
   created_at: Time!
   updated_at: Time!
   ```

6. **Add depth parameters:**

   ```graphql
   scene_count(depth: Int): Int!
   ```

7. **Implement missing mutations:**
   - Create operations
   - Destroy operations
   - Bulk operations
   - Merge operations

8. **Add missing fields:**
   - `stash_ids`
   - `custom_fields`
   - `play_history` / `o_history`
   - `groups` / `movies`

### For Production Use (Priority 3)

9. **Implement proper error handling:**
   - GraphQL error extensions
   - Validation errors
   - Not found errors

10. **Add pagination metadata:**
    - `hasNextPage`
    - `hasPreviousPage`
    - `totalPages`

---

## Conclusion

**Current State:**

- ✅ **Works for basic iOS app usage** - Browsing scenes, performers, studios, tags
- ✅ **Supports minimal mutations** - Ratings and favorites
- ⚠️ **Type safety issues** - Nullability mismatches
- ❌ **Not a drop-in Stash replacement** - Missing 95% of mutations and advanced features

**To achieve 100% iOS app compatibility:**

- Fix non-null type mismatches (1-2 hours)
- Implement single-item queries (2-3 hours)
- Add `ids` parameter support (1-2 hours)
- Fix enum types (1 hour)

**To achieve full Stash API compatibility:**

- Implement all mutations (~40 hours)
- Add all missing fields (~20 hours)
- Implement advanced filtering (~10 hours)
- Add depth parameters (~5 hours)
- Implement Time scalar (~2 hours)
- **Total: ~80+ hours of development**

**Recommendation:** Focus on Priority 1 fixes for iOS app compatibility. Full Stash compatibility is not necessary for the emulator's intended use case (demo/development with TMDB data).
