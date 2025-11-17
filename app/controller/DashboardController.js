import { AssetsModel } from "../models/assetsModel.js";
import { DebtModel } from "../models/debtsModel.js";
import { InsuranceModel } from "../models/insuranceModel.js";
import { UtilsModel } from "../models/utilsModel.js";
import { BankingModel } from "../models/bankingModel.js";
import { InvestmentModel } from "../models/inventmentsModel.js";
import mongoose from "mongoose";

class DashboardController{
async getDashboard(req, res) {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user"
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const totalAssetValue = await AssetsModel.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$balance" } } },
    ]);

    const totalDebtValue = await DebtModel.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalInsuranceValue = await InsuranceModel.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$coverageAmount" } } },
    ]);

    const totalUtilityValue = await UtilsModel.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$outstandingBill" } } },
    ]);

    const totalBankingValue = await BankingModel.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$balance" } } },
    ]);

    const totalInvestmentValue = await InvestmentModel.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const netWorth =
      (totalAssetValue[0]?.total || 0) -
      (totalDebtValue[0]?.total || 0);

    res.status(200).json({
      success: true,
      data: {
        totalAssetValue: totalAssetValue[0]?.total || 0,
        totalDebtValue: totalDebtValue[0]?.total || 0,
        totalInsuranceValue: totalInsuranceValue[0]?.total || 0,
        totalUtilityValue: totalUtilityValue[0]?.total || 0,
        totalBankingValue: totalBankingValue[0]?.total || 0,
        totalInvestmentValue: totalInvestmentValue[0]?.total || 0,
        netWorth,
      },
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

}

export default new DashboardController();