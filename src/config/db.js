
import mongoose from "mongoose";

// Cache MongoDB connection across serverless invocations
let cached = globalThis.mongoose;

if (!cached) {
    cached = globalThis.mongoose = {
        conn: null,
        promise: null,
    };
}

const connectDb = async () => {
    // Return existing connection
    if (cached.conn) {
        return cached.conn;
    }

    // Validate MongoDB URI
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is missing from environment variables.");
    }

    // Create connection only once
    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGODB_URI)
            .then((mongooseInstance) => {
                console.log("MongoDB Connected Successfully");
                return mongooseInstance;
            })
            .catch((error) => {
                cached.promise = null;
                throw error;
            });
    }

    cached.conn = await cached.promise;

    return cached.conn;
};

export default connectDb;
