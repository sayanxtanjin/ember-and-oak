/* Restaurant configuration — the single place branding, contact info and
   business defaults live. Admin Settings edits DB.config at runtime; this
   object only supplies the starting values the first time the site loads. */

const DEFAULT_CONFIG = {
  name: "Ember & Oak",
  tagline: "Wood-Fired. Hand-Crafted. Uncompromising.",
  description: "Ember & Oak is a modern hearth kitchen: live-fire pizza, char-grilled mains and handmade pasta, served from four branches across the city. We cook the way restaurants used to — slow, over real wood, with nothing frozen and nothing rushed.",
  phone: "+880 1711-223344",
  email: "hello@emberandoak.com",
  address: "House 12, Road 90, Gulshan 2, Dhaka",
  hours: "Mon – Sun · 11:00 AM – 11:00 PM",
  currency: "৳",
  social: {instagram:"instagram.com/emberandoak", facebook:"facebook.com/emberandoak", twitter:"twitter.com/emberandoak"},
  deliveryDefaultFee: 80,
  taxPercent: 0,
  favicon: "🔥",
  faviconImage: null
};
