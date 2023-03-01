import express from "express";
import { validationResult } from "express-validator";
import multer from "multer";
import { Blob } from "buffer";

import { dbService } from "../../repositories/dbservice.js";
import { guideValidation } from "../../tools/validators.js";
import { handleErrors } from "../../tools/middlewares.js";
import { profile } from "console";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/signup", async (req, res) => {
  res.render("user/signupTemplate.ejs", { libs: ["tools"] });
});

router.get("/get_counties", async function (req, res) {
  const db = dbService.getDbServiceInstance();
  const string = req.query.counties;
  if (string.length > 1) {
    const result = await db.getCounties(string);
    res.send(result);
  }
});
router.get("/get_cities", async function (req, res) {
  const db = dbService.getDbServiceInstance();
  const string = req.query.cities;
  if (string.length > 1) {
    const result = await db.getCities(string);
    res.send(result);
  }
});

router.post("/signup", upload.single("profile_pic"), guideValidation, handleErrors, async (req, res) => {
  if (validationResult(req).isEmpty()) {
    const db = dbService.getDbServiceInstance();
    const { email, password, nickname, county, city, fullname } = req.body;
    let profile_pic;
    if (req.file.fieldname) {
      profile_pic = req.file.buffer.toString("base64");
    } else {
      profile_pic = false;
    }
    await db.createGuide(email, password, nickname, county, city, profile_pic, fullname);
    // res.render("user/searchTemplate.ejs", { guides: [], error: false, libs: ["tools"] });
    res.redirect("/search");
  }
});

router.get("/testdelete", async (req, res) => {
  const db = dbService.getDbServiceInstance();
  await db.deleteGuide("test123321@test.com");
  res.sendStatus(200);
});

export const userRouter = router;
