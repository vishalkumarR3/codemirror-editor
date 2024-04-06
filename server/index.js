const express = require("express");

const app = express();
const router = require("./routes/auth-router");
const roomRouter = require("./routes/room-routes")

app.use(express.json());

//middleware for the routes -- all routes present in routes folder
app.use("/api/auth", router);
app.use("/api/room", roomRouter)

const connectDB = require("./utils/db");

const PORT = 5000;

// if DB connected then only start the server

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
});