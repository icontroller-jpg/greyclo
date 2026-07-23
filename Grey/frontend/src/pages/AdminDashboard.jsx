import { useState, useEffect } from "react";
import axios from "axios";
import { getSiteImages, saveSiteImage } from "../services/siteImageService";
import "./AdminDashboard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const IMAGEKIT_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;
// NOTE: a VITE_IMAGEKIT_PRIVATE_KEY used to be read here via import.meta.env.
// Any VITE_-prefixed env var is bundled into client-side JS and visible in
// dev tools, so a private key must never be exposed this way. It wasn't
// actually used in the upload call below — signing happens server-side via
// /api/imagekit-auth/ — so it's safe to leave out.

const CATEGORIES = [
  { value: "shirts", label: "Shirts" },
  { value: "jackets", label: "Jackets" },
  { value: "bottoms", label: "Bottoms" },
];

let imageKitAuth = null;

async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        const MAX_SIZE = 2400;

        let width = img.width;
        let height = img.height;

        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Image compression failed"));
              return;
            }

            resolve(
              new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, ".webp"),
                { type: "image/webp" }
              )
            );
          },
          "image/webp",
          0.85
        );
      };

      img.onerror = reject;
      img.src = e.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function getImageKitAuth() {
  if (
    imageKitAuth &&
    imageKitAuth.expire * 1000 > Date.now() + 60000
  ) {
    return imageKitAuth;
  }

  const res = await axios.get(`${API_URL}/api/imagekit-auth/`, {
    timeout: 30000,
  });

  imageKitAuth = res.data;
  return imageKitAuth;
}

async function uploadToImageKit(file) {
  const compressedFile = await compressImage(file);

  const { token, expire, signature } = await getImageKitAuth();

  const formData = new FormData();

  formData.append("file", compressedFile);
  formData.append("fileName", compressedFile.name);
  formData.append("publicKey", IMAGEKIT_PUBLIC_KEY);
  formData.append("token", token);
  formData.append("expire", expire);
  formData.append("signature", signature);

  const res = await axios.post(
    "https://upload.imagekit.io/api/v1/files/upload",
    formData,
    {
      timeout: 120000,
    }
  );

  return res.data.url;
}

// Slot definitions for the "Site Images" tab
const SINGLE_SLOTS = [
  { slot: "hero", label: "Hero Background" },
  { slot: "drop", label: "Drop Visual" },
  { slot: "campaign", label: "Campaign Background" },
];
const CATEGORY_SLOTS = [
  { slot: "category-shirts", label: "Category Tile — Shirts" },
  { slot: "category-jackets", label: "Category Tile — Jackets" },
  { slot: "category-bottoms", label: "Category Tile — Bottoms" },
];
const COMMUNITY_SLOTS = Array.from({ length: 8 }, (_, i) => ({
  slot: `community-${i}`,
  label: `Community ${i + 1}`,
}));
const LOOK_SLOTS = [
  { slot: "look-0", label: "Fit 01" },
  { slot: "look-1", label: "Fit 02" },
  { slot: "look-2", label: "Fit 03" },
];

