import API from "./api";

export const getCart = async () => {
  const res = await API.get("cart/");
  return res.data;
};

export const addCartItem = async (productId, quantity = 1) => {
  const res = await API.post("cart/", { product_id: productId, quantity });
  return res.data;
};

export const updateCartItem = async (itemId, quantity) => {
  const res = await API.patch(`cart/${itemId}/`, { quantity });
  return res.data;
};

export const removeCartItem = async (itemId) => {
  await API.delete(`cart/${itemId}/`);
};