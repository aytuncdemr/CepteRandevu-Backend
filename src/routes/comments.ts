import { Router } from "express";
import { users } from "../utils/firebase";

const { comments } = require("../utils/firebase");

export const CommentsRouter = Router();

CommentsRouter.get("/comments/businesses/:id", async (req: any, res: any) => {
    const { id } = req.params;

    try {
        const snapshot = await comments.where("business", "==", id).get();

        const data = await Promise.all(
            snapshot.docs.map(async (doc: any) => {
                const comment = doc.data();

                const customerDoc = await users.doc(comment.customer).get();
                const customerData = customerDoc.exists
                    ? customerDoc.data()
                    : null;

                return {
                    ...comment,
                    customer: customerData
                        ? `${customerData.name} ${customerData.surname}`
                        : "Bilinmeyen Kullanıcı",
                };
            })
        );

        return res.json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Sunucu hatası." });
    }
});

CommentsRouter.post("/comments/businesses", async (req: any, res: any) => {
    const data = req.body;

    try {
        const newRef = comments.doc();
        const newComment = { ...data, id: newRef.id };

        await newRef.set(newComment);

        const snapshot = await comments
            .where("business", "==", data.business)
            .get();

        const allComments = snapshot.docs.map((doc: any) => doc.data());

        const totalStars = allComments.reduce(
            (sum: string, comment: { star: number }) =>
                sum + (comment.star || 0),
            0
        );
        const averageStar = parseFloat(
            (totalStars / allComments.length).toFixed(2)
        );

        await users.doc(data.business).update({ averageStar });

        return res.json({ message: "Yorum başarıyla eklendi" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Sunucu hatası." });
    }
});
