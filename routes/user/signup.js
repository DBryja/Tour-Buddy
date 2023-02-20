import express from "express";
import { dbService } from "../../repositories/dbservice.js";
import { body, validationResult } from "express-validator";
import { guideValidation } from "../../middleware/validators.js";
import { handleErrors } from "../../middleware/middlewares.js";

const router = express.Router();
// login as a guide
// router.get("/signin", async (req, res) => {
//   let sql = `SELECT region FROM regions ORDER BY regions.region ASC `;
//   try {
//     const result = await db.query(sql);
//     const regions = JSON.parse(JSON.stringify(result));
//     res.render("user/signupTemplate", { data: { regions: regions } });
//   } catch (err) {
//     res.render("user/errorTemplate", { data: { error: err } });
//     return;
//   }
// });

router.get("/signup", async (req, res) => {
  const db = dbService.getDbServiceInstance();
  // db.createGuide("test@test.com", "test");
  // db.validateLogin("guides", "test@test.com", "test");

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

router.post("/signup", guideValidation, handleErrors, (req, res) => {
  res.sendStatus(200);
});

// const { email, name, price, password, region } = req.body;
// let sqlGuides = `INSERT INTO guides(email, password) VALUES ('${email}',MD5('${password}'))`;
// await db.query(sqlGuides);

// let sqlGuideID = `SELECT guide_id FROM guides WHERE email = '${email}'`;
// const guide_id = (await db.query(sqlGuideID))[0].guide_id;
// console.log("guide id: " + guide_id);

// req.body.region.forEach(async (region) => {
//   await db.query(`INSERT INTO guides_regions(guide_id, region) VALUES ('${guide_id}','${region}') `);
// });

// await db.query(`INSERT INTO guides_data(guide_id, name, price) VALUES ('${guide_id}', '${name}', '${price}')`);

// email, MD5 password => guides
// area, guide_id => guides_areas
// guide_id, name, price => guides_data
//

export const userRouter = router;
