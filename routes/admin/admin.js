import express from "express";
import { db } from "../../repositories/db.js";

const router = express.Router();

// login as an administrator
router.get("/admin", (req, res) => {
  res.render("admin/signInTemplate");
});

router.post("/admin", (req, res) => {
  const { login, password } = req.body;

  let sql = `SELECT 'adminID' FROM admins WHERE login='${login}' AND password=MD5('${password}') `;
  db.query(sql, (err, result) => {
    if (err) {
      res.redirect("/admin");
      throw err;
    }
    console.log(req.body);
    const data = JSON.parse(JSON.stringify(result));
    req.session.adminID = data[0].adminID;
    res.send(req.session.adminID);
  });
});

// admin panel
router.get("/admin/panel", (req, res) => {
  res.render("admin/panelTemplate");
});

router.post("/admin/panel", (req, res) => {
  res.send(req.body);
});

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

export const adminRouter = router;
