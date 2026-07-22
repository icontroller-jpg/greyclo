import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Returns a { slot: imageUrl } map, e.g.
 * { hero: "https://...", "community-0": "https://...", "look-1": "https://..." }
 */
export const getSiteImages = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/products/site-images/`, { timeout: 10000 });
    const map = {};
    res.data.forEach((item) => {
      map[item.slot] = item.image;
    });
    return map;
  } catch (err) {
    console.error("Failed to load site images:", err.message);
    return {};
  }
};

/**
 * Upserts a single slot. Backend should create-or-replace based on
 * the unique `slot` key (see Django snippet).
 */
export const saveSiteImage = async (slot, imageUrl) => {
  return axios.post(
    `${API_URL}/api/products/site-images/`,
    { slot, image: imageUrl },
    { timeout: 60000 }
  );
};