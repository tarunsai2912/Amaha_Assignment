const express = require("express");
const app = express();
const db = require("./Config/db");
const dotenv = require("dotenv");
const cors = require("cors");

const PORT = process.env.PORT || 5000;

app.use(express.json());
dotenv.config();
db();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS,PATCH"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get('/', (req, res) => {
  res.send('Hello User Welcome to Kanban Board')
})

app.use("/api", require("./Router/Routes"));

app.listen(PORT, () => {
  console.log(`Server is running on port no ${PORT}`);
});