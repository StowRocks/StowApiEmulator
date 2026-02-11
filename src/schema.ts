export const typeDefs = `#graphql
  scalar Time
  scalar Map

  enum GenderEnum {
    MALE
    FEMALE
    TRANSGENDER_MALE
    TRANSGENDER_FEMALE
    INTERSEX
    NON_BINARY
  }

  enum CircumisedEnum {
    CUT
    UNCUT
  }

  enum CriterionModifier {
    EQUALS
    NOT_EQUALS
    GREATER_THAN
    LESS_THAN
    IS_NULL
    NOT_NULL
    INCLUDES
    EXCLUDES
    MATCHES_REGEX
    NOT_MATCHES_REGEX
  }

  type Query {
    systemStatus: SystemStatus!
    findScene(id: ID!): Scene
    findScenes(filter: FindFilterType, scene_filter: SceneFilterType, ids: [ID!]): FindScenesResultType!
    findPerformer(id: ID!): Performer
    findPerformers(filter: FindFilterType, performer_filter: PerformerFilterType, ids: [ID!]): FindPerformersResultType!
    findStudio(id: ID!): Studio
    findStudios(filter: FindFilterType, studio_filter: StudioFilterType, ids: [ID!]): FindStudiosResultType!
    findTag(id: ID!): Tag
    findTags(filter: FindFilterType, tag_filter: TagFilterType, ids: [ID!]): FindTagsResultType!
    findGalleries(filter: FindFilterType, gallery_filter: GalleryFilterType, ids: [ID!]): FindGalleriesResultType!
    findGroups(filter: FindFilterType, ids: [ID!]): FindGroupsResultType!
    findImages(filter: FindFilterType, image_filter: ImageFilterType, ids: [ID!]): FindImagesResultType!
    findSceneMarkers(filter: FindFilterType, scene_marker_filter: SceneMarkerFilterType, ids: [ID!]): FindSceneMarkersResultType!
  }

  type SystemStatus {
    databasePath: String!
    databaseSchema: Int
    appSchema: Int
  }

  type Mutation {
    sceneUpdate(input: SceneUpdateInput!): Scene
    performerUpdate(input: PerformerUpdateInput!): Performer
  }

  input FindFilterType {
    q: String
    page: Int
    per_page: Int
    sort: String
    direction: String
  }

  input SceneFilterType {
    performers: MultiCriterionInput
    tags: HierarchicalMultiCriterionInput
    studios: HierarchicalMultiCriterionInput
  }

  input PerformerFilterType {
    name: StringCriterionInput
    favorite: Boolean
  }

  input StudioFilterType {
    name: StringCriterionInput
  }

  input TagFilterType {
    name: StringCriterionInput
  }

  input GalleryFilterType {
    galleries: MultiCriterionInput
  }

  input ImageFilterType {
    galleries: MultiCriterionInput
  }

  input SceneMarkerFilterType {
    scene_id: ID
  }

  input MultiCriterionInput {
    value: [ID!]
    modifier: CriterionModifier
  }

  input HierarchicalMultiCriterionInput {
    value: [ID!]
    modifier: CriterionModifier
    depth: Int
  }

  input StringCriterionInput {
    value: String!
    modifier: CriterionModifier
  }

  input SceneUpdateInput {
    id: ID!
    rating100: Int
    organized: Boolean
    o_counter: Int
  }

  input PerformerUpdateInput {
    id: ID!
    favorite: Boolean
    rating100: Int
  }

  type FindScenesResultType {
    count: Int!
    duration: Float!
    filesize: Float!
    scenes: [Scene!]!
  }

  type FindPerformersResultType {
    count: Int!
    performers: [Performer!]!
  }

  type FindStudiosResultType {
    count: Int!
    studios: [Studio!]!
  }

  type FindTagsResultType {
    count: Int!
    tags: [Tag!]!
  }

  type FindGalleriesResultType {
    count: Int!
    galleries: [Gallery!]!
  }

  type FindGroupsResultType {
    count: Int!
    groups: [Group!]!
  }

  type FindImagesResultType {
    count: Int!
    images: [StashImage!]!
  }

  type FindSceneMarkersResultType {
    count: Int!
    scene_markers: [SceneMarker!]!
  }

  type Scene {
    id: ID!
    title: String
    code: String
    details: String
    director: String
    urls: [String!]!
    date: String
    rating100: Int
    organized: Boolean!
    o_counter: Int
    interactive: Boolean!
    interactive_speed: Int
    resume_time: Float
    play_duration: Float
    play_count: Int
    last_played_at: Time
    play_history: [Time!]!
    o_history: [Time!]!
    paths: ScenePaths!
    files: [VideoFile!]!
    performers: [Performer!]!
    tags: [Tag!]!
    studio: Studio
    galleries: [Gallery!]!
    groups: [SceneGroup!]!
    movies: [SceneMovie!]!
    scene_markers: [SceneMarker!]!
    stash_ids: [StashID!]!
    captions: [VideoCaption!]
    created_at: Time
    updated_at: Time
  }

  type SceneGroup {
    group: Group!
    scene_index: Int
  }

  type SceneMovie {
    movie: Movie!
    scene_index: Int
  }

  type VideoCaption {
    language_code: String!
    caption_type: String!
  }

  type StashID {
    endpoint: String!
    stash_id: String!
  }

  type ScenePaths {
    screenshot: String
    stream: String
    preview: String
    sprite: String
    vtt: String
  }

  type VideoFile {
    id: ID!
    path: String
    duration: Float
    video_codec: String
    width: Int
    height: Int
  }

  type SceneMarker {
    id: ID!
    title: String!
    seconds: Float!
    screenshot: String!
    preview: String!
    stream: String!
    primary_tag: Tag!
    tags: [Tag!]!
    scene: Scene!
    created_at: Time
    updated_at: Time
  }

  type Performer {
    id: ID!
    name: String!
    disambiguation: String
    urls: [String!]!
    gender: GenderEnum
    twitter: String
    instagram: String
    birthdate: String
    ethnicity: String
    country: String
    eye_color: String
    height_cm: Int
    measurements: String
    fake_tits: String
    penis_length: Float
    circumcised: CircumisedEnum
    career_length: String
    tattoos: String
    piercings: String
    alias_list: [String!]!
    favorite: Boolean!
    ignore_auto_tag: Boolean!
    image_path: String
    scene_count(depth: Int): Int!
    image_count(depth: Int): Int!
    gallery_count(depth: Int): Int!
    group_count(depth: Int): Int!
    performer_count(depth: Int): Int!
    o_counter: Int
    rating100: Int
    details: String
    death_date: String
    hair_color: String
    weight: Int
    created_at: Time
    updated_at: Time
    tags: [Tag!]!
    stash_ids: [StashID!]!
    custom_fields: Map!
  }

  type Studio {
    id: ID!
    name: String!
    url: String
    urls: [String!]!
    parent_studio: Studio
    child_studios: [Studio!]!
    image_path: String
    scene_count(depth: Int): Int!
    image_count(depth: Int): Int!
    gallery_count(depth: Int): Int!
    performer_count(depth: Int): Int!
    group_count(depth: Int): Int!
    rating100: Int
    details: String
    aliases: [String!]!
    tags: [Tag!]!
    favorite: Boolean!
    ignore_auto_tag: Boolean!
    stash_ids: [StashID!]!
    o_counter: Int
    created_at: Time
    updated_at: Time
    custom_fields: Map!
  }

  type Tag {
    id: ID!
    name: String!
    description: String
    sort_name: String
    favorite: Boolean!
    aliases: [String!]!
    ignore_auto_tag: Boolean!
    scene_count(depth: Int): Int!
    scene_marker_count(depth: Int): Int!
    image_count(depth: Int): Int!
    gallery_count(depth: Int): Int!
    performer_count(depth: Int): Int!
    studio_count(depth: Int): Int!
    group_count(depth: Int): Int!
    parent_count: Int!
    child_count: Int!
    image_path: String
    created_at: Time
    updated_at: Time
    parents: [Tag!]!
    children: [Tag!]!
    custom_fields: Map!
  }

  type Gallery {
    id: ID!
    title: String
    date: String
    image_count: Int!
    cover: StashImage
  }

  type Group {
    id: ID!
    name: String!
    aliases: [String!]!
    duration: Int
    date: String
    rating100: Int
    director: String
    synopsis: String
    urls: [String!]!
    scene_count: Int!
    front_image_path: String
    back_image_path: String
    studio: Studio
    tags: [Tag!]!
  }

  type Movie {
    id: ID!
    name: String!
    aliases: [String!]!
    duration: Int
    date: String
    rating100: Int
    director: String
    synopsis: String
    url: String
    front_image_path: String
    back_image_path: String
    studio: Studio
  }

  type StashImage {
    id: ID!
    title: String
    paths: ImagePaths!
  }

  type ImagePaths {
    thumbnail: String
    image: String
  }
`;
