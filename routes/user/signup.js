import express from "express";
import { dbService } from "../../repositories/dbservice.js";
import { body, validationResult } from "express-validator";
import { guideValidation } from "../../tools/validators.js";
import { handleErrors } from "../../tools/middlewares.js";

const router = express.Router();

router.get("/signup", async (req, res) => {
  res.render("user/signupTemplate.ejs");
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

router.post("/signup", guideValidation, handleErrors, async (req, res) => {
  const db = dbService.getDbServiceInstance();
  const rbody = req.body;
  await db.createGuide(rbody.email, rbody.password, rbody.nickname, rbody.county, rbody.city);

  res.sendStatus(200);
});

router.get("/testdelete", async (req, res) => {
  const db = dbService.getDbServiceInstance();
  await db.deleteGuide("bryja12345@test.com");
  res.sendStatus(200);
});

export const userRouter = router;
