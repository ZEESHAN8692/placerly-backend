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
import { AuthCheck , adminCheck, executorBlock } from '../middleware/authCheck.js';
import debtController from '../controller/debtController.js';
import insuranceController from '../controller/insuranceController.js';
import utilsController from '../controller/utilsController.js';
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

router.get("/users" ,AuthCheck,adminCheck, userManageController.getAllUsers)
router.get("/user/:id" ,AuthCheck,adminCheck, userManageController.getUserById)
router.put("/update-user/:id" ,AuthCheck,adminCheck, userManageController.updateUser)
router.delete("/delelte-users/:id" ,AuthCheck,adminCheck, userManageController.deleteUser)


// Banner Routes

router.post("/create-banners" ,upload.single("imageUrl") ,AuthCheck,adminCheck, bannerController.createBanner)
router.get("/banners" , bannerController.getBanners)
router.get("/banner/:id" , bannerController.getBannerById)
router.put("/update-banner/:id" ,upload.single("imageUrl") ,AuthCheck,adminCheck, bannerController.updateBanner)
router.delete("/delelte-banners/:id" ,AuthCheck,adminCheck, bannerController.deleteBanner)


// FAQ Routes
router.post("/create-faqs" ,AuthCheck,adminCheck, faqController.createFaq)
router.get("/faqs" , faqController.getFaqs)
router.get("/faq/:id" , faqController.getFaq)
router.put("/update-faq/:id" ,AuthCheck, adminCheck,faqController.updateFaq)
router.delete("/delete-faq/:id" ,AuthCheck,adminCheck, faqController.deleteFaq)


// Pricing Routes 
router.post("/create-pricings" ,AuthCheck,adminCheck, pricingController.createPricing)
router.get("/pricings" , pricingController.getPricings)
router.get("/pricing/:id" , pricingController.getPricing)
router.put("/update-pricing/:id" ,AuthCheck, adminCheck, pricingController.updatePricing)
router.delete("/delelte-pricings/:id" ,AuthCheck ,adminCheck, pricingController.deletePricing)

// Service Routes
router.post("/create-services" ,upload.single("imageUrl") ,AuthCheck , adminCheck,  serviceController.createService)
router.get("/services" , serviceController.getServices)
router.get("/service/:id" , serviceController.getServiceById)
router.put("/update-service/:id" ,upload.single("imageUrl") ,adminCheck,AuthCheck, serviceController.updateService)
router.delete("/delelte-services/:id" ,AuthCheck , adminCheck, serviceController.deleteService)

// Blog Manage Routes 
router.post("/create-blogs" ,upload.single("coverImage") ,adminCheck,AuthCheck, blogController.createBlog)
router.get("/blogs" , blogController.getAllBlogs)
router.get("/blog/:slug" , blogController.getBlogBySlug)
router.get("/blog-by-id/:id" , blogController.getBlogById)
router.put("/update-blog/:id" ,upload.single("coverImage") ,adminCheck,AuthCheck, blogController.updateBlog)
router.delete("/delete-blog/:id" ,adminCheck,AuthCheck, blogController.deleteBlog)

router.post("/add-comment/:id" ,AuthCheck, blogController.addComment)
router.delete("/delete-comment/:id/:commentId" ,AuthCheck, blogController.deleteComment)
router.get("/get-comments/:id" ,AuthCheck, blogController.getComments)



// Assets Manage Routes 
router.post("/crate-assets",AuthCheck,executorBlock, assetsController.createAsset)
router.get("/assets" ,AuthCheck, assetsController.getAllAssets)
router.get("/asset/:id" ,AuthCheck, assetsController.getAssetById)
router.put("/update-asset/:id" ,AuthCheck,executorBlock,  assetsController.updateAsset)
router.delete("/delelte-assets/:id" ,AuthCheck,executorBlock,  assetsController.deleteAsset)
router.get("/totle-assets" ,AuthCheck, assetsController.getTotalAssetsValue)


