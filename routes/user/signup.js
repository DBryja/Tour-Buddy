import express from "express";
import { makeDb } from "../../repositories/db.js";

const router = express.Router();

const db = makeDb({
  host: "localhost",
  user: "root",
  database: "buddyexplorer",
});

// login as an administrator
// router.get("/signin", (req, res) => {
//   let sql = `SELECT regions`;
//   let regions;
//   db.query(sql, (err, result) => {
//     if (err) {
//       res.redirect("/admin");
//       throw err;
//     }
//     regions = JSON.parse(JSON.stringify(result));
//   });
//   res.render("admin/signInTemplate", { data: { regions } });
// });

router.get("/signin", async (req, res) => {
  let sql = `SELECT region FROM regions ORDER BY regions.region ASC `;
  try {
    const result = await db.query(sql);
    const regions = JSON.parse(JSON.stringify(result));
    res.render("user/signupTemplate", { data: { regions: regions } });
  } catch (err) {
    res.render("user/errorTemplate", { data: { error: err } });
    return;
  }
});

router.post("/signup", async (req, res) => {
  const { email, name, price, password, region } = req.body;
  let sqlGuides = `INSERT INTO guides(email, password) VALUES ('${email}',MD5('${password}'))`;
  await db.query(sqlGuides);

  let sqlGuideID = `SELECT guide_id FROM guides WHERE email = '${email}'`;
  const guide_id = (await db.query(sqlGuideID))[0].guide_id;
  console.log("guide id: " + guide_id);
  // console.log(req.body);

  req.body.region.forEach(async (region) => {
    await db.query(`INSERT INTO guides_regions(guide_id, region) VALUES ('${guide_id}','${region}') `);
  });

  await db.query(`INSERT INTO guides_data(guide_id, name, price) VALUES ('${guide_id}', '${name}', '${price}')`);

  res.redirect("/signup");
});

// email, MD5 password => guides
// area, guide_id => guides_areas
// guide_id, name, price => guides_data
//

// router.post("/admin", (req, res) => {
//   const { login, password } = req.body;

//   let sql = `SELECT 'adminID' FROM admins WHERE login='${login}' AND password=MD5('${password}') `;
//   db.query(sql, (err, result) => {
//     if (err) {
//       res.redirect("/admin");
//       throw err;
//     }
//     const data = JSON.parse(JSON.stringify(result));
//     req.session.adminID = data[0].adminID;
//     //  res.send(req.session.adminID);
//     res.redirect("/admin/panel");
//   });
// });

// admin panel
// router.get("/admin/panel", (req, res) => {
//   res.render("admin/panelTemplate");
// });

// router.post("/admin/panel", (req, res) => {
//   const { filter } = req.body;
//   let sql = `SELECT 'guides.guide_id' 'guides_data.name'  FROM (guides INNER JOIN guides.guide_id = guides_data.guide_id) WHERE guides.guide_id='${filter}'`;
//   db.query(sql, (err, result) => {
//     if (err) {
//       res.redirect("/admin/panel");
//       throw err;
//     }
//     const data = JSON.parse(JSON.stringify(result));
//     //  res.send(req.session.adminID);
// //     data.forEach((element) => {
// //       console.log(element);
// //     });
// //   });

//   res.send(data[0]);
// });

// if (!req.session.adminID) {
//    return res.redirect("/admin");
//  } else {
//    next();
//  }

// router.post(
//    "/signup",
//    [requireEmail, requirePassword, requireConfirm],
//    handleErrors(signupTemplate),
//    async (req, res) => {
//      const { email, password } = req.body;
//      const user = await usersRepo.create({ email, password });
//      req.session.userId = user.id;
//      res.redirect("/admin/products");
//    }
//  );

export const userRouter = router;
