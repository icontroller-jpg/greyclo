import API from "./api";

export const createOrder = async (payload) => {
  const res = await API.post("orders/create/", payload);
  return res.data;
};

export const verifyPayment = async (payload) => {
  const res = await API.post("orders/verify/", payload);
  return res.data;
};