import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { getStore } from "@netlify/blobs";
import seedMenu from "./seed-menu.mjs";

const uploads = getStore("ember-oak-uploads");
const contentTypes = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
const currencies = new Set(["৳", "$", "€", "£", "₹", "₨", "¥"]);

function json(status, body, headers = {}) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff", ...headers } });
}

async function bodyJson(request, maxBytes) {
  const text = await request.text();
  if (new TextEncoder().encode(text).length > maxBytes) throw Object.assign(new Error("Request is too large."), { status: 413 });
  try { return JSON.parse(text); } catch { return null; }
}

function cookie(request, name) {
  const item = (request.headers.get("cookie") || "").split(";").map(value => value.trim()).find(value => value.startsWith(`${name}=`));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : "";
}

function secret() { return process.env.ADMIN_SESSION_SECRET || ""; }
function sign(value) { return createHmac("sha256", secret()).update(value).digest("base64url"); }
function isAdmin(request) {
  const [expires, signature, extra] = cookie(request, "eo_admin_session").split(".");
  if (!expires || !signature || extra || !/^\d+$/.test(expires) || Number(expires) < Date.now() || !secret()) return false;
  const expected = sign(expires);
  const a = Buffer.from(signature); const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function getMenu() {
  const existing = await uploads.get("menu.json", { type: "json", consistency: "strong" });
  if (Array.isArray(existing)) return existing;
  const menu = Array.isArray(seedMenu) ? seedMenu : [];
  await uploads.setJSON("menu.json", menu);
  return menu;
}

function apiPath(url) {
  const path = decodeURIComponent(url.pathname);
  const functionPrefix = "/.netlify/functions/api";
  if (path.startsWith(functionPrefix)) return path.slice(functionPrefix.length) || "/";
  if (path === "/api") return "/";
  if (path.startsWith("/api/")) return path.slice("/api".length);
  return path;
}

export default async (request) => {
  try {
    const url = new URL(request.url);
    const path = apiPath(url);
    if (path === "/session" && request.method === "POST") {
      const body = await bodyJson(request, 16 * 1024);
      const email = (process.env.ADMIN_EMAIL || "admin@emberandoak.com").toLowerCase();
      const password = process.env.ADMIN_PASSWORD || "";
      if (!password || !secret()) return json(500, { error: "Admin authentication is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET in Netlify." });
      if (!body || String(body.email || "").toLowerCase() !== email || String(body.password || "") !== password) return json(401, { error: "Admin sign-in failed." });
      const expires = String(Date.now() + 8 * 60 * 60 * 1000);
      const secure = process.env.NETLIFY || url.protocol === "https:" ? "; Secure" : "";
      return json(200, { ok: true }, { "set-cookie": `eo_admin_session=${expires}.${sign(expires)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800${secure}` });
    }
    if (path === "/session" && request.method === "DELETE") {
      return json(200, { ok: true }, { "set-cookie": "eo_admin_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0; Secure" });
    }
    if (path === "/settings" && request.method === "GET") {
      const settings = await uploads.get("site-settings.json", { type: "json", consistency: "strong" });
      return json(200, { currency: currencies.has(settings?.currency) ? settings.currency : null });
    }
    if (path === "/settings" && request.method === "PUT") {
      if (!isAdmin(request)) return json(401, { error: "Sign in as admin to update the website settings." });
      const body = await bodyJson(request, 16 * 1024);
      if (!currencies.has(body?.currency)) return json(400, { error: "Choose a supported currency." });
      await uploads.setJSON("site-settings.json", { currency: body.currency });
      return json(200, { ok: true });
    }
    if (path === "/menu" && request.method === "GET") return json(200, { menu: await getMenu() });
    if (path === "/menu" && request.method === "PUT") {
      if (!isAdmin(request)) return json(401, { error: "Sign in as admin to update the shared menu." });
      const body = await bodyJson(request, 16 * 1024 * 1024);
      if (!body || !Array.isArray(body.menu) || body.menu.length > 1000) return json(400, { error: "The menu data is invalid." });
      await uploads.setJSON("menu.json", body.menu);
      return json(200, { ok: true });
    }
    if (path === "/images" && request.method === "POST") {
      if (!isAdmin(request)) return json(401, { error: "Sign in as admin to upload food photos." });
      const body = await bodyJson(request, 256 * 1024);
      const match = typeof body?.image === "string" && body.image.match(/^data:image\/(jpeg|png|webp);base64,([a-z0-9+/]+=*)$/i);
      if (!match) return json(400, { error: "Choose a JPG, PNG, or WebP image." });
      const bytes = Buffer.from(match[2], "base64");
      if (!bytes.length || bytes.length > 150 * 1024) return json(413, { error: "The optimized photo is too large. Choose a smaller image." });
      const ext = match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase();
      const key = `${randomUUID()}.${ext}`;
      await uploads.set(key, bytes, { metadata: { contentType: contentTypes[ext] } });
      return json(201, { url: `/api/images/${key}` });
    }
    const imageMatch = path.match(/^\/images\/([a-f0-9-]+\.(?:jpg|jpeg|png|webp))$/i);
    if (imageMatch && request.method === "GET") {
      const key = imageMatch[1];
      const blob = await uploads.get(key, { type: "arrayBuffer", consistency: "strong" });
      if (blob) return new Response(blob, { headers: { "content-type": contentTypes[key.split(".").pop().toLowerCase()], "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff" } });
      return new Response("Image not found", { status: 404 });
    }
    return json(404, { error: "API route not found." });
  } catch (error) {
    return json(error.status || 500, { error: error.message || "Server error." });
  }
};
