import { AssetsModel } from "../models/assetsModel.js";
import { DebtModel } from "../models/debtsModel.js";
import { InsuranceModel } from "../models/insuranceModel.js";
import { UtilsModel } from "../models/utilsModel.js";
import { BankingModel } from "../models/bankingModel.js";
import { InvestmentModel } from "../models/inventmentsModel.js";

class DashboardController{
   async getDashboard(req, res) {
        try {
         const totalAssetValue = await AssetsModel.aggregate([
            { $group: { _id: null, total: { $sum: "$balance" } } },
          ]);
          const totalDebtValue = await DebtModel.aggregate([
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]);
          const totalInsuranceValue = await InsuranceModel.aggregate([
            { $group: { _id: null, total: { $sum: "$coverageAmount" } } },
          ]);
          const totalUtilityValue = await UtilsModel.aggregate([
            { $group: { _id: null, total: { $sum: "$outstandingBill" } } },
          ]);
          const totalBankingValue = await BankingModel.aggregate([
            { $group: { _id: null, total: { $sum: "$balance" } } },
          ]);
          const totalInvestmentValue = await InvestmentModel.aggregate([
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]);

          const netWorth = totalAssetValue[0]?.total - totalDebtValue[0]?.total;

          res.status(200).json({
            success: true,
            data: {
              totalAssetValue: totalAssetValue[0]?.total || 0,
              totalDebtValue: totalDebtValue[0]?.total || 0,
              totalInsuranceValue: totalInsuranceValue[0]?.total || 0,
              totalUtilityValue: totalUtilityValue[0]?.total || 0,
              totalBankingValue: totalBankingValue[0]?.total || 0,
              totalInvestmentValue: totalInvestmentValue[0]?.total || 0,
              netWorth: netWorth,
            },
          });
            
        
       } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
        
       }
   }

}

export default new DashboardController();