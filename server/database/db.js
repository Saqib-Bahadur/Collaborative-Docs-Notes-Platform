import mongoose from "mongoose";

const Connection = async () => {

    const URL = "mongodb://localhost:27017/CollaborativeDB";

    try {

        await mongoose.connect(URL);

        console.log("Database Connected..");

    } catch (error) {

        console.log("Error while connecting", error);

    }
}

export default Connection;