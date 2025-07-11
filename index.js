//gr8r-uploadsign-worker
// initial code for worker testing
export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const { pathname } = new URL(request.url);
    if (pathname !== "/generate-upload-url") {

      return new Response("Not found", { status: 404 });
    }

    try {
      const { objectKey, contentType } = await request.json();

      if (!objectKey || !contentType) {
        return new Response("Missing objectKey or contentType", { status: 400 });
      }

      const signed = await env.VIDEO_BUCKET.createPresignedUrl(objectKey, {
        method: "PUT",
        contentType,
        expiresIn: 3600, // 1 hour
      });

      return new Response(JSON.stringify({
        uploadUrl: signed.url,
        objectKey
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });

    } catch (err) {
      return new Response(JSON.stringify({
        error: err.message,
        name: err.name,
        stack: err.stack
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
