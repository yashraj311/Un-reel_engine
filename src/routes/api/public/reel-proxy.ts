import { createFileRoute } from "@tanstack/react-router";

const TARGET = "https://yashrajaipm.app.n8n.cloud/webhook/reel-engine";

export const Route = createFileRoute("/api/public/reel-proxy")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "86400",
          },
        }),
      POST: async ({ request }) => {
        const cors = {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        };
        try {
          const body = await request.text();
          const upstream = await fetch(TARGET, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
          });
          const text = await upstream.text();
          return new Response(text, {
            status: upstream.status,
            headers: cors,
          });
        } catch (e) {
          return new Response(
            JSON.stringify({ error: "Proxy request failed" }),
            { status: 502, headers: cors },
          );
        }
      },
    },
  },
});
