import express from "express";
import { AuthRouter } from "./routes/auth";
import { UserRouter } from "./routes/user";
import { BusinessRouter } from "./routes/business";
import { AppointmentsRouter } from "./routes/appointments";
import { NotificationsRouter } from "./routes/notifications";
import { CommentsRouter } from "./routes/comments";


const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1", BusinessRouter);
app.use("/api/v1", UserRouter);
app.use("/api/v1", AppointmentsRouter);
app.use("/api/v1", NotificationsRouter);
app.use("/api/v1", CommentsRouter);

app.listen(PORT, () => {
    console.log("Server started listening at:", PORT);
});
