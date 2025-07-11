//gr8r-uploadsign-worker v1.0.1
//added title sanitization for safe URL
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
   const { title, contentType } = await request.json();

if (!title || !contentType) {
  return new Response("Missing title or contentType", { status: 400 });
}

function sanitizeTitleForFilename(title) {
  return title
    .trim()
    .replace(/[\/\\?%*:|"<>']/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

const fileExt = contentType === "video/mp4" ? "mp4" : "mov";
const sanitizedTitle = sanitizeTitleForFilename(title);
const objectKey = `${sanitizedTitle}.${fileExt}`;


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
