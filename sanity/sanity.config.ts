import { defineConfig } from "sanity"
import { structureTool } from "sanity/structure"
import { visionTool } from "@sanity/vision"
import { schemaTypes } from "./schema"
import { apiVersion, dataset, projectId } from "./env"

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
  },
  plugins: [structureTool(), visionTool({ defaultApiVersion: apiVersion })],
})
