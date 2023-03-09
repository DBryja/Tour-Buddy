import express from "express";

import { dbService } from "../../repositories/dbservice.js";
import { guideValidation } from "../../tools/validators.js";
import { handleErrors } from "../../tools/middlewares.js";

const router = express.Router();

router.get("/guide/signin", async (req, res) => {
  if (req.session.guideId) {
    res.redirect("/guide/profile");
  } else if (req.session.invalid) {
    // sign in went wrong
    res.render("user/signinTemplate.ejs", {
      libs: ["tools"],
      errors: [
        {
          msg: "Niepoprawny email, bądź hasło",
          param: "invalid",
        },
      ],
    });
  } else {
    //  first time signing in (clear session)
    res.render("user/signinTemplate.ejs", { libs: ["tools"], errors: {} });
  }
});

router.post("/guide/signin", handleErrors, async (req, res) => {
  const db = dbService.getDbServiceInstance();
  const { email, password } = req.body;

  const guide = await db.getGuideLoginData(email);
  const loginResult = await db.comparePassword(password, guide.password);
  if (loginResult) {
    req.session.guideId = guide.guide_id;
    req.session.invalid = false;
    res.redirect("/guide/profile");
  } else {
    req.session.guideId = false;
    req.session.invalid = true;
    res.redirect("/guide/signin");
  }
});

router.get("/guide/profile", async (req, res) => {
  if (!req.session.guideId) {
    res.redirect("/guide/signin");
  } else {
    //  console.log(req.session.guideId);
    req.session.guideId = false;
    res.send("abcdef");
  }
});

export const guideSignInRouter = router;
