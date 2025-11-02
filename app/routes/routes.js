import express from 'express';
import authenticationController from '../controller/authenticationController.js';
import bannerController from '../controller/bannerController.js';
import upload from '../middleware/upload.js';
import faqController from '../controller/faqController.js';
import pricingController from '../controller/pricingController.js';
import serviceController from '../controller/serviceController.js';
import userManageController from '../controller/userManageController.js';
import blogController from '../controller/blogController.js';
import assetsController from '../controller/assetsController.js';
import transitionController from '../controller/transitionController.js';
const router = express.Router();

// Authentication Routes
router.post("/register" , authenticationController.register)
router.post("/verify-email" , authenticationController.verifyEmail)
router.get("/profile" , authenticationController.profile)
router.put("/update-profile" , authenticationController.updateProfile)
router.post("/reset-password" , authenticationController.resetPassword)
router.post("/login" , authenticationController.login)
router.post("/logout" , authenticationController.logout)


// User Manage Routes For Admin 

router.get("/users" , userManageController.getAllUsers)
router.get("/user/:id" , userManageController.getUserById)
router.put("/update-user/:id" , userManageController.updateUser)
router.delete("/delelte-users/:id" , userManageController.deleteUser)


// Banner Routes

router.post("/create-banners" ,upload.single("imageUrl") , bannerController.createBanner)
router.get("/banners" , bannerController.getBanners)
router.get("/banner/:id" , bannerController.getBannerById)
router.put("/update-banner/:id" ,upload.single("imageUrl") , bannerController.updateBanner)
router.delete("/delelte-banners/:id" , bannerController.deleteBanner)


// FAQ Routes
router.post("/create-faqs" , faqController.createFaq)
router.get("/faqs" , faqController.getFaqs)
router.get("/faq/:id" , faqController.getFaq)
router.put("/update-faq/:id" , faqController.updateFaq)
router.delete("/delelte-faqs/:id" , faqController.deleteFaq)


// Pricing Routes 
router.post("/create-pricings" , pricingController.createPricing)
router.get("/pricings" , pricingController.getPricings)
router.get("/pricing/:id" , pricingController.getPricing)
router.put("/update-pricing/:id" , pricingController.updatePricing)
router.delete("/delelte-pricings/:id" , pricingController.deletePricing)

// Service Routes
router.post("/create-services" ,upload.single("imageUrl") ,  serviceController.createService)
router.get("/services" , serviceController.getServices)
router.get("/service/:id" , serviceController.getServiceById)
router.put("/update-service/:id" ,upload.single("imageUrl") , serviceController.updateService)
router.delete("/delelte-services/:id" , serviceController.deleteService)

// Blog Manage Routes 
router.post("/create-blogs" ,upload.single("coverImage") , blogController.createBlog)
router.get("/blogs" , blogController.getAllBlogs)
router.get("/blog/:id" , blogController.getBlogBySlug)
router.put("/update-blog/:id" ,upload.single("coverImage") , blogController.updateBlog)
router.delete("/delelte-blogs/:id" , blogController.deleteBlog)

// Assets Manage Routes 
router.post("/crate-assets",assetsController.createAsset)
router.get("/assets" , assetsController.getAllAssets)
router.get("/asset/:id" , assetsController.getAssetById)
router.put("/update-asset/:id" , assetsController.updateAsset)
router.delete("/delelte-assets/:id" , assetsController.deleteAsset)

// Debts Manage Routes
router.post("/create-debts",assetsController.createAsset)
router.get("/debts" , assetsController.getAllAssets)
router.get("/debt/:id" , assetsController.getAssetById)
router.put("/update-debt/:id" , assetsController.updateAsset)
router.delete("/delelte-debts/:id" , assetsController.deleteAsset)


// Insurance Manage Routes
router.post("/create-insurances",assetsController.createAsset)
router.get("/insurances" , assetsController.getAllAssets)
router.get("/insurance/:id" , assetsController.getAssetById)
router.put("/update-insurance/:id" , assetsController.updateAsset)
router.delete("/delelte-insurances/:id" , assetsController.deleteAsset) 


// Transition Manage Routes
router.post("/create-executors", transitionController.createExecutor)
router.get("/executors" , transitionController.getAllExecutors)
router.get("/executor/:id" , transitionController.getExecutorById)
router.put("/update-executor/:id" , transitionController.updateExecutor)
router.delete("/delelte-executors/:id" , transitionController.deleteExecutor)




export default router