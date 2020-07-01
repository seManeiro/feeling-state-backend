let express = require("express");
let router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../configuration/config");

// Load User model
const usersSchema = require("../models/Users");
// Feeling Model
let feelingSchema = require("../models/Feelings");

// CREATE Student
router.route("/feelings/create-feeling").post((req, res, next) => {
  feelingSchema.create(req.body, (error, data) => {
    if (error) {
      return next(error);
    } else {
      console.log(data);
      res.json(data);
    }
  });
});

// READ Feelings list for certain user
router.route("/feelings/feelings-list").post((req, res, next) => {
  console.log(req);

  let query = feelingSchema.find({ userId: req.body.userId }).sort({'date': -1}).limit(10);
  query.exec( (error, data) => {
    if (error) {
      return next(error);
    } else {
      console.log(data);
      return res.json(data);
    }
  });
});

// READ Feelings list for certain user between dates
router.route("/feelings/betweendates").post((req, res, next) => {
  console.log(req.url);
  console.log(req.body);

  feelingSchema.find(
    {
      date: {
        $gte: req.body.fromDate,
        $lte: req.body.toDate
      },
      userId: req.body.userId,
    },
    (error, data) => {
      if (error) {
        return next(error);
      } else {
        console.log(data);
        return res.json(data);
      }
    }
  );
});

// Get Single feeling
router.route("/feelings/edit-feeling/:id").get((req, res, next) => {
  feelingSchema.findById(req.params.id, (error, data) => {
    if (error) {
      return next(error);
    } else {
      return res.json(data);
    }
  });
});

// Update Feeling
router.route("/feelings/update-feeling/:id").put((req, res, next) => {
  feelingSchema.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    (error, data) => {
      if (error) {
        console.log(error);
        return next(error);
      } else {
        console.log("Feeling updated successfully !");
        return res.json(data);
      }
    }
  );
});

// Delete Feeling
router.route("/feelings/delete-feeling/:id").delete((req, res, next) => {
  feelingSchema.findByIdAndRemove(req.params.id, (error, data) => {
    if (error) {
      return next(error);
    } else {
      return res.status(200).json({
        msg: data,
      });
    }
  });
});

router.route("/newuser/register").post((req, res, next) => {
  usersSchema.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      const response = res.status(400).json({ email: "Email already exists" });
      console.log(response);
      return response;
    } else {
      const newUser = new usersSchema({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      });
      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then((user) => res.json(user))
            .catch((err) => console.log(err));
        });
      });
    }
  });
});

router.route("/user/login").post((req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // Find user by email
  usersSchema.findOne({ email }).then((user) => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ emailnotfound: "Email not found" });
    }
    // Check password
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: user.id,
          username: user.username,
        };
        // Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 31556926, // 1 year in seconds
          },
          (err, token) => {
            res.json({
              success: true,
              token: token,
            });
          }
        );
      } else {
        return res
          .status(400)
          .json({ passwordincorrect: "Password incorrect" });
      }
    });
  });
});

module.exports = router;
