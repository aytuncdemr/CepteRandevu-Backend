import { Router } from "express";

const { notifications } = require("../utils/firebase");

export const NotificationsRouter = Router();

NotificationsRouter.get(
    "/notifications/customers/:id",
    async (req: any, res: any) => {
        const { id } = req.params;
        try {
            const snapshot = await notifications
                .where("customer", "==", id)
                .get();

            const data = snapshot.docs.map((doc: any) => doc.data());

            return res.json(data);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Sunucu hatası." });
        }
    }
);

