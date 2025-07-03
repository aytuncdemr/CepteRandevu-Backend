import { Router } from "express";
import { notifications, users } from "../utils/firebase";
import crypto from "crypto";
import { sendResetPasswordEmail } from "../utils/smtp";
import getTodayDate from "../utils/getTodayDate";

export const AuthRouter = Router();

AuthRouter.post("/login", async (req, res: any) => {
    const { email, password } = req.body;
    try {
        let snapshot = await users
            .where("email", "==", email)
            .where("password", "==", password)
            .limit(1)
            .get();

        if (!snapshot.empty) {
            const user = snapshot.docs[0].data();

            return res.json({ id: user.id, accountType: user.accountType });
        }

        return res.status(401).json({ message: "Email veya şifre yanlış." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Sunucu hatası." });
    }
});

AuthRouter.post("/register", async (req, res: any) => {
    try {
        const userData = req.body;

        const docRef = users.doc();
        userData.id = docRef.id;
        await docRef.set(userData);

        return res.json({ message: "Başarıyla kayıt olundu" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Kayıt sırasında hata oluştu" });
    }
});

AuthRouter.post("/reset-password", async (req: any, res: any) => {
    const { email } = req.body;

    try {
        const snapshot = await users.where("email", "==", email).limit(1).get();

        if (snapshot.empty) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı." });
        }

        const userDoc = snapshot.docs[0];

        const newPassword = crypto.randomBytes(4).toString("hex");

        await users.doc(userDoc.id).update({ password: newPassword });

        await sendResetPasswordEmail(email, newPassword);

        const notificationRef = notifications.doc();
        const notification = {
            id: notificationRef.id,
            title: `Şifre değişikliği işlemi.`,
            description: `Sistem tarafından oluşturulan yeni şifreniz e-posta hesabınıza iletilmiştir.`,
            date: getTodayDate(),
            customer: userDoc.id,
            business: "",
        };
        await notificationRef.set(notification);

        return res.json({ message: "Yeni şifre email adresinize gönderildi." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Sunucu hatası." });
    }
});
