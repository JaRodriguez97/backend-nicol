import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
  let retries = 5;
  while (retries) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("🔥 Conectado a MongoDB");
      break;
    } catch (error) {
      console.error(
        `❌ Error conectando a MongoDB (reintentos restantes: ${retries - 1}):`,
        error,
        process.env.MONGO_URI
      );
      retries -= 1;
      if (!retries) process.exit(1);
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
};

export default connectDB;
