export const typeDefs = `#graphql
  type Query {
    findScenes(filter: FindFilterType): FindScenesResultType!
    findPerformers(filter: FindFilterType): FindPerformersResultType!
  }

  input FindFilterType {
    q: String
    page: Int
    per_page: Int
  }

  type FindScenesResultType {
    count: Int!
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
  }

  type ScenePaths {
    screenshot: String
  }

  type Performer {
    id: ID!
    name: String
    image_path: String
    galleries: [Gallery]
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
