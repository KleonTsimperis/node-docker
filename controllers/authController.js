const User = require("../models/userModel");
const brcypt = require("bcryptjs");

exports.signUp = async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashpassword = await brcypt.hash(password, 12);
    const newUser = await User.create({
      username,
      password: hashpassword,
    });
    // req.sessions.user = newUser;
    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fails",
    });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        status: "fails",
        message: "user not found",
      });
    }

    const isCorrect = await brcypt.compare(password, user.password);

    if (isCorrect) {
      console.log(1111, req.session, user);
      //   req.session.user = user;
      res.status(200).json({
        status: "success",
      });
    } else {
      res.status(400).json({
        status: "failed yo",
        message: "incorrect user or pass.",
      });
    }
  } catch (error) {
    console.log(2222, error);
    res.status(400).json({
      status: "faild",
    });
  }
};
