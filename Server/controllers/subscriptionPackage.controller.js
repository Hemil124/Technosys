// controllers/subscriptionPackage.controller.js
import SubscriptionPackage from "../models/SubscriptionPackage.js";
import { validationResult } from "express-validator";
import SubscriptionHistory from "../models/SubscriptionHistory.js";
import TechnicianWallet from "../models/TechnicianWallet.js";
import SubscriptionPayment from "../models/SubscriptionPayment.js";
import Invoice from "../models/Invoice.js";
import Technician from "../models/Technician.js";
import transporter from "../config/nodemailer.js";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
    
// @desc    Create Razorpay order for a subscription package (technician)
// @route   POST /api/subscription-packages/:id/create-order
// @access  Technician only
export const createRazorpayOrder = async (req, res) => {
  try {
    if (!req.userType || req.userType !== 'technician') {
      return res.status(403).json({ success: false, message: 'Access denied. Technician only.' });
    }

    const packageId = req.params.id;
    const subscriptionPackage = await SubscriptionPackage.findById(packageId);

    if (!subscriptionPackage || !subscriptionPackage.isActive) {
      return res.status(404).json({ success: false, message: 'Subscription package not found or not active' });
    }

    // Ensure Razorpay keys are present
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay keys not configured in env');
      return res.status(500).json({ success: false, message: 'Razorpay keys not configured on server' });
    }

    const amount = Math.round((subscriptionPackage.price || 0) * 100); // amount in paise

    // Build a short receipt id (Razorpay requires <= 40 chars)
    const rawReceipt = `rcpt_${req.userId}_${Date.now()}`;
    let receipt = rawReceipt;
    if (receipt.length > 40) {
      // try a compact form using last 8 chars of userId and last 6 of timestamp
      receipt = `rcpt_${String(req.userId).slice(-8)}_${String(Date.now()).slice(-6)}`;
    }
    if (receipt.length > 40) {
      // fallback to a short random hex string
      receipt = `rcpt_${crypto.randomBytes(8).toString('hex')}`;
    }

    const orderOptions = {
      amount,
      currency: 'INR',
      receipt,
      payment_capture: 1,
    };

    let order;
    try {
      order = await razorpayInstance.orders.create(orderOptions);
    } catch (provErr) {
      // log provider error details for debugging (avoid leaking secrets)
      try {
        console.error('Razorpay provider error creating order:', provErr && provErr.message ? provErr.message : provErr);
        // log full object for debugging (this stays server-side)
        console.error('Razorpay provider full error:', provErr);
      } catch (logErr) {
        console.error('Error logging provider error', logErr);
      }

      // Try to extract safe detail fields
      const provDetail = provErr?.error?.description || provErr?.error || provErr?.message || (typeof provErr === 'string' ? provErr : undefined);

      return res.status(502).json({
        success: false,
        message: 'Failed to create payment order with provider',
        detail: provDetail
      });
    }

    // Create pending payment record
    const payment = new SubscriptionPayment({
      TechnicianID: req.userId,
      PackageID: subscriptionPackage._id,
      Amount: subscriptionPackage.price,
      Method: 'Razorpay',
      Status: 'Pending',
      ProviderOrderId: order.id,
    });

    await payment.save();

    return res.status(200).json({
      success: true,
      message: 'Razorpay order created',
      data: { order, paymentId: payment._id },
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

// @desc    Verify Razorpay payment signature and finalize subscription
// @route   POST /api/subscription-packages/verify-payment
// @access  Technician only
export const verifyRazorpayPayment = async (req, res) => {
  try {
    if (!req.userType || req.userType !== 'technician') {
      return res.status(403).json({ success: false, message: 'Access denied. Technician only.' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !paymentId) {
      return res.status(400).json({ success: false, message: 'Incomplete payment verification data' });
    }

    // verify signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const paymentRecord = await SubscriptionPayment.findById(paymentId);
    if (!paymentRecord) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (generated_signature !== razorpay_signature) {
      paymentRecord.Status = 'Failed';
      paymentRecord.ProviderPaymentId = razorpay_payment_id;
      paymentRecord.ProviderSignature = razorpay_signature;
      await paymentRecord.save();

      return res.status(400).json({ success: false, message: 'Payment signature verification failed' });
    }

    // Signature valid -> mark success and create history + update wallet
    paymentRecord.Status = 'Success';
    paymentRecord.ProviderPaymentId = razorpay_payment_id;
    paymentRecord.ProviderSignature = razorpay_signature;
    await paymentRecord.save();

    // Create subscription history
    const history = new SubscriptionHistory({
      TechnicianID: req.userId,
      PackageID: paymentRecord.PackageID,
      PurchasedAt: new Date()
    });
    await history.save();

    // Update payment record with history id
    paymentRecord.HistoryID = history._id;
    await paymentRecord.save();

    // Update or create technician wallet
    const subscriptionPackage = await SubscriptionPackage.findById(paymentRecord.PackageID);
    const coinsToAdd = subscriptionPackage?.coins || 0;

    const updatedWallet = await TechnicianWallet.findOneAndUpdate(
      { TechnicianID: req.userId },
      {
        $inc: { BalanceCoins: coinsToAdd },
        $set: { LastUpdate: new Date() }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Generate invoice PDF, store it and email to technician
    (async () => {
      try {
        // fetch technician details
        const tech = await Technician.findById(req.userId).lean();
        const invoiceDir = path.join(process.cwd(), 'uploads', 'invoices');
        if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir, { recursive: true });

        const invoiceFilename = `invoice_${String(paymentRecord._id)}.pdf`;
        const invoicePath = path.join(invoiceDir, invoiceFilename);

        // create PDF
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const stream = fs.createWriteStream(invoicePath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('Technosys Invoice', { align: 'center' });
        doc.moveDown();

        // Invoice meta
        doc.fontSize(12).text(`Invoice ID: ${paymentRecord._id}`);
        doc.text(`Payment ID: ${paymentRecord.ProviderPaymentId || ''}`);
        doc.text(`Date: ${new Date().toLocaleString()}`);
        doc.moveDown();

        // Technician
        doc.text('Billed To:', { underline: true });
        doc.text(`${tech?.Name || tech?.name || ''}`);
        doc.text(`${tech?.Email || tech?.email || ''}`);
        if (tech?.MobileNumber) doc.text(`${tech.MobileNumber}`);
        doc.moveDown();

        // Package details
        doc.text('Package:', { underline: true });
        doc.text(`${subscriptionPackage?.name || ''}`);
        doc.text(`Coins: ${subscriptionPackage?.coins || 0}`);
        doc.text(`Amount: ₹${paymentRecord.Amount || subscriptionPackage?.price || 0}`);
        doc.moveDown();

        doc.text('Thank you for your purchase.', { align: 'left' });

        doc.end();

        // wait for stream finish
        await new Promise((resolve, reject) => {
          stream.on('finish', resolve);
          stream.on('error', reject);
        });

        // store Invoice document
        const invoiceDoc = new Invoice({
          ref_type: 'SubscriptionPayment',
          ref_id: paymentRecord._id,
          invoice_pdf: `/uploads/invoices/${invoiceFilename}`,
        });
        await invoiceDoc.save();

        // send email with attachment if email exists
        if (tech?.Email) {
          const mailOptions = {
            from: process.env.SENDER_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER,
            to: tech.Email,
            subject: 'Your Technosys Invoice',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #155DFC; text-align: center;">Invoice from Technosys</h2>
                <p>Dear <strong>${tech?.Name || ''}</strong>,</p>
                <p>Thank you for your purchase. Please find the invoice attached for your recent subscription.</p>

                <div style="background-color: #f3f4f6; padding: 12px; border-radius: 8px; margin: 18px 0;">
                  <p style="margin: 0;"><strong>Invoice Details</strong></p>
                  <ul style="margin: 8px 0 0 16px; padding: 0;">
                    <li><strong>Invoice ID:</strong> ${paymentRecord._id}</li>
                    <li><strong>Payment ID:</strong> ${paymentRecord.ProviderPaymentId || ''}</li>
                    <li><strong>Package:</strong> ${subscriptionPackage?.name || ''}</li>
                    <li><strong>Amount:</strong> ₹${paymentRecord.Amount || subscriptionPackage?.price || 0}</li>
                  </ul>
                </div>

                <p>If you have any questions, please contact our support team.</p>

                <p>Best regards,<br/><strong>Technosys Team</strong></p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;"/>
                <p style="color: #6b7280; font-size: 12px; text-align: center;">This is an automated message. Please do not reply to this email.</p>
              </div>
            `,
            attachments: [
              {
                filename: invoiceFilename,
                path: invoicePath,
              },
            ],
          };

          try {
            await transporter.sendMail(mailOptions);
            console.log(`Invoice email sent to: ${tech.Email}`);
          } catch (mailErr) {
            console.error('Invoice email send failed', mailErr);
          }
        }
      } catch (invErr) {
        console.error('Invoice generation error', invErr);
      }
    })();

    return res.status(200).json({ success: true, message: 'Payment verified and subscription applied', data: { history, wallet: updatedWallet, payment: paymentRecord } });
  } catch (error) {
    console.error('Verify Razorpay payment error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};