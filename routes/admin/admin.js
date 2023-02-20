import express, { query, response } from "express";
// import { makeDb } from "../../repositories/db.js";
import { dbService } from "../../repositories/dbservice.js";
const router = express.Router();

// login as an administrator
router.get("/admin", (req, res) => {
  res.render("admin/signInTemplate", { data: { error: false } });
});

router.post("/admin", async (req, res) => {
  const db = dbService.getDbServiceInstance();
  const { email, password } = req.body;

  let sql = `SELECT admin_id FROM admins WHERE email='${email}' AND password='${password}'`;
  const result = await db.queryHandling(sql);
  const guide = await db.showGuide(1);
  console.log(guide);

  if (result[0]) {
    req.session.admin_id = result[0].admin_id;
    res.redirect("/admin/panel");
  } else {
    res.render("admin/signInTemplate", { data: { error: "Zły email bądź hasło" } });
    return;
  }

  // try {
  //   const result = await db.query(sql);
  //   const data = JSON.parse(JSON.stringify(result));
  //   console.log(data);
  //   req.session.admin_id = data[0].admin_id;
  //   res.redirect("/admin/panel");
  // } catch (err) {
  //   res.render("admin/signInTemplate", { data: { error: "Zły email bądź hasło" } });
  //   return;
  // }
});

// admin panel
router.get("/admin/panel", (req, res) => {
  if (!req.session.admin_id) {
    res.redirect("/admin");
  } else {
    res.render("admin/panelTemplate");
  }
});

export const adminRouter = router;
