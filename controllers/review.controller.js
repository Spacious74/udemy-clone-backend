const Review = require("../models/Review");

function calculateOverallRating(reviewArr) {
  let totalRating = reviewArr.reduce((s, r) => s + r.rating, 0);
  let result = totalRating / reviewArr.length;
  return Number(result.toFixed(1));
}

const getReviews = async (req, res) => {
  const { courseId, userId } = req.query;
  try {
    const review = await Review.findOne({ courseId: courseId });
    
    let userReview = review.reviewArr.find((dt)=>dt.userId == userId);
    if(!userReview) userReview = null;

    res.status(200).send({
      success: true,
      message : "Reviews fetched successfully!",
      reviews: review.reviewArr,
      overallRating: review.overallRating,
      userReview
    });

  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Some internal error occurred",
      error: error.message,
    });
  }
};

const rateAndReview = async (req, res) => {

  const { desc, rating, userId, username } = req.body;
  const { courseId } = req.query;
  try {
    const review = await Review.findOne({ courseId: courseId });

    let userReview = {
      userId,
      username,
      rating,
      desc
    }
    review.reviewArr.push(userReview);

    review.overallRating = calculateOverallRating(review.reviewArr);

    await review.save();

    res.status(200).send({
      success: true,
      message: "Thanks for your feedback!",
      reviews: review.reviewArr,
      overallRating: review.overallRating,
      userReview
    });

  } catch (error) {
    res.status(500).send({
      message: "Some internal error occurred!",
      error: error.message,
    });
  }
};

const updateReview = async (req, res) => {
  const { courseId, userId } = req.query;
  const updatedData = req.body;
  try {
    const review = await Review.findOne({ courseId: courseId });
    const index = review.reviewArr.findIndex((rev) => rev.userId == userId);

    review.reviewArr[index].rating = updatedData.rating ? updatedData.rating : review.reviewArr[index].rating;

    review.reviewArr[index].desc = updatedData.desc ? updatedData.desc : review.reviewArr[index].desc;

    review.overallRating = calculateOverallRating(review.reviewArr);

    await review.save();

    let userReview = review.reviewArr[index];

    res.status(200).send({
      success: true,
      message: "Review updated successfully",
      reviews: review.reviewArr,
      overallRating: review.overallRating,
      userReview
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Some internal error occurred",
      error: error.message,
    });
  }
};

const deleteReview = async (req, res) => {
  const { courseId, reviewId } = req.query;
  try {
    const review = await Review.findOne({ courseId: courseId });
    const index = review.reviewArr.findIndex((rev) => rev._id == reviewId);
    review.reviewArr.splice(index, 1);
    review.overallRating = calculateOverallRating(review.reviewArr);
    await review.save();
    let userReview = null;
    res.status(200).send({
      success: true,
      message: "Review deleted successfully",
      reviews: review.reviewArr,
      overallRating: review.overallRating,
      userReview
    });
  } catch (error) {
    res.status(500).send({
      success: false,
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
