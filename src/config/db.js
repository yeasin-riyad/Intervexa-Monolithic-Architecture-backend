import mongoose from 'mongoose'

const connectDb=async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Db connected Successfully");
    } catch (error) {
        console.log(`db error ${error}`);
    }
}

export default connectDb;