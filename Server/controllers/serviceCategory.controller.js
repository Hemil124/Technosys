import ServiceCategory from "../models/ServiceCategory.js";

// Default seed data
// const DEFAULT_CATEGORIES = [
//   { name: "Plumbing" },
//   { name: "Electrical" },
//   { name: "Carpentry" },
// ];

export const getAllCategories = async (req, res) => {
  try {
    //if category is not added in DB so use default categories
    // let count = await ServiceCategory.countDocuments();

    // // Seed defaults if collection is empty
    // if (count === 0) {
    //   await ServiceCategory.insertMany(DEFAULT_CATEGORIES);
    // }

    const categories = await ServiceCategory.find({ isActive: true })
      .sort({ name: 1 })
      .select("name isActive");

    return res.json({ success: true, data: categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    if (req.userType !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can add categories' });
    }

    const { name, isActive = true } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    // Check duplicate by name (case-insensitive)
    const exists = await ServiceCategory.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Category already exists' });
    }

    const category = await ServiceCategory.create({ name: name.trim(), isActive });
    return res.status(201).json({ success: true, data: category, message: 'Category created' });
  } catch (error) {
    // Handle unique index error
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Category already exists' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};
