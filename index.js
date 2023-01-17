import express from "express";
import bodyParser from "body-parser";
import cookieSession from "cookie-session";
import { db } from "./repositories/db.js";
import mysql from "mysql";

import { adminRouter } from "./routes/admin/admin.js";

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  cookieSession({
    keys: ["oufhv8742hn"],
  })
);
app.use(adminRouter);

app.set("view engine", "ejs");

app.listen(3000, () => {
  console.log("listening");
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("MySql connected...");
});