function SiteImageSlot({ slot, label, currentUrl, onUploaded }) {
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setBusy(true);
    try {
      const url = await uploadToImageKit(file);
      await saveSiteImage(slot, url);
      onUploaded(slot, url);
    } catch (err) {
      console.error(`Failed to upload ${slot}:`, err.message);
      alert(`Upload failed for ${label}: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const displayUrl = preview || currentUrl;

  return (
    <div className="slot-card">
      <div className="slot-preview">
        {displayUrl ? (
          <img src={displayUrl} alt={label} className="slot-img" />
        ) : (
          <div className="slot-empty">No image</div>
        )}
        {busy && <div className="slot-busy">Uploading…</div>}
        <input type="file" accept="image/*" onChange={handleChange} className="slot-input" />
      </div>
      <p className="slot-label">{label}</p>
    </div>
  );
}

function AdminDashboard() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("shirts");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [siteImages, setSiteImages] = useState({});
  const [siteImagesLoading, setSiteImagesLoading] = useState(false);

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/products/`, { timeout: 10000 });
      setProducts(res.data);
    } catch (err) {
      console.error("Fetch failed:", err.message);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchSiteImages = async () => {
    setSiteImagesLoading(true);
    const map = await getSiteImages();
    setSiteImages(map);
    setSiteImagesLoading(false);
  };

  useEffect(() => {
    if (activeTab === "inventory") fetchProducts();
    if (activeTab === "images") fetchSiteImages();
  }, [activeTab]);

  const handleFilesChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

const uploadProduct = async () => {
  if (!name || !price || files.length === 0) {
    return alert("Please fill all required fields and add at least one image");
  }

  setLoading(true);

  try {
    // Upload all images concurrently
    const urls = await Promise.all(
      files.map((file) => uploadToImageKit(file))
    );

    // Save product data after all images finish uploading
    await axios.post(
      `${API_URL}/api/products/`,
      {
        title: name,
        price: parseFloat(price),
        description,
        image: urls[0],
        image_urls: urls,
        category,
        condition: "new",
      },
      {
        timeout: 60000,
      }
    );

    alert("Product uploaded successfully!");

    setName("");
    setPrice("");
    setDescription("");
    setCategory("shirts");
    setFiles([]);
    setPreviews([]);

  } catch (err) {
    console.error("Upload error:", err);
    alert(
      `Upload failed: ${
        err.response?.data
          ? JSON.stringify(err.response.data)
          : err.message
      }`
    );
  } finally {
    setLoading(false);
  }
};

  // NOTE: assumes a standard DRF-style DELETE endpoint at
  // /api/products/<id>/ — adjust the URL if your products/urls.py differs.
  const deleteProduct = async (id) => {
    setDeletingId(id);
    try {
      await axios.delete(`${API_URL}/api/products/${id}/`, { timeout: 10000 });
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setConfirmDelete(null);
    } catch (err) {
      console.error("Delete failed:", err.message);
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSlotUploaded = (slot, url) => {
    setSiteImages((prev) => ({ ...prev, [slot]: url }));
  };

  return (
    <>
      {confirmDelete && (
        <div className="modal-backdrop" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-corner-tl" />
            <div className="modal-corner-br" />
            <p className="modal-label">⚠ Destructive Action</p>
            <h2 className="modal-title">Delete Entry</h2>
            <p className="modal-sub">
              "{confirmDelete.title}" will be permanently removed from inventory.
              This cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setConfirmDelete(null)}>Abort</button>
              <button
                className="modal-confirm"
                onClick={() => deleteProduct(confirmDelete.id)}
                disabled={deletingId === confirmDelete.id}
              >
                <span>{deletingId === confirmDelete.id ? "Deleting..." : "Confirm"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="dash-root">
        <div className="dash-glow" />

        <div className="dash-panel">
          <div className="dash-header">
            <div className="status-bar">
              <div className="status-dot" />
              <span className="status-text">System Online</span>
            </div>
            <p className="dash-eyebrow">Admin / Control</p>
            <h1 className="dash-title">Dashboard</h1>
            <div className="dash-divider" />
          </div>

          <div className="tab-bar">
            <button className={`tab-btn ${activeTab === "upload" ? "active" : ""}`} onClick={() => setActiveTab("upload")}>⊕ New Entry</button>
            <button className={`tab-btn ${activeTab === "inventory" ? "active" : ""}`} onClick={() => setActiveTab("inventory")}>▦ Inventory</button>
            <button className={`tab-btn ${activeTab === "images" ? "active" : ""}`} onClick={() => setActiveTab("images")}>◱ Site Images</button>
          </div>

          {activeTab === "upload" && (
            <div className="form-wrap">
              <div className="corner-tl" />
              <div className="corner-br" />

              <div className={`field-group ${focused === "name" ? "active" : ""}`}>
                <label className="field-label">Product Name</label>
                <input
                  className="field-input" placeholder="—" value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
                />
              </div>

              <div className="field-row">
                <div className={`field-group ${focused === "price" ? "active" : ""}`}>
                  <label className="field-label">Price (USD)</label>
                  <input
                    type="number" className="field-input" placeholder="0.00" value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    onFocus={() => setFocused("price")} onBlur={() => setFocused(null)}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Category</label>
                  <select
                    className="field-input field-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={`field-group ${focused === "desc" ? "active" : ""}`}>
                <label className="field-label">Description</label>
                <textarea
                  className="field-input field-textarea" placeholder="—" rows={3} value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onFocus={() => setFocused("desc")} onBlur={() => setFocused(null)}
                />
              </div>

              {previews.length > 0 ? (
                <div className="preview-wrap">
                  <label className="field-label">Images ({previews.length})</label>
                  <div className="preview-grid">
                    {previews.map((src, i) => (
                      <div className="preview-thumb" key={i}>
                        <img src={src} alt={`preview ${i + 1}`} />
                        <button
                          type="button"
                          className="preview-remove"
                          onClick={() => removeFile(i)}
                          aria-label={`Remove image ${i + 1}`}
                        >
                          ×
                        </button>
                        {i === 0 && <span className="preview-cover-tag">Cover</span>}
                      </div>
                    ))}
                  </div>
                  <div className="upload-zone has-file">
                    <input type="file" accept="image/*" multiple onChange={handleFilesChange} />
                    <div className="upload-text">Replace All Images</div>
                  </div>
                </div>
              ) : (
                <div className="upload-zone">
                  <input type="file" accept="image/*" multiple onChange={handleFilesChange} />
                  <div className="upload-icon">⊕</div>
                  <div className="upload-text">Select Image Files (multiple allowed)</div>
                </div>
              )}

              <button onClick={uploadProduct} disabled={loading} className="submit-btn">
                <span>{loading ? <span className="loading-dots">Transmitting</span> : "Deploy Product"}</span>
              </button>
            </div>
          )}

          {activeTab === "inventory" && (
            <div>
              <div className="inv-header">
                <span className="inv-count">
                  {productsLoading ? "Loading..." : `${products.length} Record${products.length !== 1 ? "s" : ""}`}
                </span>
                <button className="inv-refresh" onClick={fetchProducts}>↻ Refresh</button>
              </div>

              <div className="inv-grid">
                {productsLoading ? (
                  <div className="inv-empty"><div className="inv-spinner" />Fetching inventory...</div>
                ) : products.length === 0 ? (
                  <div className="inv-empty">No records found</div>
                ) : (
                  products.map((product, i) => (
                    <div className="inv-card" key={product.id} style={{ animationDelay: `${i * 0.05}s` }}>
                      <img src={product.image} alt={product.title} className="inv-card-img" loading="lazy" />
                      <div className="inv-card-body">
                        <p className="inv-card-id">ID — {product.id} · {product.category}</p>
                        <p className="inv-card-title">{product.title}</p>
                        <p className="inv-card-price">${product.price}</p>
                      </div>
                      <div className="delete-btn-wrap">
                        <button
                          className="delete-btn"
                          onClick={() => setConfirmDelete(product)}
                          disabled={deletingId === product.id}
                        >
                          <span>{deletingId === product.id ? "Removing..." : "⊘ Delete Entry"}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "images" && (
            <div>
              {siteImagesLoading ? (
                <div className="inv-empty"><div className="inv-spinner" />Loading site images...</div>
              ) : (
                <>
                  <p className="slot-section-title">Page Backgrounds</p>
                  <div className="slot-grid slot-grid-wide">
                    {SINGLE_SLOTS.map((s) => (
                      <SiteImageSlot key={s.slot} slot={s.slot} label={s.label} currentUrl={siteImages[s.slot]} onUploaded={handleSlotUploaded} />
                    ))}
                  </div>

                  <p className="slot-section-title">Category Tiles</p>
                  <div className="slot-grid slot-grid-wide">
                    {CATEGORY_SLOTS.map((s) => (
                      <SiteImageSlot key={s.slot} slot={s.slot} label={s.label} currentUrl={siteImages[s.slot]} onUploaded={handleSlotUploaded} />
                    ))}
                  </div>

                  <p className="slot-section-title">Shop the Look — Fits</p>
                  <div className="slot-grid">
                    {LOOK_SLOTS.map((s) => (
                      <SiteImageSlot key={s.slot} slot={s.slot} label={s.label} currentUrl={siteImages[s.slot]} onUploaded={handleSlotUploaded} />
                    ))}
                  </div>

                  <p className="slot-section-title">Community Grid</p>
                  <div className="slot-grid slot-grid-dense">
                    {COMMUNITY_SLOTS.map((s) => (
                      <SiteImageSlot key={s.slot} slot={s.slot} label={s.label} currentUrl={siteImages[s.slot]} onUploaded={handleSlotUploaded} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;