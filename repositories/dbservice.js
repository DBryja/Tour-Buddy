import mysql from "mysql";
import dotenv from "dotenv";
import { response } from "express";
import bcrypt from "bcryptjs";
import { intoArray } from "../tools/helpers.js";

dotenv.config();
let instance = null;

const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: process.env.DB_PORT,
});

connection.connect((err) => {
  if (err) console.log(err.message);
  console.log("db " + connection.state);
});

export class dbService {
  static getDbServiceInstance() {
    return instance ? instance : new dbService();
  }

  async queryHandling(sql) {
    try {
      const response = await new Promise((resolve, reject) => {
        connection.query(sql, (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  //insert multi "row data" results into an array inside an object - >object{array:[result]}
  async multiResultObject(sql, object, variable) {
    const obj = await this.queryHandling(sql);
    for (const row in obj) {
      for (const key in obj[row]) {
        object[variable].push(obj[row][key]);
      }
    }
  }

  // insert into an array([arr]) all results from the query wtih the key([variable])
  async multiResultArray(sql, variable) {
    const arr = [];
    const obj = await this.queryHandling(sql);
    for (const key in obj) {
      arr.push(obj[key][variable]);
    }
    return arr;
  }

  // compare passwords from input and db
  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  hashPassword = (pswd) => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(pswd, salt);
    return hash;
  };

  // QUERIES

  // returns admin_id by provided email
  async getAdminByEmail(email) {
    let sql = `SELECT admin_id FROM admins WHERE email = '${email}'`;
    return await this.queryHandling(sql);
  }

  // get guide by email
  async getGuideByEmail(email) {
    let sql = `SELECT guide_id FROM guides WHERE email = '${email}'`;
    return (await this.queryHandling(sql))[0];
  }
  async getGuideLoginData(email) {
    let sql = `SELECT * FROM guides WHERE email = '${email}'`;
    return (await this.queryHandling(sql))[0];
  }

  // GUIDE CREATION
  async createGuide(email, password, nickname, regions, cities, profile_pic, fullname = "") {
    // create user inside guides table
    const hashedPswd = this.hashPassword(password);
    let sql = `INSERT INTO guides(email, password) VALUES ("${email}","${hashedPswd}")`;
    this.queryHandling(sql);
    // get an id of the new created guide
    const id = (await this.getGuideByEmail(email)).guide_id;
    let sql2 = `INSERT INTO guides_data(guide_id, nickname, fullname) VALUES ("${id}","${nickname}", "${fullname}" )`;
    this.queryHandling(sql2);
    // insert into regions
    regions = intoArray(regions);
    regions.forEach((region) => {
      let sql3 = `INSERT INTO guides_regions (guide_id, region) VALUES ("${id}", "${region}")`;
      this.queryHandling(sql3);
    });
    // insert into cities
    cities = intoArray(cities);
    cities.forEach((city) => {
      let sql4 = `INSERT INTO guides_cities (guide_id, city) VALUES ("${id}", "${city}")`;
      this.queryHandling(sql4);
    });
    // insert into profile_pic
    let sql6 = `INSERT INTO guides_ppic (guide_id) VALUES ("${id}")`;
    console.log(profile_pic);
    if (profile_pic) sql6 = `INSERT INTO guides_ppic (guide_id, profile_pic) VALUES ("${id}", "${profile_pic}")`;
    this.queryHandling(sql6);
  }
  // DELETE GUIDE
  async deleteGuide(email) {
    const id = (await this.getGuideByEmail(email)).guide_id;
    let sql = `
    DELETE guides_cities, guides_regions, guides_data, guides_ppic, guides_languages FROM guides 
    LEFT JOIN guides_cities ON (guides_cities.guide_id = guides.guide_id) AND guides_cities.guide_id = "${id}"
    LEFT JOIN guides_data ON (guides_data.guide_id = guides.guide_id) AND guides_data.guide_id = "${id}"
    LEFT JOIN guides_regions ON (guides_regions.guide_id = guides.guide_id) AND guides_regions.guide_id = "${id}"
    LEFT JOIN guides_ppic ON (guides_ppic.guide_id = guides.guide_id) AND guides_ppic.guide_id = "${id}"
    LEFT JOIN guides_languages ON (guides_languages.guide_id = guides.guide_id) AND guides_languages.guide_id = "${id}";
    `;
    this.queryHandling(sql);
    let sql2 = `DELETE FROM guides WHERE guide_id = "${id}"`;
    this.queryHandling(sql2);
  }
  async validateLogin(table, email, pswd) {
    let sql = `Select password FROM ${table} WHERE email = "${email}"`;
    const hashedPassword = (await this.queryHandling(sql))[0].password;
    const isMatch = bcrypt.compareSync(pswd, hashedPassword);
  }

  // returns guide_id by provided filters
  async getGuideBy(filters) {
    let joins = ``;
    let conditions = `WHERE 1=1 `;
    // building sql query
    if (filters.fullname) {
      joins += `
      LEFT JOIN guides_data  AS gd
      ON (g.guide_id = gd.guide_id)`;
      conditions += `AND gd.fullname= "${filters.fullname}"`;
    }
    // if (lang) {
    //   joins += `
    //   LEFT JOIN guides_languages AS gl
    //   ON (g.guide_id = gl.guide_id)`;
    //   conditions += `AND gl.language = "${lang}"`;
    // }
    if (filters.city) {
      joins += `
      LEFT JOIN guides_cities AS gc
      ON (g.guide_id = gc.guide_id)`;
      conditions += `AND gc.city = "${filters.city}"`;
    }
    if (filters.county) {
      joins += `
      LEFT JOIN guides_regions AS gr
      ON (g.guide_id = gr.guide_id)`;
      conditions += `AND gr.region = "${filters.county}"`;
    }

    let query = `
    SELECT g.guide_id FROM guides AS g ${joins}
      ${conditions}
      ;`;

    const result = await this.queryHandling(query);
    return result;
  }
  async getAllGuides() {
    let sql = `SELECT guide_id FROM guides`;
    const result = await this.queryHandling(sql);
    return result;
  }

  // returns all information about a guide with provided id
  async showGuide(id) {
    // queries for all guide information
    const queries = {
      gdata: `SELECT gd.nickname, gd.fullname, gd.desc FROM guides AS g 
      LEFT JOIN guides_data AS gd
      ON (g.guide_id = gd.guide_id)
      WHERE g.guide_id = ${id};`,
      // guide languages list
      // glang: `
      // SELECT gl.language FROM guides AS g
      // LEFT JOIN guides_languages AS gl
      // ON (g.guide_id = gl.guide_id)
      // WHERE g.guide_id = ${id};`,
      // guide regions list
      greg: `
      SELECT gr.region FROM guides AS g 
      LEFT JOIN guides_regions AS gr
      ON (g.guide_id = gr.guide_id)
      WHERE g.guide_id = ${id};`,
      // guide cities list
      gcities: `
      SELECT gc.city FROM guides AS g 
      LEFT JOIN guides_cities AS gc
      ON (g.guide_id = gc.guide_id)
      WHERE g.guide_id = ${id};`,
      // guide ppic
      gppic: `
      SELECT gp.profile_pic FROM guides AS g 
      LEFT JOIN guides_ppic AS gp
      ON (g.guide_id = gp.guide_id)
      WHERE g.guide_id = ${id};
      `,
    };

    const guide = {
      // langs: [],
      regs: [],
      cities: [],
    };

    // data (single object)
    let data = await this.queryHandling(queries["gdata"]);
    data = data[0];
    for (const key in data) {
      guide[key] = data[key];
    }

    // image
    guide.profile_pic = (await this.queryHandling(queries["gppic"]))[0].profile_pic;

    // languages, regions, cities
    // await this.multiResultObject(queries["glang"], guide, "langs");
    await this.multiResultObject(queries["greg"], guide, "regs");
    await this.multiResultObject(queries["gcities"], guide, "cities");

    return guide;
  }

  // GUIDE INTERFACE
  // change name
  // change email
  // change password
  // change desc
  // change regions
  // change cities

  // OTHERS
  async getCounties(text) {
    let sql = `SELECT nazwa FROM powiaty WHERE nazwa LIKE '%${text}%' LIMIT 5`;
    const counties = await this.multiResultArray(sql, "nazwa");
    return counties;
  }
  async getCities(text) {
    let sql = `SELECT nazwa FROM miasta WHERE nazwa LIKE '%${text}%' LIMIT 50`;
    const cities = await this.multiResultArray(sql, "nazwa");
    return cities;
  }
  async getCounty(name) {
    let sql = `SELECT ID FROM powiaty WHERE nazwa = "${name}"`;
    const id = await this.queryHandling(sql);
    return id[0] ? true : false;
  }
  async getCity(name) {
    let sql = `SELECT ID FROM miasta WHERE nazwa = "${name}"`;
    const id = await this.queryHandling(sql);
    return id[0] ? true : false;
  }
}
