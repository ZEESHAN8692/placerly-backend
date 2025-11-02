import dotenv from "dotenv"
dotenv.config()
import transporter from "../config/email.js"


const sendMailExecutor = (to , subject , html)=>{

    return transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: to,
        subject: subject,
        html: html
    })

}

export default sendMailExecutor