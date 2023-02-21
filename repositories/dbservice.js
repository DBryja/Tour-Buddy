import mysql from "mysql";
import dotenv from "dotenv";
import { response } from "express";
import bcrypt from "bcryptjs";

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

  async decryptPassword(password, hashedPassword) {
    bcrypt.compare(password, hashedPassword, function (err, isMatch) {
      return isMatch;
    });
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

  // delete all guide details by his id
  // async deleteGuide(id){

  // }

  // GUIDE CREATION
  async createGuide(email, password, price, [regions], [cities]) {
    // create user inside guides table
    const hashedPswd = this.hashPassword(password);
    let sql = `INSERT INTO guides(email, password) VALUES ("${email}","${hashedPswd}")`;
    this.queryHandling(sql);
    // get an id of the new created guide
    // const id = await this.getGuideByEmail(email);
    // insert
  }
  async validateLogin(table, email, pswd) {
    let sql = `Select password FROM ${table} WHERE email = "${email}"`;
    const hashedPassword = (await this.queryHandling(sql))[0].password;
    const isMatch = bcrypt.compareSync(pswd, hashedPassword);
    console.log(isMatch);
  }

  // returns guide_id by provided filters
  async getGuideBy(name = "", lang = "", city = "", region = "") {
    let joins = ``;
    let conditions = `WHERE 1=1 `;
    // building sql query
    if (name) {
      joins += `
      LEFT JOIN guides_data  AS gd
      ON (g.guide_id = gd.guide_id)`;
      conditions += `AND gd.first_name = "${name}"`;
    }
    if (lang) {
      joins += `
      LEFT JOIN guides_languages AS gl
      ON (g.guide_id = gl.guide_id)`;
      conditions += `AND gl.language = "${lang}"`;
    }
    if (city) {
      joins += `
      LEFT JOIN guides_cities AS gc
      ON (g.guide_id = gc.guide_id)`;
      conditions += `AND gc.city = "${city}"`;
    }
    if (region) {
      joins += `
      LEFT JOIN guides_regions AS gr
      ON (g.guide_id = gr.guide_id)`;
      conditions += `AND gr.region = "${region}"`;
    }

    let query = `
    SELECT g.guide_id FROM guides AS g ${joins}
      ${conditions}
      ;`;
    // console.log(sql);
    this.queryHandling(query);
  }

  // returns all information about a guide with provided id
  async showGuide(id) {
    // queries for all guide information
    const queries = {
      gdata: `SELECT gd.first_name, gd.second_name, gd.desc, gd.p_img FROM guides AS g 
      LEFT JOIN guides_data AS gd
      ON (g.guide_id = gd.guide_id)
      WHERE g.guide_id = ${id};`,
      // guide languages list
      glang: `
      SELECT gl.language FROM guides AS g 
      LEFT JOIN guides_languages AS gl
      ON (g.guide_id = gl.guide_id)
      WHERE g.guide_id = ${id};`,
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
    };

    const guide = {
      langs: [],
      regs: [],
      cities: [],
    };

    // data (single object)
    let data = await this.queryHandling(queries["gdata"]);
    data = data[0];
    for (const key in data) {
      guide[key] = data[key];
    }

    // languages, regions, cities
    await this.multiResult(queries["glang"], guide, "langs");
    await this.multiResult(queries["greg"], guide, "regs");
    await this.multiResult(queries["gcities"], guide, "cities");

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
    let sql = `SELECT nazwa FROM miasta WHERE nazwa LIKE '%${text}%' LIMIT 10`;
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
