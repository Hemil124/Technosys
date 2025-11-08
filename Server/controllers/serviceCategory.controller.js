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

export const updateCategory = async (req, res) => {
  try {
    if (req.userType !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can update categories' });
    }

    const { id } = req.params;
    const { name, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    // Check if category exists
    const category = await ServiceCategory.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check duplicate name (case-insensitive) excluding current category
    const duplicate = await ServiceCategory.findOne({
      _id: { $ne: id },
      name: { $regex: `^${name.trim()}$`, $options: 'i' }
    });
    if (duplicate) {
      return res.status(409).json({ success: false, message: 'Category name already exists' });
    }

    // Update category
    category.name = name.trim();
    if (isActive !== undefined) {
      category.isActive = isActive;
    }
    await category.save();

    return res.json({ success: true, data: category, message: 'Category updated successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Category name already exists' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    if (req.userType !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can delete categories' });
    }

    const { id } = req.params;

    // Check if category exists
    const category = await ServiceCategory.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Soft delete: Set isActive to false instead of removing from database
    category.isActive = false;
    await category.save();

    return res.json({ 
      success: true, 
      message: 'Category deactivated successfully',
      data: category
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