// Debts Manage Routes
router.post("/create-debts",AuthCheck ,executorBlock, debtController.createDebt)
router.get("/debts" ,AuthCheck , debtController.getAllDebts)
router.get("/debt/:id" ,AuthCheck , debtController.getDebtById)
router.put("/update-debt/:id" ,AuthCheck ,executorBlock,  debtController.updateDebt)
router.delete("/delelte-debts/:id" ,AuthCheck ,executorBlock,  debtController.deleteDebt)
router.get("/totle-debts" ,AuthCheck, debtController.getTotalDebtsValue)



// Insurance Manage Routes
router.post("/create-insurances",AuthCheck ,executorBlock, insuranceController.createInsurance)
router.get("/insurances" ,AuthCheck , insuranceController.getAllInsurances)
router.get("/insurance/:id" ,AuthCheck , insuranceController.getInsuranceById)
router.put("/update-insurance/:id" ,AuthCheck ,executorBlock,  insuranceController.updateInsurance)
router.delete("/delelte-insurances/:id" ,AuthCheck ,executorBlock,  insuranceController.deleteInsurance) 

 
// Utils Manage Routes
router.post("/create-utilities",AuthCheck ,executorBlock, utilsController.createUtilities)
router.get("/utilities" ,AuthCheck , utilsController.getAllUtilities)
router.get("/utility/:id" ,AuthCheck , utilsController.getUtilityById)
router.put("/update-utility/:id" ,AuthCheck , executorBlock, utilsController.updateUtility)
router.delete("/delelte-utilities/:id" ,AuthCheck ,executorBlock,  utilsController.deleteUtility)

// Banking Manage Routes
router.post("/create-bankings",AuthCheck , executorBlock, bankingController.createBanking)
router.get("/bankings" ,AuthCheck , bankingController.getAllBankings)
router.get("/banking/:id" ,AuthCheck , bankingController.getBankingById)
router.put("/update-banking/:id" ,AuthCheck ,executorBlock,  bankingController.updateBanking)
router.delete("/delelte-bankings/:id" ,AuthCheck ,executorBlock,  bankingController.deleteBanking)
router.get("/totle-bankings" ,AuthCheck, bankingController.getTotalBalance) 

// Investment Manage Routes
router.post("/create-investments",AuthCheck ,executorBlock, investmentController.createInvestment)
router.get("/investments" ,AuthCheck , investmentController.getAllInvestments)
router.get("/investment/:id" ,AuthCheck , investmentController.getInvestmentById)
router.put("/update-investment/:id" ,AuthCheck , executorBlock, investmentController.updateInvestment)
router.delete("/delelte-investments/:id" ,AuthCheck ,executorBlock,  investmentController.deleteInvestment)
router.get("/totle-investments" ,AuthCheck, investmentController.getTotalInvestmentValue)


// Transition Manage Routes
router.post("/create-executors",AuthCheck, executorBlock, transitionController.createExecutor)
router.get("/executors" ,AuthCheck, transitionController.getAllExecutors)
router.get("/executor/:id" ,AuthCheck, transitionController.getExecutorById)
router.put("/update-executor/:id" ,AuthCheck,executorBlock,  transitionController.updateExecutor)
router.delete("/delelte-executors/:id" ,AuthCheck,executorBlock,  transitionController.deleteExecutor)
router.post("/executor/invite" , transitionController.handleInviteAction)


// Subscriptions 

router.post("/create-checkout-session", AuthCheck, userSubscriptionController.createCheckoutSession );
router.get("/verify-payment",AuthCheck , userSubscriptionController.verifyPayment );
router.get("/user/:userId",AuthCheck , userSubscriptionController.getUserSubscription); 
router.get("/subscriptions",AuthCheck , userSubscriptionController.getAllSubscriptions);

// Enquiry Manage Routes
router.post("/create-enquiry" , enquiryController.createEnquiry)
router.get("/enquiries" ,AuthCheck,adminCheck, enquiryController.getAllEnquiries)
router.get("/enquiry/:id" ,AuthCheck,adminCheck, enquiryController.getEnquiryById)
router.delete("/delelte-enquiries/:id" ,AuthCheck,adminCheck, enquiryController.deleteEnquiry)


// Dashboard 
router.get("/dashboard" ,AuthCheck, DashboardController.getDashboard)
router.get("/admin-dashboard" ,AuthCheck,adminCheck, adminDashboard.adminDashboard)



export default router