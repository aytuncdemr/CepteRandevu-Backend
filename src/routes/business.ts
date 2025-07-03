const express = require("express");
const { users } = require("../utils/firebase");

export const BusinessRouter = express.Router();

BusinessRouter.get("/businesses", async (req: any, res: any) => {
    try {
        const snapshot = await users
            .where("accountType", "==", "business")
            .get();

        const businesses = snapshot.docs.map((doc: any) => doc.data());

        return res.json(businesses);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Sunucu hatası." });
    }
});

BusinessRouter.get("/businesses/:id", async (req: any, res: any) => {
    const { id } = req.params;

    try {
        const doc = await users.doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ message: "İşletme bulunamadı." });
        }

        const userData = doc.data();

        return res.json(userData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Sunucu hatası." });
    }
});

BusinessRouter.put("/businesses/:id", async (req: any, res: any) => {
    const { id } = req.params;
    const updatedData = req.body;

    if (id !== updatedData.id) {
        return res.status(400).json({ message: "ID uyuşmuyor." });
    }

    try {
        const userRef = users.doc(id);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: "İşletme bulunamadı." });
        }

        await userRef.set(updatedData);

        return res.json({ message: "Başarıyla güncellendi" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Sunucu hatası." });
    }
});
