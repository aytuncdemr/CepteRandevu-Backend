const nodemailer = require("nodemailer");
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD,
    },
});

export async function sendResetPasswordEmail(to: string, newPassword: string) {
    const mailOptions = {
        from: "CepteRandevu",
        to,
        subject: "Şifre Sıfırlama",
        text: `Yeni şifreniz: ${newPassword}`,
        html: `<p>Yeni şifreniz: <b>${newPassword}</b></p>`,
    };

    await transporter.sendMail(mailOptions);
}
