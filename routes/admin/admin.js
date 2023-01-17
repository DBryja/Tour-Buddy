import express from "express";
import { makeDb } from "../../repositories/db.js";

const router = express.Router();

const db = makeDb({
  host: "localhost",
  user: "root",
  database: "buddyexplorer",
});

// login as an administrator
router.get("/admin", (req, res) => {
  res.render("admin/signInTemplate", { data: { error: false } });
});

router.post("/admin", async (req, res) => {
  const { login, password } = req.body;

  let sql = `SELECT 'adminID' FROM admins WHERE login='${login}' AND password=MD5('${password}') `;
  try {
    const result = await db.query(sql);
    const data = JSON.parse(JSON.stringify(result));
    req.session.adminID = data[0].adminID;
    res.redirect("/admin/panel");
  } catch (err) {
    res.render("admin/signInTemplate", { data: { error: "Zły login bądź hasło" } });
    return;
  }
});

// admin panel
router.get("/admin/panel", (req, res) => {
  if (!req.session.adminID) {
    res.redirect("/admin");
  } else {
    res.render("admin/panelTemplate");
  }
});

export const adminRouter = router;
