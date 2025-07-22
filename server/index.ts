import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import sequelize from "./dbConfig";
import userRouter from "./userRouter";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use("/users", userRouter);

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected");
    return sequelize.sync({ alter: false });
  })
  .then(() => {
    console.log("Models synchronized with database");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err: Error) =>
    console.error("Unable to connect to the database:", err)
  );
