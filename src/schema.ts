export const typeDefs = `#graphql
  type Query {
    systemStatus: SystemStatus!
    findScenes(filter: FindFilterType, scene_filter: SceneFilterType): FindScenesResultType!
    findPerformers(filter: FindFilterType, performer_filter: PerformerFilterType): FindPerformersResultType!
    findStudios(filter: FindFilterType, studio_filter: StudioFilterType): FindStudiosResultType!
    findTags(filter: FindFilterType, tag_filter: TagFilterType): FindTagsResultType!
    findGalleries(filter: FindFilterType, gallery_filter: GalleryFilterType): FindGalleriesResultType!
    findGroups(filter: FindFilterType): FindGroupsResultType!
    findImages(filter: FindFilterType, image_filter: ImageFilterType): FindImagesResultType!
    findSceneMarkers(filter: FindFilterType): FindSceneMarkersResultType!
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

  input MultiCriterionInput {
    value: [ID!]
    modifier: String
  }

  input HierarchicalMultiCriterionInput {
    value: [ID!]
    modifier: String
    depth: Int
  }

  input StringCriterionInput {
    value: String
    modifier: String
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
    urls: [String]
    date: String
    rating100: Int
    organized: Boolean
    o_counter: Int
    resume_time: Float
    play_duration: Float
    play_count: Int
    paths: ScenePaths
    files: [VideoFile]
    performers: [Performer]
    tags: [Tag]
    studio: Studio
    galleries: [Gallery]
    scene_markers: [SceneMarker]
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
    title: String
    seconds: Float
    screenshot: String
    preview: String
    stream: String
    primary_tag: Tag
    tags: [Tag]
    scene: Scene
  }

  type Performer {
    id: ID!
    name: String
    disambiguation: String
    urls: [String]
    gender: String
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
    circumcised: String
    career_length: String
    tattoos: String
    piercings: String
    alias_list: [String]
    favorite: Boolean
    ignore_auto_tag: Boolean
    image_path: String
    scene_count: Int
    image_count: Int
    gallery_count: Int
    group_count: Int
    performer_count: Int
    o_counter: Int
    rating100: Int
    details: String
    death_date: String
    hair_color: String
    weight: Int
    created_at: String
    updated_at: String
  }

  type Studio {
    id: ID!
    name: String
    url: String
    parent_studio: Studio
    child_studios: [Studio]
    image_path: String
    scene_count: Int
    rating100: Int
    details: String
    aliases: [String]
  }

  type Tag {
    id: ID!
    name: String
    description: String
    sort_name: String
    favorite: Boolean
    aliases: [String]
    ignore_auto_tag: Boolean
    scene_count: Int
    performer_count: Int
    scene_marker_count: Int
    image_path: String
    image_count: Int
    gallery_count: Int
    parent_count: Int
    child_count: Int
    created_at: String
    updated_at: String
    parents: [Tag]
    children: [Tag]
  }

  type Gallery {
    id: ID!
    title: String
    date: String
    image_count: Int
    cover: StashImage
  }

  type Group {
    id: ID!
    name: String
    aliases: [String]
    duration: Int
    date: String
    rating100: Int
    director: String
    synopsis: String
    urls: [String]
    scene_count: Int
    front_image_path: String
    back_image_path: String
    studio: Studio
    tags: [Tag]
  }

  type StashImage {
    id: ID!
    title: String
    paths: ImagePaths
  }

  type ImagePaths {
    thumbnail: String
    image: String
  }
`;
