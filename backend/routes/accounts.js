const express = require("express");

// accountRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const accountRoutes = express.Router();

// This will help us connect to the database
const dbo = require("../db/conn");

// This helps convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;

// used for hashing
const crypto = require("crypto");

// This section will help you get a single user by id
accountRoutes.route("/accounts/:id").get(async (req, res) => {
    try {
        let db_connect = dbo.getDb();
        let myquery = { _id: new ObjectId(req.params.id) };
        const result = await db_connect.collection("users").findOne(myquery);
        res.json(result);
    } catch (err) {
        throw err;
    }
});

// This section checks to see if the user provided the correct username and password for a user in the system.
accountRoutes.route("/accounts/login").post(async (req, res) => {
  try {
    let db_connect = dbo.getDb();
    const result = await db_connect
      .collection("users")
      .findOne({ username: req.body.username });
    if (result) {
      const saltPassword = result.salt + req.body.password;
      const hashPassword = hashingPassword(saltPassword);
      if (hashPassword === result.password) {
        res.json(result);
      } else {
        res.status(400).json({ message: "Incorrect password" }); // Looked up these error mesages to help with my debugging
      }
    } else {
      res.json(result);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" }); // Looked up these error mesages to help with my debugging
  }
});

// This section will help you create a new Account.
accountRoutes.route("/accounts/add").post(async (req, res) => {
  try {
    let db_connect = dbo.getDb();
    const salt = generateSalt();
    const saltPassword = salt + req.body.password;
    const hashPassword = hashingPassword(saltPassword);
    let myobj = {
      username: req.body.username,
      password: hashPassword,
      salt: salt,
      savings: 0,
      checking: 0,
      other: 0,
      otherName: req.body.otherName,
    };
    const result = await db_connect.collection("users").insertOne(myobj);

    const newAccount = {
      _id: result.insertedId,
      username: myobj.username,
      password: myobj.password,
      savings: myobj.savings,
      checking: myobj.checking,
      other: myobj.other,
      otherName: myobj.otherName,
    };
    res.json(newAccount);
  } catch (err) {
    throw err;
  }
});

// This section checks to see if the user provided a username already in use.
accountRoutes.route("/accounts/exists").post(async (req, res) => {
  try {
    let db_connect = dbo.getDb();
    const result = await db_connect
      .collection("users")
      .findOne({ username: req.body.username });
    if (result) {
      res.json({ message: "username already in use", status: 1 });
    } else {
      res.json({ message: "username", status: 0 });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" }); // Looked up these error mesages to help with my debugging
  }
});

function hashingPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}
function generateSalt(length = 16) {
  return crypto.randomBytes(length).toString("hex");
}

module.exports = accountRoutes;
