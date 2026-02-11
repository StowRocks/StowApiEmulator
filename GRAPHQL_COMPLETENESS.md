# GraphQL API Completeness Comparison

Comparison between Stow API Emulator and original Stash server GraphQL schemas.

## Query Operations

| Query                         | Stash           | Emulator | Notes                              |
| ----------------------------- | --------------- | -------- | ---------------------------------- |
| **Filters**                   |
| `findSavedFilter`             | ✅              | ❌       |                                    |
| `findSavedFilters`            | ✅              | ❌       |                                    |
| `findDefaultFilter`           | ✅ (deprecated) | ❌       |                                    |
| **Files**                     |
| `findFile`                    | ✅              | ❌       |                                    |
| `findFiles`                   | ✅              | ❌       |                                    |
| `findFolder`                  | ✅              | ❌       |                                    |
| `findFolders`                 | ✅              | ❌       |                                    |
| **Scenes**                    |
| `findScene`                   | ✅              | ❌       | Single scene by ID/checksum        |
| `findSceneByHash`             | ✅              | ❌       |                                    |
| `findScenes`                  | ✅              | ✅       | **Implemented** - TMDB data source |
| `findScenesByPathRegex`       | ✅              | ❌       |                                    |
| `findDuplicateScenes`         | ✅              | ❌       |                                    |
| `sceneStreams`                | ✅              | ❌       |                                    |
| `parseSceneFilenames`         | ✅              | ❌       |                                    |
| **Scene Markers**             |
| `findSceneMarkers`            | ✅              | ❌       |                                    |
| `markerWall`                  | ✅              | ❌       |                                    |
| `sceneMarkerTags`             | ✅              | ❌       |                                    |
| `markerStrings`               | ✅              | ❌       |                                    |
| **Images**                    |
| `findImage`                   | ✅              | ❌       |                                    |
| `findImages`                  | ✅              | ❌       |                                    |
| **Performers**                |
| `findPerformer`               | ✅              | ❌       | Single performer by ID             |
| `findPerformers`              | ✅              | ✅       | **Implemented** - TMDB cast data   |
| `allPerformers`               | ✅              | ❌       | Deprecated in Stash                |
| **Studios**                   |
| `findStudio`                  | ✅              | ❌       |                                    |
| `findStudios`                 | ✅              | ❌       |                                    |
| `allStudios`                  | ✅ (deprecated) | ❌       |                                    |
| **Movies/Groups**             |
| `findMovie`                   | ✅ (deprecated) | ❌       |                                    |
| `findMovies`                  | ✅ (deprecated) | ❌       |                                    |
| `findGroup`                   | ✅              | ❌       |                                    |
| `findGroups`                  | ✅              | ❌       |                                    |
| `allMovies`                   | ✅ (deprecated) | ❌       |                                    |
| **Galleries**                 |
| `findGallery`                 | ✅              | ❌       |                                    |
| `findGalleries`               | ✅              | ❌       |                                    |
| `allGalleries`                | ✅ (deprecated) | ❌       |                                    |
| **Tags**                      |
| `findTag`                     | ✅              | ❌       |                                    |
| `findTags`                    | ✅              | ❌       |                                    |
| `allTags`                     | ✅ (deprecated) | ❌       |                                    |
| **Wall**                      |
| `sceneWall`                   | ✅              | ❌       | Random scenes                      |
| **Stats**                     |
| `stats`                       | ✅              | ❌       |                                    |
| **Logs**                      |
| `logs`                        | ✅              | ❌       |                                    |
| **Scrapers**                  |
| `listScrapers`                | ✅              | ❌       |                                    |
| `scrapeSingleScene`           | ✅              | ❌       |                                    |
| `scrapeMultiScenes`           | ✅              | ❌       |                                    |
| `scrapeSingleStudio`          | ✅              | ❌       |                                    |
| `scrapeSingleTag`             | ✅              | ❌       |                                    |
| `scrapeSinglePerformer`       | ✅              | ❌       |                                    |
| `scrapeMultiPerformers`       | ✅              | ❌       |                                    |
| `scrapeSingleGallery`         | ✅              | ❌       |                                    |
| `scrapeSingleMovie`           | ✅ (deprecated) | ❌       |                                    |
| `scrapeSingleGroup`           | ✅              | ❌       |                                    |
| `scrapeSingleImage`           | ✅              | ❌       |                                    |
| `scrapeURL`                   | ✅              | ❌       |                                    |
| `scrapePerformerURL`          | ✅              | ❌       |                                    |
| `scrapeSceneURL`              | ✅              | ❌       |                                    |
| `scrapeGalleryURL`            | ✅              | ❌       |                                    |
| `scrapeImageURL`              | ✅              | ❌       |                                    |
| `scrapeMovieURL`              | ✅ (deprecated) | ❌       |                                    |
| `scrapeGroupURL`              | ✅              | ❌       |                                    |
| **Plugins**                   |
| `plugins`                     | ✅              | ❌       |                                    |
| `pluginTasks`                 | ✅              | ❌       |                                    |
| **Packages**                  |
| `installedPackages`           | ✅              | ❌       |                                    |
| `availablePackages`           | ✅              | ❌       |                                    |
| **Config**                    |
| `configuration`               | ✅              | ❌       |                                    |
| `directory`                   | ✅              | ❌       |                                    |
| `validateStashBoxCredentials` | ✅              | ❌       |                                    |
| **System**                    |
| `systemStatus`                | ✅              | ✅       | **Implemented** - Basic status     |
| `jobQueue`                    | ✅              | ❌       |                                    |
| `findJob`                     | ✅              | ❌       |                                    |
| `dlnaStatus`                  | ✅              | ❌       |                                    |
| `version`                     | ✅              | ❌       |                                    |
| `latestversion`               | ✅              | ❌       |                                    |

