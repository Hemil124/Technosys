// controllers/subscriptionPackage.controller.js
import SubscriptionPackage from "../models/SubscriptionPackage.js";
import { validationResult } from "express-validator";
import SubscriptionHistory from "../models/SubscriptionHistory.js";
import TechnicianWallet from "../models/TechnicianWallet.js";

// @desc    Get all subscription packages
// @route   GET /api/subscription-packages
// @access  Public (All users)
export const getAllSubscriptionPackages = async (req, res) => {
  try {
    const { isActive } = req.query;
    
    let filter = {};
    // Only apply isActive filter if explicitly requested
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    } else {
      // By default, show active packages to non-admin users
      if (!req.userType || req.userType !== 'admin') {
        filter.isActive = true;
      }
    }

    const packages = await SubscriptionPackage.find({}).sort({ price: 1 });
    
    return res.status(200).json({
      success: true,
      message: "Subscription packages retrieved successfully",
      data: packages
    });
  } catch (error) {
    console.error("Get subscription packages error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// @desc    Get single subscription package
// @route   GET /api/subscription-packages/:id
// @access  Public (All users)
export const getSubscriptionPackage = async (req, res) => {
  try {
    const subscriptionPackage = await SubscriptionPackage.findById(req.params.id);

    if (!subscriptionPackage) {
      return res.status(404).json({
        success: false,
        message: "Subscription package not found"
      });
    }

    // Non-admin users can only see active packages
    if ((!req.userType || req.userType !== 'admin') && !subscriptionPackage.isActive) {
      return res.status(404).json({
        success: false,
        message: "Subscription package not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subscription package retrieved successfully",
      data: subscriptionPackage
    });
  } catch (error) {
    console.error("Get subscription package error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// @desc    Create new subscription package
// @route   POST /api/subscription-packages
// @access  Admin only
export const createSubscriptionPackage = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const { name, coins, price, description, isActive = true } = req.body;

    // Check if package with same name already exists
    const existingPackage = await SubscriptionPackage.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingPackage) {
      return res.status(409).json({
        success: false,
        message: "Subscription package with this name already exists"
      });
    }

    const subscriptionPackage = new SubscriptionPackage({
      name,
      coins,
      price,
      description,
      isActive
    });

    await subscriptionPackage.save();

    return res.status(201).json({
      success: true,
      message: "Subscription package created successfully",
      data: subscriptionPackage
    });
  } catch (error) {
    console.error("Create subscription package error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// @desc    Update subscription package
// @route   PUT /api/subscription-packages/:id
// @access  Admin only
export const updateSubscriptionPackage = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const { name, coins, price, description, isActive } = req.body;

    // Check if package exists
    const existingPackage = await SubscriptionPackage.findById(req.params.id);
    if (!existingPackage) {
      return res.status(404).json({
        success: false,
        message: "Subscription package not found"
      });
    }

    // Check if another package with same name exists (excluding current package)
    if (name && name !== existingPackage.name) {
      const duplicatePackage = await SubscriptionPackage.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      
      if (duplicatePackage) {
        return res.status(409).json({
          success: false,
          message: "Subscription package with this name already exists"
        });
      }
    }

    // Update package
    const updatedPackage = await SubscriptionPackage.findByIdAndUpdate(
      req.params.id,
      {
        name: name || existingPackage.name,
        coins: coins !== undefined ? coins : existingPackage.coins,
        price: price !== undefined ? price : existingPackage.price,
        description: description !== undefined ? description : existingPackage.description,
        isActive: isActive !== undefined ? isActive : existingPackage.isActive
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Subscription package updated successfully",
      data: updatedPackage
    });
  } catch (error) {
    console.error("Update subscription package error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// @desc    Delete subscription package
// @route   DELETE /api/subscription-packages/:id
// @access  Admin only
export const deleteSubscriptionPackage = async (req, res) => {
  try {
    const subscriptionPackage = await SubscriptionPackage.findByIdAndDelete(req.params.id);

    if (!subscriptionPackage) {
      return res.status(404).json({
        success: false,
        message: "Subscription package not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subscription package deleted successfully"
    });
  } catch (error) {
    console.error("Delete subscription package error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// @desc    Toggle package status
// @route   PATCH /api/subscription-packages/:id/toggle-status
// @access  Admin only
export const togglePackageStatus = async (req, res) => {
  try {
    const subscriptionPackage = await SubscriptionPackage.findById(req.params.id);

    if (!subscriptionPackage) {
      return res.status(404).json({
        success: false,
        message: "Subscription package not found"
      });
    }

    subscriptionPackage.isActive = !subscriptionPackage.isActive;
    await subscriptionPackage.save();

    return res.status(200).json({
      success: true,
      message: `Package ${subscriptionPackage.isActive ? 'activated' : 'deactivated'} successfully`,
      data: subscriptionPackage
    });
  } catch (error) {
    console.error("Toggle package status error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// @desc    Purchase a subscription package (technician)
// @route   POST /api/subscription-packages/:id/purchase
// @access  Technician only
export const purchaseSubscription = async (req, res) => {
  try {
    if (!req.userType || req.userType !== 'technician') {
      return res.status(403).json({ success: false, message: 'Access denied. Technician only.' });
    }

    const packageId = req.params.id;
    const subscriptionPackage = await SubscriptionPackage.findById(packageId);

    if (!subscriptionPackage || !subscriptionPackage.isActive) {
      return res.status(404).json({ success: false, message: 'Subscription package not found or not active' });
    }

    const technicianId = req.userId;

    // Create subscription history record
    const history = new SubscriptionHistory({
      TechnicianID: technicianId,
      PackageID: subscriptionPackage._id,
      PurchasedAt: new Date()
    });

    await history.save();

    // Update or create technician wallet
    const coinsToAdd = subscriptionPackage.coins || 0;

    const updatedWallet = await TechnicianWallet.findOneAndUpdate(
      { TechnicianID: technicianId },
      {
        $inc: { BalanceCoins: coinsToAdd },
        $set: { LastUpdate: new Date() }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // If upsert created a document without BalanceCoins initialized, ensure default applied
    if (!updatedWallet.BalanceCoins && updatedWallet.BalanceCoins !== 0) {
      updatedWallet.BalanceCoins = coinsToAdd;
      updatedWallet.LastUpdate = new Date();
      await updatedWallet.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Subscription purchased successfully',
      data: { history, wallet: updatedWallet }
    });
  } catch (error) {
    console.error('Purchase subscription error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

// @desc    Get subscription purchase history for technician
// @route   GET /api/subscription-packages/history
// @access  Technician only
export const getSubscriptionHistory = async (req, res) => {
  try {
    if (!req.userType || req.userType !== 'technician') {
      return res.status(403).json({ success: false, message: 'Access denied. Technician only.' });
    }

    const technicianId = req.userId;

    const history = await SubscriptionHistory.find({ TechnicianID: technicianId })
      .populate({ path: 'PackageID', select: 'name coins price description' })
      .sort({ PurchasedAt: -1 });

    return res.status(200).json({ success: true, message: 'Purchase history retrieved', data: history });
  } catch (error) {
    console.error('Get subscription history error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};