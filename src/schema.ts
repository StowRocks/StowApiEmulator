export const typeDefs = `#graphql
  type Query {
    findScenes(filter: FindFilterType): FindScenesResultType!
    findPerformers(filter: FindFilterType): FindPerformersResultType!
  }

  type Mutation {
    sceneUpdate(input: SceneUpdateInput!): Scene
    performerUpdate(input: PerformerUpdateInput!): Performer
  }

  input FindFilterType {
    q: String
    page: Int
    per_page: Int
  }

  input SceneUpdateInput {
    id: ID!
    rating100: Int
    organized: Boolean
  }

  input PerformerUpdateInput {
    id: ID!
    favorite: Boolean
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

  type Scene {
    id: ID!
    title: String
    details: String
    date: String
    urls: [String]
    paths: ScenePaths
    performers: [Performer]
    movies: [Movie]
    rating100: Int
    organized: Boolean
  }

  type ScenePaths {
    screenshot: String
  }

  type Performer {
    id: ID!
    name: String
    image_path: String
    galleries: [Gallery]
    favorite: Boolean
  }

  type Gallery {
    id: ID!
    title: String
    files: [ImageFile]
  }

  type ImageFile {
    path: String
  }

  type Movie {
    id: ID!
    name: String
    synopsis: String
    scenes: [Scene]
  }
`;
