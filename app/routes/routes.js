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
import userSubscriptionController from '../controller/subscriptionController.js';
import { AuthCheck } from '../middleware/authCheck.js';
import debtController from '../controller/debtController.js';
import insuranceController from '../controller/insuranceController.js';
import utilsController from '../controller/utilsController.js';
import { UserModel } from '../models/userModel.js';
import bankingController from '../controller/bankingController.js';
import investmentController from '../controller/investmentController.js';
import enquiryController from '../controller/enquiryController.js';
import DashboardController from '../controller/DashboardController.js';
import adminDashboard from '../controller/adminDashboard.js';
const router = express.Router();

// Authentication Routes
router.post("/register" , authenticationController.register)
router.post("/verify-email" , authenticationController.verifyEmail)
router.get("/profile" ,AuthCheck, authenticationController.profile)
router.put("/update-profile" ,AuthCheck, authenticationController.updateProfile)
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
router.post("/create-insurances",AuthCheck ,insuranceController.createInsurance)
router.get("/insurances" ,AuthCheck , insuranceController.getAllInsurances)
router.get("/insurance/:id" ,AuthCheck , insuranceController.getInsuranceById)
router.put("/update-insurance/:id" ,AuthCheck , insuranceController.updateInsurance)
router.delete("/delelte-insurances/:id" ,AuthCheck , insuranceController.deleteInsurance) 



// Utils Manage Routes
router.post("/create-utilities",AuthCheck ,utilsController.createUtilities)
router.get("/utilities" ,AuthCheck , utilsController.getAllUtilities)
router.get("/utility/:id" ,AuthCheck , utilsController.getUtilityById)
router.put("/update-utility/:id" ,AuthCheck , utilsController.updateUtility)
router.delete("/delelte-utilities/:id" ,AuthCheck , utilsController.deleteUtility)

// Banking Manage Routes
router.post("/create-bankings",AuthCheck ,bankingController.createBanking)
router.get("/bankings" ,AuthCheck , bankingController.getAllBankings)
router.get("/banking/:id" ,AuthCheck , bankingController.getBankingById)
router.put("/update-banking/:id" ,AuthCheck , bankingController.updateBanking)
router.delete("/delelte-bankings/:id" ,AuthCheck , bankingController.deleteBanking)
router.get("/totle-bankings" ,AuthCheck, bankingController.getTotalBalance)

// Investment Manage Routes
router.post("/create-investments",AuthCheck ,investmentController.createInvestment)
router.get("/investments" ,AuthCheck , investmentController.getAllInvestments)
router.get("/investment/:id" ,AuthCheck , investmentController.getInvestmentById)
router.put("/update-investment/:id" ,AuthCheck , investmentController.updateInvestment)
router.delete("/delelte-investments/:id" ,AuthCheck , investmentController.deleteInvestment)
router.get("/totle-investments" ,AuthCheck, investmentController.getTotalInvestmentValue)


// Transition Manage Routes
router.post("/create-executors",AuthCheck, transitionController.createExecutor)
router.get("/executors" ,AuthCheck, transitionController.getAllExecutors)
router.get("/executor/:id" ,AuthCheck, transitionController.getExecutorById)
router.put("/update-executor/:id" ,AuthCheck, transitionController.updateExecutor)
router.delete("/delelte-executors/:id" ,AuthCheck, transitionController.deleteExecutor)
router.post("/executor/invite" , transitionController.handleInviteAction)


// Subscriptions 

router.post("/create-checkout-session", AuthCheck,userSubscriptionController.createCheckoutSession );
router.get("/verify-payment",AuthCheck , userSubscriptionController.verifyPayment );
router.get("/user/:userId",AuthCheck , userSubscriptionController.getUserSubscription); 

// Enquiry Manage Routes
router.post("/create-enquiry" , enquiryController.createEnquiry)
router.get("/enquiries" , enquiryController.getAllEnquiries)
router.get("/enquiry/:id" , enquiryController.getEnquiryById)
router.delete("/delelte-enquiries/:id" , enquiryController.deleteEnquiry)


// Dashboard 
router.get("/dashboard" ,AuthCheck, DashboardController.getDashboard)
router.get("/admin-dashboard" ,AuthCheck, adminDashboard.adminDashboard)



export default router