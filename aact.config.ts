import type { AactConfig } from "aact";

const config: AactConfig = {
  source: {
    type: "plantuml",
    path: "./docs/architecture/container.puml",
  },
  rules: {
    acl: true,
    acyclic: true,
    crud: true,
    cohesion: true,
    // apiGateway: true,         ← закомментировано
    // stableDependencies: true,  ← закомментировано
  },
};

export default config;