const Cart = require("../models/Cart");
const Course = require("../models/Course");
const DraftedCourse = require("../models/DraftedCourse");

const addToCart = async (req, res) => {
  
  const courseId = req.query.courseId;
  const userId = req.query.userId;

  try {
    const cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      return res.status(404).send({
        message: "Cart not found! Please login again.",
        success: false
      });
    }
    const course = await DraftedCourse.findOne({ _id: courseId });
     if (!course) {
      return res.status(404).send({
        message: "Course not found!",
        success: false
      });
    }
 
   const existingCourse = cart.cartItems.find(
      (item) => item.courseId == courseId
    );
    if (existingCourse) {
      return res.status(200).send({
        message: "Course already exists in your cart",
        success: false
      });
    }

    let obj = {
      courseId: course._id,
      coursePoster: course.coursePoster,
      courseName: course.title,
      coursePrice: course.price,
      educatorName : course.educator.edname,
      lectures : course.totalLectures,
      language : course.language,
      level : course.level
    };

    cart.cartItems.push(obj);
    await cart.save();

    res.status(200).send({
      message: "Course added to your cart successfully!",
      success: true,
    });
    
  } catch (error) {
    res.status(400).send({
      message: "Bad request. Try again later!",
      error: error.message,
      success : false
    });
  }
};

const mergeCart = async (req, res) => {
  const userId = req.query.userId;
  const cartItems = req.body.cartItems;
  try {

    let cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      cart = new Cart({ userId: userId, cartItems: [] });
    } 
    
    // Check if the course already exists in the cart
    for (const item of cartItems) {
      const existingCourse = cart.cartItems.find(
        (course) => course.courseId == item.courseId
      );
      if (!existingCourse) {
        cart.cartItems.push(item);
      }
    }
    await cart.save();
    res.status(200).send({
      message: "Cart merged successfully!",
      cart,
      success: true
    });

  } catch (error) {
    res.status(500).send({
      message: "Some internal error occurred while merging the cart!",
      error: error.message,
      success: false
    });
  }
}

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
        success : false
      });
      return;
    }

    cart.cartItems.splice(courseIndex, 1);
    await cart.save();

    res.status(200).send({
      message: "Item removed from cart successfully!",
      success : true
    });

  } catch (error) {
    
    res.status(500).send({
      message: "Some internal error occurs. Please try again later!",
      error: error.message,
      success : false
    });
    
  }
};

const getCart = async (req, res) => {
  const userId = req.query.userId;
  try {
    const cart = await Cart.findOne({ userId: userId });
    if(!cart){
      return res.status(404).send({
        message : "Cart not found! Please login again!",
        error : "Cart not found!",
        success : false
      })
    }

    res.status(200).send({
      cartItemsLength: cart.cartItems.length,
      cart,
      message : "Cart data fetched successfully!",
      success : true
    });

  } catch (error) {
    res.status(error.status).send({
      message : "Some internal error occurred!",
      error : error.message,
      success : true
    })
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  getCart,
  mergeCart
};
