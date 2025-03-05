const express = require("express");
const app = express();

const Cart = require("../models/Cart");
const Course = require("../models/Course");

const addToCart = async (req, res) => {
  const courseId = req.query.courseId;
  const userId = req.query.userId;

  try {
    const cart = await Cart.findOne({ userId: userId });
    const course = await Course.findOne({ _id: courseId });

    const courseFind = cart.cartItems.find(
      (course) => course.courseId == courseId
    );
    if (courseFind) {
      res.status(400).send({
        message: "Course already exist in your cart",
        success : false
      });
      return;
    }

    let obj = {
      courseId: course._id,
      coursePoster: {
        public_id: "Sample Id",
        url: "Sample url",
      },
      courseName: course.title,
      coursePrice: course.price,
    };

    cart.cartItems.push(obj);
    await cart.save();
    res.status(200).send({
      message: "Course added to your cart successfully!",
      sucess: true,
    });
  } catch (error) {
    res.status(400).send({
      message: "Bad request. Try again later!",
      error: error.message,
    });
  }
};

const removeFromCart = async (req, res) => {
  const courseId = req.query.courseId;
  const userId = req.query.userId;

  try {
    const cart = await Cart.findOne({ userId: userId });

    const courseIndex = cart.cartItems.findIndex(
      (course) => course.courseId == courseId
    );

    if (courseIndex == -1) {
      res.status(404).send({
        message: "Item not found in your cart!",
      });
      return;
    }

    cart.cartItems.splice(courseIndex, 1);
    await cart.save();

    res.status(200).send({
      message: "Item removed from cart successfully!",
    });
  } catch (error) {
    res.status(500).send({
      message: "Some internal error occurs. Please try again later!",
      error: error.message,
    });
  }
};

const getCart = async (req, res) => {
  const userId = req.params.userId;
  try {
    const cart = await Cart.findOne({ userId: userId });
    const isEmpty = cart.cartItems.length == 0 ? true : false;
    res.status(200).send({
      cartItemsLength: cart.cartItems.length,
      isEmpty,
      cart
    });
  } catch (error) {
    res.status(error.status).send({
      message : "Some internal error occurred!",
      error : error.message
    })
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  getCart,
};