**Query Summary:** 2/80+ implemented (2.5%)

---

## Mutation Operations

| Mutation                       | Stash           | Emulator | Notes                                  |
| ------------------------------ | --------------- | -------- | -------------------------------------- |
| **Setup**                      |
| `setup`                        | ✅              | ❌       |                                        |
| `migrate`                      | ✅              | ❌       |                                        |
| `downloadFFMpeg`               | ✅              | ❌       |                                        |
| **Scene Mutations**            |
| `sceneCreate`                  | ✅              | ❌       |                                        |
| `sceneUpdate`                  | ✅              | ✅       | **Implemented** - rating100, organized |
| `sceneMerge`                   | ✅              | ❌       |                                        |
| `bulkSceneUpdate`              | ✅              | ❌       |                                        |
| `sceneDestroy`                 | ✅              | ❌       |                                        |
| `scenesDestroy`                | ✅              | ❌       |                                        |
| `scenesUpdate`                 | ✅              | ❌       |                                        |
| `sceneIncrementO`              | ✅ (deprecated) | ❌       | O-counter                              |
| `sceneDecrementO`              | ✅ (deprecated) | ❌       | O-counter                              |
| `sceneAddO`                    | ✅              | ❌       | O-counter with timestamps              |
| `sceneDeleteO`                 | ✅              | ❌       | O-counter with timestamps              |
| `sceneResetO`                  | ✅              | ❌       | O-counter                              |
| `sceneSaveActivity`            | ✅              | ❌       | Resume time, play duration             |
| `sceneResetActivity`           | ✅              | ❌       |                                        |
| `sceneIncrementPlayCount`      | ✅ (deprecated) | ❌       |                                        |
| `sceneAddPlay`                 | ✅              | ❌       | Play count with timestamps             |
| `sceneDeletePlay`              | ✅              | ❌       |                                        |
| `sceneResetPlayCount`          | ✅              | ❌       |                                        |
| `sceneGenerateScreenshot`      | ✅              | ❌       |                                        |
| `sceneAssignFile`              | ✅              | ❌       |                                        |
| **Scene Marker Mutations**     |
| `sceneMarkerCreate`            | ✅              | ❌       |                                        |
| `sceneMarkerUpdate`            | ✅              | ❌       |                                        |
| `bulkSceneMarkerUpdate`        | ✅              | ❌       |                                        |
| `sceneMarkerDestroy`           | ✅              | ❌       |                                        |
| `sceneMarkersDestroy`          | ✅              | ❌       |                                        |
| **Image Mutations**            |
| `imageUpdate`                  | ✅              | ❌       |                                        |
| `bulkImageUpdate`              | ✅              | ❌       |                                        |
| `imageDestroy`                 | ✅              | ❌       |                                        |
| `imagesDestroy`                | ✅              | ❌       |                                        |
| `imagesUpdate`                 | ✅              | ❌       |                                        |
| `imageIncrementO`              | ✅              | ❌       |                                        |
| `imageDecrementO`              | ✅              | ❌       |                                        |
| `imageResetO`                  | ✅              | ❌       |                                        |
| **Gallery Mutations**          |
| `galleryCreate`                | ✅              | ❌       |                                        |
| `galleryUpdate`                | ✅              | ❌       |                                        |
| `bulkGalleryUpdate`            | ✅              | ❌       |                                        |
| `galleryDestroy`               | ✅              | ❌       |                                        |
| `galleriesUpdate`              | ✅              | ❌       |                                        |
| `addGalleryImages`             | ✅              | ❌       |                                        |
| `removeGalleryImages`          | ✅              | ❌       |                                        |
| `setGalleryCover`              | ✅              | ❌       |                                        |
| `resetGalleryCover`            | ✅              | ❌       |                                        |
| `galleryChapterCreate`         | ✅              | ❌       |                                        |
| `galleryChapterUpdate`         | ✅              | ❌       |                                        |
| `galleryChapterDestroy`        | ✅              | ❌       |                                        |
| **Performer Mutations**        |
| `performerCreate`              | ✅              | ❌       |                                        |
| `performerUpdate`              | ✅              | ✅       | **Implemented** - favorite flag        |
| `performerDestroy`             | ✅              | ❌       |                                        |
| `performersDestroy`            | ✅              | ❌       |                                        |
| `bulkPerformerUpdate`          | ✅              | ❌       |                                        |
| `performerMerge`               | ✅              | ❌       |                                        |
| **Studio Mutations**           |
| `studioCreate`                 | ✅              | ❌       |                                        |
| `studioUpdate`                 | ✅              | ❌       |                                        |
| `studioDestroy`                | ✅              | ❌       |                                        |
| `studiosDestroy`               | ✅              | ❌       |                                        |
| `bulkStudioUpdate`             | ✅              | ❌       |                                        |
| **Movie/Group Mutations**      |
| `movieCreate`                  | ✅ (deprecated) | ❌       |                                        |
| `movieUpdate`                  | ✅ (deprecated) | ❌       |                                        |
| `movieDestroy`                 | ✅ (deprecated) | ❌       |                                        |
| `moviesDestroy`                | ✅ (deprecated) | ❌       |                                        |
| `bulkMovieUpdate`              | ✅ (deprecated) | ❌       |                                        |
| `groupCreate`                  | ✅              | ❌       |                                        |
| `groupUpdate`                  | ✅              | ❌       |                                        |
| `groupDestroy`                 | ✅              | ❌       |                                        |
| `groupsDestroy`                | ✅              | ❌       |                                        |
| `bulkGroupUpdate`              | ✅              | ❌       |                                        |
| `addGroupSubGroups`            | ✅              | ❌       |                                        |
| `removeGroupSubGroups`         | ✅              | ❌       |                                        |
| `reorderSubGroups`             | ✅              | ❌       |                                        |
| **Tag Mutations**              |
| `tagCreate`                    | ✅              | ❌       |                                        |
| `tagUpdate`                    | ✅              | ❌       |                                        |
| `tagDestroy`                   | ✅              | ❌       |                                        |
| `tagsDestroy`                  | ✅              | ❌       |                                        |
| `tagsMerge`                    | ✅              | ❌       |                                        |
| `bulkTagUpdate`                | ✅              | ❌       |                                        |
| **File Mutations**             |
| `moveFiles`                    | ✅              | ❌       |                                        |
| `deleteFiles`                  | ✅              | ❌       |                                        |
| `destroyFiles`                 | ✅              | ❌       |                                        |
| `fileSetFingerprints`          | ✅              | ❌       |                                        |
| **Filter Mutations**           |
| `saveFilter`                   | ✅              | ❌       |                                        |
| `destroySavedFilter`           | ✅              | ❌       |                                        |
| `setDefaultFilter`             | ✅ (deprecated) | ❌       |                                        |
| **Config Mutations**           |
| `configureGeneral`             | ✅              | ❌       |                                        |
| `configureInterface`           | ✅              | ❌       |                                        |
| `configureDLNA`                | ✅              | ❌       |                                        |
| `configureScraping`            | ✅              | ❌       |                                        |
| `configureDefaults`            | ✅              | ❌       |                                        |
| `configurePlugin`              | ✅              | ❌       |                                        |
| `configureUI`                  | ✅              | ❌       |                                        |
| `configureUISetting`           | ✅              | ❌       |                                        |
| `generateAPIKey`               | ✅              | ❌       |                                        |
| **Import/Export**              |
| `exportObjects`                | ✅              | ❌       |                                        |
| `importObjects`                | ✅              | ❌       |                                        |
| `metadataImport`               | ✅              | ❌       |                                        |
| `metadataExport`               | ✅              | ❌       |                                        |
| `metadataScan`                 | ✅              | ❌       |                                        |
| `metadataGenerate`             | ✅              | ❌       |                                        |
| `metadataAutoTag`              | ✅              | ❌       |                                        |
| `metadataClean`                | ✅              | ❌       |                                        |
| `metadataCleanGenerated`       | ✅              | ❌       |                                        |
| `metadataIdentify`             | ✅              | ❌       |                                        |
| **Migration**                  |
| `migrateHashNaming`            | ✅              | ❌       |                                        |
| `migrateSceneScreenshots`      | ✅              | ❌       |                                        |
| `migrateBlobs`                 | ✅              | ❌       |                                        |
| **Database**                   |
| `anonymiseDatabase`            | ✅              | ❌       |                                        |
| `optimiseDatabase`             | ✅              | ❌       |                                        |
| `backupDatabase`               | ✅              | ❌       |                                        |
| `querySQL`                     | ✅              | ❌       | Dangerous                              |
| `execSQL`                      | ✅              | ❌       | Dangerous                              |
| **Scrapers**                   |
| `reloadScrapers`               | ✅              | ❌       |                                        |
| **Plugins**                    |
| `setPluginsEnabled`            | ✅              | ❌       |                                        |
| `runPluginTask`                | ✅              | ❌       |                                        |
| `runPluginOperation`           | ✅              | ❌       |                                        |
| `reloadPlugins`                | ✅              | ❌       |                                        |
| **Packages**                   |
| `installPackages`              | ✅              | ❌       |                                        |
| `updatePackages`               | ✅              | ❌       |                                        |
| `uninstallPackages`            | ✅              | ❌       |                                        |
| **Jobs**                       |
| `stopJob`                      | ✅              | ❌       |                                        |
| `stopAllJobs`                  | ✅              | ❌       |                                        |
| **StashBox**                   |
| `submitStashBoxFingerprints`   | ✅              | ❌       |                                        |
| `submitStashBoxSceneDraft`     | ✅              | ❌       |                                        |
| `submitStashBoxPerformerDraft` | ✅              | ❌       |                                        |
| `stashBoxBatchPerformerTag`    | ✅              | ❌       |                                        |
| `stashBoxBatchStudioTag`       | ✅              | ❌       |                                        |
| **DLNA**                       |
| `enableDLNA`                   | ✅              | ❌       |                                        |
| `disableDLNA`                  | ✅              | ❌       |                                        |
| `addTempDLNAIP`                | ✅              | ❌       |                                        |
| `removeTempDLNAIP`             | ✅              | ❌       |                                        |

