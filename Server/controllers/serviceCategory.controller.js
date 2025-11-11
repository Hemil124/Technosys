// import ServiceCategory from "../models/ServiceCategory.js";

// export const getAllCategories = async (req, res) => {
//   try {
//     // Return all categories (public endpoint). Admins and non-admins will receive
//     // the full list; frontend can choose how to present active/inactive ones.
//     const categories = await ServiceCategory.find({})
//       .sort({ name: 1 })
//       .select("name isActive image");

//     return res.json({ success: true, data: categories });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const createCategory = async (req, res) => {
//   try {
//     if (req.userType !== 'admin') {
//       return res.status(403).json({ success: false, message: 'Only admin can add categories' });
//     }

//     const { name } = req.body;
//     let { isActive } = req.body;
//     if (typeof isActive === 'string') {
//       isActive = isActive === 'true';
//     }
//     if (isActive === undefined || isActive === null) isActive = true;

//     if (!name || !name.trim()) {
//       return res.status(400).json({ success: false, message: 'Name is required' });
//     }

//     // Image is mandatory for new categories
//     if (!req.file) {
//       return res.status(400).json({ success: false, message: 'Category image is required' });
//     }

//     // Check duplicate by name (case-insensitive)
//     const exists = await ServiceCategory.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
//     if (exists) {
//       return res.status(409).json({ success: false, message: 'Category already exists' });
//     }

//     // If an image was uploaded by multer, save its path
//     let imagePath = null;
//     if (req.file && req.file.filename) {
//       imagePath = `/uploads/categories/${req.file.filename}`;
//     }

//     const category = await ServiceCategory.create({ name: name.trim(), isActive, image: imagePath });
//     return res.status(201).json({ success: true, data: category, message: 'Category created' });
//   } catch (error) {
//     // Handle unique index error
//     if (error.code === 11000) {
//       return res.status(409).json({ success: false, message: 'Category already exists' });
//     }
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const updateCategory = async (req, res) => {
//   try {
//     if (req.userType !== 'admin') {
//       return res.status(403).json({ success: false, message: 'Only admin can update categories' });
//     }

//     const { id } = req.params;
//     const { name } = req.body;
//     let { isActive } = req.body;
//     if (typeof isActive === 'string') {
//       isActive = isActive === 'true';
//     }

//     if (!name || !name.trim()) {
//       return res.status(400).json({ success: false, message: 'Name is required' });
//     }

//     // Check if category exists
//     const category = await ServiceCategory.findById(id);
//     if (!category) {
//       return res.status(404).json({ success: false, message: 'Category not found' });
//     }

//     // Check duplicate name (case-insensitive) excluding current category
//     const duplicate = await ServiceCategory.findOne({
//       _id: { $ne: id },
//       name: { $regex: `^${name.trim()}$`, $options: 'i' }
//     });
//     if (duplicate) {
//       return res.status(409).json({ success: false, message: 'Category name already exists' });
//     }

//     // Update category
//     category.name = name.trim();
//     if (isActive !== undefined) {
//       category.isActive = isActive;
//     }

//     // If a new image was uploaded, update the image path
//     if (req.file && req.file.filename) {
//       category.image = `/uploads/categories/${req.file.filename}`;
//     }

//     await category.save();

//     return res.json({ success: true, data: category, message: 'Category updated successfully' });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(409).json({ success: false, message: 'Category name already exists' });
//     }
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const deleteCategory = async (req, res) => {
//   try {
//     if (req.userType !== 'admin') {
//       return res.status(403).json({ success: false, message: 'Only admin can delete categories' });
//     }

//     const { id } = req.params;

//     // Check if category exists
//     const category = await ServiceCategory.findById(id);
//     if (!category) {
//       return res.status(404).json({ success: false, message: 'Category not found' });
//     }

//     // Soft delete: Set isActive to false instead of removing from database
//     category.isActive = false;
//     await category.save();

//     return res.json({ 
//       success: true, 
//       message: 'Category deactivated successfully',
//       data: category
//     });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };


import ServiceCategory from "../models/ServiceCategory.js";
import SubServiceCategory from "../models/SubServiceCategory.js"; // Add this import

export const getAllCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.find({})
      .sort({ name: 1 })
      .select("name isActive image");

    // ✅ Simplified response for frontend
    return res.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ message: "Failed to fetch categories" });
  }
};


export const createCategory = async (req, res) => {
  try {
    if (req.userType !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can add categories' });
    }

    const { name } = req.body;
    let { isActive } = req.body;
    if (typeof isActive === 'string') {
      isActive = isActive === 'true';
    }
    if (isActive === undefined || isActive === null) isActive = true;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    // Image is mandatory for new categories
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Category image is required' });
    }

    // Check duplicate by name (case-insensitive)
    const exists = await ServiceCategory.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Category already exists' });
    }

    // If an image was uploaded by multer, save its path
    let imagePath = null;
    if (req.file && req.file.filename) {
      imagePath = `/uploads/categories/${req.file.filename}`;
    }

    const category = await ServiceCategory.create({ name: name.trim(), isActive, image: imagePath });
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
    const { name } = req.body;
    let { isActive } = req.body;
    if (typeof isActive === 'string') {
      isActive = isActive === 'true';
    }

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

    // Store previous active status to detect changes
    const wasActive = category.isActive;

    // Update category
    category.name = name.trim();
    if (isActive !== undefined) {
      category.isActive = isActive;
    }

    // If a new image was uploaded, update the image path
    if (req.file && req.file.filename) {
      category.image = `/uploads/categories/${req.file.filename}`;
    }

    await category.save();

    // CRITICAL: If category is being deactivated, also deactivate all its sub-categories
    if (wasActive === true && isActive === false) {
      await SubServiceCategory.updateMany(
        { serviceCategoryId: id },
        { isActive: false }
      );
      console.log(`Deactivated all sub-categories for category: ${category.name}`);
    }

    return res.json({ 
      success: true, 
      data: category, 
      message: wasActive && !isActive 
        ? 'Category and all its sub-categories deactivated successfully' 
        : 'Category updated successfully'
    });
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

    // CRITICAL: Also deactivate all sub-categories when main category is deleted
    await SubServiceCategory.updateMany(
      { serviceCategoryId: id },
      { isActive: false }
    );

    return res.json({ 
      success: true, 
      message: 'Category and all its sub-categories deactivated successfully',
      data: category
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};