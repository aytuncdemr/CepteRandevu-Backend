import { service } from './service';
import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const app = initializeApp({
    credential: cert(service as ServiceAccount),
    projectId: "cepterandevu-67643",
});

const auth = getAuth();
const db = getFirestore();

const users = db.collection("users");
const comments = db.collection("comments");
const appointments = db.collection("appointments");
const notifications = db.collection("notifications");

export { auth, db, users, comments, appointments, notifications };
