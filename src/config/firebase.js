import {
    cert,
    initializeApp,
    getApps,
} from "firebase-admin/app";

const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

// Validate Firebase credentials
if (
    !firebaseConfig.projectId ||
    !firebaseConfig.clientEmail ||
    !firebaseConfig.privateKey
) {
    throw new Error(
        "Firebase Admin credentials are missing. Check your environment variables."
    );
}

// Prevent multiple Firebase initializations
export const app = getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert(firebaseConfig),
    });

export default app;
