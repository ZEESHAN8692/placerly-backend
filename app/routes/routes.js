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
import subscriptionController from '../controller/subscriptionController.js';
import { AuthCheck } from '../middleware/authCheck.js';
import debtController from '../controller/debtController.js';
const router = express.Router();

// Authentication Routes
router.post("/register" , authenticationController.register)
router.post("/verify-email" , authenticationController.verifyEmail)
router.get("/profile" ,AuthCheck, authenticationController.profile)
router.put("/update-profile" , authenticationController.updateProfile)
router.post("/reset-password" ,AuthCheck, authenticationController.resetPassword)
router.post("/login" , authenticationController.login)
router.post("/admin-login" , authenticationController.adminLogin)
router.post("/logout" ,AuthCheck, authenticationController.logout)


// User Manage Routes For Admin 

router.get("/users" ,AuthCheck, userManageController.getAllUsers)
router.get("/user/:id" ,AuthCheck, userManageController.getUserById)
router.put("/update-user/:id" ,AuthCheck, userManageController.updateUser)
router.delete("/delelte-users/:id" ,AuthCheck, userManageController.deleteUser)


// Banner Routes

router.post("/create-banners" ,upload.single("imageUrl") ,AuthCheck, bannerController.createBanner)
router.get("/banners" , bannerController.getBanners)
router.get("/banner/:id" , bannerController.getBannerById)
router.put("/update-banner/:id" ,upload.single("imageUrl") ,AuthCheck, bannerController.updateBanner)
router.delete("/delelte-banners/:id" ,AuthCheck, bannerController.deleteBanner)


// FAQ Routes
router.post("/create-faqs" ,AuthCheck, faqController.createFaq)
router.get("/faqs" , faqController.getFaqs)
router.get("/faq/:id" , faqController.getFaq)
router.put("/update-faq/:id" ,AuthCheck, faqController.updateFaq)
router.delete("/delelte-faqs/:id" ,AuthCheck, faqController.deleteFaq)


// Pricing Routes 
router.post("/create-pricings" ,AuthCheck, pricingController.createPricing)
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

router.post("/add-comment/:id" , blogController.addComment)
router.delete("/delete-comment/:id/:commentId" , blogController.deleteComment)
router.get("/get-comments/:id" , blogController.getComments)

// Subscription Routes


// Assets Manage Routes 
router.post("/crate-assets",AuthCheck,assetsController.createAsset)
router.get("/assets" ,AuthCheck, assetsController.getAllAssets)
router.get("/asset/:id" ,AuthCheck, assetsController.getAssetById)
router.put("/update-asset/:id" ,AuthCheck, assetsController.updateAsset)
router.delete("/delelte-assets/:id" ,AuthCheck, assetsController.deleteAsset)
router.get("/totle-assets" ,AuthCheck, assetsController.getTotalAssetsValue)


// Debts Manage Routes
router.post("/create-debts",AuthCheck ,debtController.createDebt)
router.get("/debts" ,AuthCheck , debtController.getAllDebts)
router.get("/debt/:id" ,AuthCheck , debtController.getDebtById)
router.put("/update-debt/:id" ,AuthCheck , debtController.updateDebt)
router.delete("/delelte-debts/:id" ,AuthCheck , debtController.deleteDebt)
router.get("/totle-debts" ,AuthCheck, debtController.getTotalDebtsValue)



// Insurance Manage Routes
router.post("/create-insurances",AuthCheck ,assetsController.createAsset)
router.get("/insurances" ,AuthCheck , assetsController.getAllAssets)
router.get("/insurance/:id" ,AuthCheck , assetsController.getAssetById)
router.put("/update-insurance/:id" ,AuthCheck , assetsController.updateAsset)
router.delete("/delelte-insurances/:id" ,AuthCheck , assetsController.deleteAsset) 


// Transition Manage Routes
router.post("/create-executors", transitionController.createExecutor)
router.get("/executors" , transitionController.getAllExecutors)
router.get("/executor/:id" , transitionController.getExecutorById)
router.put("/update-executor/:id" , transitionController.updateExecutor)
router.delete("/delelte-executors/:id" , transitionController.deleteExecutor)




export default router