import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  // Serve the Swagger UI HTML page
  if (searchParams.get("ui") === "1") {
    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CollageCampus API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>body { margin: 0; }</style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin="anonymous"></script>
    <script>
      window.onload = function () {
        SwaggerUIBundle({
          url: "/api/swagger",
          dom_id: "#swagger-ui",
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
          layout: "BaseLayout",
          deepLinking: true,
        });
      };
    </script>
  </body>
</html>`;
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Serve the raw YAML spec
  const yamlPath = join(process.cwd(), "swagger.yaml");
  const yaml = readFileSync(yamlPath, "utf-8");
  return new Response(yaml, {
    headers: {
      "Content-Type": "application/yaml",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
