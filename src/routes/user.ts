const express = require("express");
const { users } = require("../utils/firebase");

export const UserRouter = express.Router();

UserRouter.get("/customers/:id", async (req: any, res: any) => {
    const { id } = req.params;

    try {
        const doc = await users.doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı." });
        }

        return res.json(doc.data());
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Sunucu hatası." });
    }
});

UserRouter.put("/customers/:id", async (req: any, res: any) => {
    const { id } = req.params;
    const updatedData = req.body;

    if (id !== updatedData.id) {
        return res.status(400).json({ message: "ID uyuşmuyor." });
    }

    try {
        const docRef = users.doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı." });
        }

        await docRef.set(updatedData);

        return res.json({ message: "Başarıyla hesabınız güncellendi" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Sunucu hatası." });
    }
});

UserRouter.get("/customers/:id/favorites", async (req: any, res: any) => {
    const { id } = req.params;

    try {
        const userDoc = await users.doc(id).get();

        if (!userDoc.exists) {
            return res.json([]);
        }

        const userData = userDoc.data();

        if (!userData.favorites || userData.favorites.length === 0) {
            return res.json([]);
        }

        const favoritesIds = userData.favorites;

        const businessDocsPromises = favoritesIds.map((bizId: string) =>
            users.doc(bizId).get()
        );

        const businessDocs = await Promise.all(businessDocsPromises);

        const favoriteBusinesses = businessDocs
            .filter((doc) => doc.exists)
            .map((doc) => doc.data());

        return res.json(favoriteBusinesses);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Sunucu hatası." });
    }
});

UserRouter.post(
    "/customers/:customerId/favorites/:businessId",
    async (req: any, res: any) => {
        const { customerId, businessId } = req.params;

        try {
            const userRef = users.doc(customerId);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                return res
                    .status(404)
                    .json({ message: "Kullanıcı bulunamadı." });
            }

            const userData = userDoc.data();
            const currentFavorites: string[] = userData.favorites || [];

            if (currentFavorites.includes(businessId)) {
                return res
                    .status(400)
                    .json({ message: "Bu işletme zaten favorilerde." });
            }

            currentFavorites.push(businessId);

            await userRef.update({ favorites: currentFavorites });

            return res.json({ message: "Favorilere eklendi." });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Sunucu hatası." });
        }
    }
);

UserRouter.delete(
    "/customers/:customerId/favorites/:businessId",
    async (req: any, res: any) => {
        const { customerId, businessId } = req.params;

        try {
            const userRef = users.doc(customerId);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                return res
                    .status(404)
                    .json({ message: "Kullanıcı bulunamadı." });
            }

            const userData = userDoc.data();
            const currentFavorites: string[] = userData.favorites || [];

            const updatedFavorites = currentFavorites.filter(
                (id) => id !== businessId
            );

            await userRef.update({ favorites: updatedFavorites });

            return res.json({ message: "Favorilerden başarıyla kaldırıldı." });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Sunucu hatası." });
        }
    }
);
