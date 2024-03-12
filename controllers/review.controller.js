const Review = require("../models/Review");
const User = require("../models/User");

const getReviews = async (req, res) => {
  const courseId = req.params.courseId;
  try {
    const review = await Review.findOne({ courseId: courseId });
    const total = review.reviewArr.length;
    res.status(200).send({
      totalReviews: total,
      reviews: review.reviewArr,
    });
  } catch (error) {
    res.status(500).send({
      message: "Some internal error occurred",
      error: error.message,
    });
  }
};

const rateAndReview = async (req, res) => {
  const userId = req.query.userId;
  const courseId = req.query.courseId;
  const { rate, desc } = req.body;
  try {
    const user = await User.findOne({ _id: userId });
    const userName = user.username;
    const review = await Review.findOne({ courseId: courseId });

    const check = review.reviewArr.find((rev) => rev.userId == userId);
    if (check) {
      res.status(200).send({
        message: "Already reviewed. Thanks for your feedback!",
      });
      return;
    }

    review.reviewArr.push({
      userId: user._id,
      username: userName,
      rating: rate,
      desc: desc,
    });
    await review.save();
    res.status(200).send({
      message: "Thanks for your feedback!",
    });
  } catch (error) {
    res.status(500).send({
      message: "Some internal error occurred!",
      error: error.message,
    });
  }
};

const updateReview = async (req, res) => {
  const courseId = req.query.courseId;
  const reviewId = req.query.reviewId;
  const updatedData = req.body;
  try {
    const review = await Review.findOne({ courseId: courseId });
    const index = review.reviewArr.findIndex((rev) => rev._id == reviewId);
    review.reviewArr[index].rating = updatedData.rating
      ? updatedData.rating
      : review.reviewArr[index].rating;
    review.reviewArr[index].desc = updatedData.desc
      ? updatedData.desc
      : review.reviewArr[index].desc;
    await review.save();
    res.status(200).send({
      message: "Review updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: "Some internal error occurred",
      error: error.message,
    });
  }
};

const deleteReview = async (req, res) => {
  const courseId = req.query.courseId;
  const reviewId = req.query.reviewId;
  try {
    const review = await Review.findOne({ courseId: courseId });
    const index = review.reviewArr.findIndex((rev) => rev._id == reviewId);
    review.reviewArr.splice(index, 1);
    await review.save();
    res.status(200).send({
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: "Some internal error occurred!",
      error: error.message,
    });
  }
};

module.exports = {
  getReviews,
  rateAndReview,
  updateReview,
  deleteReview,
};