**Mutation Summary:** 2/130+ implemented (1.5%)

---

## Subscription Operations

| Subscription            | Stash | Emulator | Notes              |
| ----------------------- | ----- | -------- | ------------------ |
| `jobsSubscribe`         | ✅    | ❌       | Job status updates |
| `loggingSubscribe`      | ✅    | ❌       | Log entries        |
| `scanCompleteSubscribe` | ✅    | ❌       | Scan completion    |

**Subscription Summary:** 0/3 implemented (0%)

---

## Type Coverage

### Core Types Implemented

| Type             | Stash | Emulator | Completeness                                                                           |
| ---------------- | ----- | -------- | -------------------------------------------------------------------------------------- |
| `Scene`          | Full  | Partial  | ~20% - id, title, details, date, urls, paths, performers, movies, rating100, organized |
| `Performer`      | Full  | Partial  | ~15% - id, name, image_path, galleries, favorite                                       |
| `Movie`          | Full  | Partial  | ~10% - id, name, synopsis, scenes                                                      |
| `Gallery`        | Full  | Minimal  | ~5% - id, title, files                                                                 |
| `SystemStatus`   | Full  | Minimal  | ~30% - databasePath, databaseSchema, appSchema                                         |
| `FindFilterType` | Full  | Minimal  | ~20% - q, page, per_page                                                               |

