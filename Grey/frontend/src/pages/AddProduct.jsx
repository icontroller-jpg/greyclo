import { useState } from "react";
import API from "../services/api";

function AddProduct() {

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("products/", {
        title,
        price
      });

      alert("Product added!");
    } catch (err) {
      console.error(err);
      alert("Error adding product");
    }
  };

  return (
    <div>
      <h1>Add Product</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          placeholder="Product title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button type="submit">
          Add Product
        </button>

      </form>
    </div>
  );
}

export default AddProduct;