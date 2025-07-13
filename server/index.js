const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./dbConfig");
const User = require("./userModel");
const userRouter = require("./userRouter");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/users", userRouter);
db.authenticate()
  .then(() => {
    console.log("Database connected");
    return db.sync({ alter: false });
  })
  .then(() => {
    console.log("Models synchronized with database");

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("Unable to connect to the database:", err));
