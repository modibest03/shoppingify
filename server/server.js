import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({path: "./config.env"})
import app from "./app.js";

const PORT = process.env.PORT || 5000

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
}).then(() =>
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))
)
.catch((err) => console.log(err.message));