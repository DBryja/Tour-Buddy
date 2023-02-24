import express from "express";
import bodyParser from "body-parser";
import cookieSession from "cookie-session";

import { dbService } from "./repositories/dbservice.js";
import { adminRouter } from "./routes/admin/admin.js";
import { userRouter } from "./routes/user/signup.js";
import { mainRouter } from "./routes/user/main.js";

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
app.use(userRouter);
app.use(mainRouter);

app.set("view engine", "ejs");

app.listen(3000, () => {
  console.log("listening");
});
