// Single source of truth for product categories — keep this in sync with
// the CATEGORY_CHOICES list in backend/products/models.py.
// `recent: true` marks categories to feature on the Collections page —
// remove the flag once a category is no longer "new".
export const CATEGORIES = [
  { value: "shirts", label: "Shirts" },
  { value: "windbreaker-track-pants", label: "Windbreaker Track Pants" },
  { value: "vest", label: "Vest" },
  { value: "skirts", label: "Skirts" },
  { value: "caps", label: "Caps" },
  { value: "shorts", label: "Shorts" },
  { value: "girl-shorts", label: "Girl Shorts" },
  { value: "socks", label: "Socks" },
  { value: "bucket-hats", label: "Bucket Hats" },
  { value: "tops", label: "Tops" },
  { value: "durags-wave-caps", label: "Durags & Wave Caps" },
  { value: "tees", label: "Tees" },
  { value: "graphic-tees", label: "Graphic Tees" },
  { value: "varsity-jackets", label: "Varsity Jackets", recent: true },
  { value: "puffer-jackets", label: "Puffer Jackets", recent: true },
  { value: "jerseys", label: "Jerseys", recent: true },
  { value: "hoodies", label: "Hoodies", recent: true },
  { value: "zipper-hoodies", label: "Zipper Hoodies", recent: true },
];