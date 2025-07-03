import { notifications, users } from "../utils/firebase";
import getTodayDate from "../utils/getTodayDate";

const express = require("express");
const { appointments } = require("../utils/firebase");

export const AppointmentsRouter = express.Router();

AppointmentsRouter.get(
    "/appointments/customers/:id",
    async (req: any, res: any) => {
        const { id } = req.params;

        try {
            const snapshot = await appointments
                .where("customer", "==", id)
                .get();

            const data = await Promise.all(
                snapshot.docs.map(async (doc: any) => {
                    const appt = doc.data();

                    // Get business name
                    const businessDoc = await users.doc(appt.business).get();
                    const businessData = businessDoc.exists
                        ? businessDoc.data()
                        : null;

                    return {
                        ...appt,
                        business: businessData
                            ? businessData.name
                            : "Bilinmeyen İşletme",
                    };
                })
            );

            return res.json(data);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Sunucu hatası." });
        }
    }
);

AppointmentsRouter.get(
    "/appointments/businesses/:id",
    async (req: any, res: any) => {
        const { id } = req.params;

        try {
            const snapshot = await appointments
                .where("business", "==", id)
                .get();

            const data = await Promise.all(
                snapshot.docs.map(async (doc: any) => {
                    const appt = doc.data();

                    const customerDoc = await users.doc(appt.customer).get();
                    const customerData = customerDoc.exists
                        ? customerDoc.data()
                        : null;

                    return {
                        ...appt,
                        customer: customerData
                            ? `${customerData.name} ${customerData.surname}`
                            : "Bilinmeyen Müşteri",
                    };
                })
            );

            return res.json(data);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Sunucu hatası." });
        }
    }
);
AppointmentsRouter.post("/appointments", async (req: any, res: any) => {
    const data = req.body;

    try {
        const newRef = appointments.doc();
        const newAppointment = { ...data, id: newRef.id };
        await newRef.set(newAppointment);

        const businessDoc = await users.doc(data.business).get();
        const businessData = businessDoc.data();
        const businessName = businessData?.name || "İşletme";

        const notificationRef = notifications.doc();
        const notification = {
            id: notificationRef.id,
            title: `${businessName} randevunuz onaylanmıştır.`,
            description: `${businessName} için oluşturulan randevunuz sistem tarafından onaylanmıştır`,
            date: getTodayDate(),
            customer: data.customer,
            business: data.business,
        };
        await notificationRef.set(notification);

        return res.json({ message: "Başarıyla randevu oluşturuldu" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Sunucu hatası." });
    }
});
