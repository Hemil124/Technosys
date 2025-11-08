import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import session from "express-session";

import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import morgan from "morgan";

import connectdb from "./config/mongodb.js";
import authRouter from "./routes/auth.route.js";
import userRoutesr from "./routes/user.route.js";
import adminRoutes from "./routes/admin.route.js";
import adminCreationRoute from "./routes/adminCreation.route.js";
import serviceCategoryRoutes from "./routes/serviceCategory.route.js";
import path from "path";
import { fileURLToPath } from "url";
import "./config/passport.js";

const app = express();
const port = process.env.PORT || 4000;

// get __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// connect database
connectdb();

// ✅ 1. CORS Setup (must come BEFORE Helmet)
const allowedOrigins = [
  "http://localhost:5173",
  "https://technosys.vercel.app",
  "https://technosys-murex.vercel.app", // your Vercel frontend
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow local dev + your frontend domain + any vercel preview
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // allow cookies
  })
);

// ✅ 2. Security Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" }, contentSecurityPolicy: false }));
app.use(hpp());
app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 1000,
  })
);
app.use(mongoSanitize());

// ✅ 3. Utilities
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },
}));
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// ✅ 4. Serve Static Uploads
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res, filePath) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      if (filePath.endsWith(".jpg") || filePath.endsWith(".png")) {
        res.setHeader("Cache-Control", "public, max-age=86400");
      }
    },
  })
);

// ✅ 5. Routes
app.get("/", (req, res) => res.json({ success: true, message: "Server healthy" }));
app.use("/api/auth", authRouter);
app.use("/api/user", userRoutesr);
app.use("/api/admin", adminRoutes);
app.use("/api/service-categories", serviceCategoryRoutes);
app.use("/api/admin-setup", adminCreationRoute);

// ✅ 6. Start Server
app.listen(port, () => console.log(`🚀 Server running on PORT: ${port}`));



// export const register = async (req, res) => {
//   try {
//     // Check if files were uploaded
//     if (!req.files || !req.files.idProof || !req.files.photo) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'ID proof and photo are required' 
//       });
//     }

//     // Extract form data from req.body
//     const { name, email, password, address, serviceCategoryID, bankAccountNo, ifscCode } = req.body;
    
//     // Validate required fields
//     if (!name || !email || !password || !address || !serviceCategoryID || !bankAccountNo || !ifscCode) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'All fields are required' 
//       });
//     }

//     // Check if technician already exists
//     const existingTechnician = await Technician.findOne({ Email: email });
//     if (existingTechnician) {
//       return res.status(409).json({ 
//         success: false, 
//         message: "Technician already exists with this email" 
//       });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Handle file uploads
//     const idProofPath = `/uploads/idProofs/${req.files.idProof[0].filename}`;
//     const photoPath = `/uploads/photos/${req.files.photo[0].filename}`;

//     // Create new technician
//     const technician = new Technician({ 
//       Name: name, 
//       Email: email, 
//       Password: hashedPassword,
//       Address: address,
//       ServiceCategoryID: serviceCategoryID,
//       BankAccountNo: bankAccountNo,
//       IFSCCode: ifscCode,
//       IDProof: idProofPath,
//       Photo: photoPath
//     });
    
//     await technician.save();

//     // Generate JWT token
//     const token = jwt.sign({ id: technician._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

//     // Set cookie
//     res.cookie('token', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
//       maxAge: 7 * 24 * 60 * 60 * 1000
//     });

//     // Send welcome email
//     const mailOptions = {
//       from: process.env.SENDER_EMAIL,
//       to: email,
//       subject: 'Welcome to Technosys - Technician Account Created',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: #4F46E5;">Welcome to Technosys!</h2>
//           <p>Your technician account has been successfully created with the following details:</p>
//           <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px;">
//             <p><strong>Name:</strong> ${name}</p>
//             <p><strong>Email:</strong> ${email}</p>
//             <p><strong>Service Category ID:</strong> ${serviceCategoryID}</p>
//           </div>
//           <p>Your account is currently under verification. You will be notified once it's approved.</p>
//           <p>Thank you for joining Skill-Swap!</p>
//         </div>
//       `
//     };
    
//     try {
//       await transporter.sendMail(mailOptions);
//     } catch (emailError) {
//       console.error('Email sending failed:', emailError);
//       // Don't fail the request if email fails
//     }

//     return res.status(201).json({ 
//       success: true, 
//       message: "Technician registered successfully",
//       data: {
//         id: technician._id,
//         name: technician.Name,
//         email: technician.Email
//       }
//     });

//   } catch (error) {
//     console.error('Registration error:', error);
    
//     // Handle multer errors
//     if (error.code === 'LIMIT_FILE_SIZE') {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'File too large. Maximum size is 5MB' 
//       });
//     }
    
//     return res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Internal server error' 
//     });
//   }
// };