### Types Not Implemented

- `SceneMarker` - Markers/chapters within scenes
- `Studio` - Production studios
- `Tag` - Tags/categories
- `Group` - Movie groups/series
- `Image` - Individual images
- `File` - File management
- `Folder` - Folder management
- `SavedFilter` - Saved search filters
- `Job` - Background job management
- `Plugin` - Plugin system
- `Package` - Package management
- `Scraper` - Scraper configuration
- `StashBox` - StashBox integration
- `Config` - Configuration types
- `Stats` - Statistics
- `DLNA` - DLNA server
- `Version` - Version info
- And 50+ more types...

---

## Summary

### Overall Completeness

| Category          | Implemented | Total | Percentage |
| ----------------- | ----------- | ----- | ---------- |
| **Queries**       | 2           | ~80   | **2.5%**   |
| **Mutations**     | 2           | ~130  | **1.5%**   |
| **Subscriptions** | 0           | 3     | **0%**     |
| **Types**         | 6 partial   | 100+  | **~5%**    |

### What's Implemented

✅ **Queries:**

- `findScenes` - List scenes with TMDB data (100 TV shows, 162 scenes)
- `findPerformers` - List performers with TMDB cast data (676 performers)
- `systemStatus` - Basic system status

✅ **Mutations:**

- `sceneUpdate` - Update scene rating (0-100) and organized flag
- `performerUpdate` - Mark performer as favorite

✅ **Persistence:**

- Neon Postgres (with DATABASE_URL) or in-memory cache
- Auto-table creation on first query
- Dual persistence strategy

### What's Missing

❌ **Major Features:**

- Scene markers/chapters
- Studios, tags, groups
- Images and galleries (full implementation)
- File and folder management
- Scrapers and metadata operations
- Plugin system
- Job queue
- StashBox integration
- DLNA server
- Configuration management
- Import/Export
- Database operations
- Subscriptions (real-time updates)

### Use Case

The emulator is designed for **read-only demo purposes** with minimal write operations (ratings/favorites). It provides just enough functionality to showcase the Stow iOS app with TMDB data, not to replace a full Stash server.

### Future Expansion

To increase completeness, prioritize:

1. `findScene` (single scene by ID)
2. `findPerformer` (single performer by ID)
3. `findStudios` / `findTags` (if TMDB provides this data)
4. Scene markers (if TMDB provides chapter data)
5. More scene fields (play count, o-counter, resume time)
