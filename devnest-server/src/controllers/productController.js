import Product from "../models/Product.js";

/*
GET /api/products
?page=1&limit=10&search=dev&category=ui&sort=price_asc
*/
export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      sort
    } = req.query;

    const query = {};

    // 🔎 Search by title
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // 📂 Filter by category
    if (category) {
      query.category = category;
    }

    // 🔢 Sorting
    let sortOption = {};
    if (sort === "price_asc") sortOption.price = 1;
    if (sort === "price_desc") sortOption.price = -1;

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .lean(); // ⚡ performance optimization

    const total = await Product.countDocuments(query);

    res.json({
      products,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, stock, image } = req.body;

    const product = await Product.create({
      title,
      description,
      price,
      category,
      stock,
      image
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};