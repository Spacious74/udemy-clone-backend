const QueAns = require("../models/QueAns");
const Course = require("../models/Course");
const User = require("../models/User");

const getQuestions = async (req, res) => {
  const courseId = req.params.courseId;
  try {
    const questions = await QueAns.findOne({ courseId: courseId });
    res.status(200).send({
      message: "Questions fetched successfully",
      totalQuestions: questions.qaArr.length,
      questions: questions.qaArr,
    });
  } catch (error) {
    res.status(500).send({
      message: "Some internal error occurred",
      error: error.message,
    });
  }
};
const askQuestion = async (req, res) => {
  const { que, lec } = req.body;
  const courseId = req.query.courseId;
  const userId = req.query.userId;

  try {
    const question = await QueAns.findOne({ courseId: courseId });
    const user = await User.findOne({ _id: userId });
    question.qaArr.push({
      question: que,
      lectureNo: lec,
      userId: user._id,
      username: user.username,
      ansArr: [],
    });
    await question.save();
    res.status(200).send({
      message:
        "Question asked successfully. We will notify you when someone answers your question.",
      questions: question.qaArr,
    });
  } catch (error) {
    res.status(500).send({
      message: "Some internal error occurred",
      error: error.message,
    });
  }
};
const editQuestion = async (req, res) => {
  const { que } = req.body;
  const courseId = req.query.courseId;
  const questionId = req.query.questionId;
  try {
    const question = await QueAns.findOne({ courseId: courseId });
    const index = question.qaArr.findIndex((q) => q._id == questionId);
    if (index == -1) {
      res.status(404).send({
        message: "Question not found. Something went wrong from your side!",
      });
      return;
    }
    question.qaArr[index].question = que ? que : question.qaArr[index].question;
    await question.save();
    res.status(200).send({
      message: "Question updated successfully!",
      question,
    });
  } catch (error) {
    res.status(500).send({
      message: "Some internal error occurred",
      error: error.message,
    });
  }
};
const deleteQuestion = async (req, res) => {
  const courseId = req.query.courseId;
  const questionId = req.query.questionId;
  try {
    const question = await QueAns.findOne({ courseId: courseId });
    const index = question.qaArr.findIndex((q) => q._id == questionId);
    if (index == -1) {
      res.status(404).send({
        message: "Question not found. Something went wrong from your side!",
      });
      return;
    }
    question.qaArr.splice(index, 1);
    await question.save();
    res.status(200).send({
      message: "Question deleted successfully!",
      question,
    });
  } catch (error) {
    res.status(500).send({
      message: "Some internal error occurred",
      error: error.message,
    });
  }
};

const getAnswersOfQuestion = async (req, res) => {
  const courseId = req.query.courseId;
  const questionId = req.query.questionId;
  try {
    const question = await QueAns.findOne({ courseId: courseId });
    const index = question.qaArr.findIndex((q) => q._id == questionId);
    if (index == -1) {
      res.status(404).send({
        message: "Question not found. Something went wrong from your side!",
      });
      return;
    }
    res.status(200).send({
      message: "Answer fetched successfully",
      questionAsked: question.qaArr[index].question,
      totalAnswer: question.qaArr[index].ansArr.length,
      answers: question.qaArr[index].ansArr,
    });
  } catch (error) {
    res.status(500).send({
      message: "Some internal error occurred",
      error: error.message,
    });
  }
};
const replyAnswer = async (req, res) => {
  const { ans } = req.body;
  const userId = req.query.userId;
  const courseId = req.query.courseId;
  const questionId = req.query.questionId;

  try {
    const question = await QueAns.findOne({ courseId: courseId });
    const user = await User.findOne({ _id: userId });
    const index = question.qaArr.findIndex((que) => que._id == questionId);
    if (index == -1) {
      res.status(404).send({
        message: "Question not found",
      });
      return;
    }
    question.qaArr[index].ansArr.push({
      userId: user._id,
      username: user.username,
      answer: ans,
    });
    await question.save();
    res.status(200).send({
      message: "Answered successfully!",
      questions: question.qaArr,
    });
  } catch (error) {
    res.status(500).send({
      message: "Some internal error occurred",
      error: error.message,
    });
  }
};
const editAnswer = async (req, res) => {
  const questionId = req.query.questionId;
  const answerId = req.query.answerId;
  const courseId = req.query.courseId;
  const { ans } = req.body;
  try {
    const question = await QueAns.findOne({ courseId: courseId });
    const que_index = question.qaArr.findIndex((q) => q._id == questionId);
    if (que_index == -1) {
      res.status(404).send({
        message: "Question not found. Something went wrong from your side!",
      });
      return;
    }
    let ans_index = question.qaArr[que_index].ansArr.findIndex(
      (a) => a._id == answerId
    );
    if (ans_index == -1) {
      res.status(404).send({
        message: "Answer not found. Something went wrong from your side!",
      });
      return;
    }
    question.qaArr[que_index].ansArr[ans_index].answer = ans
      ? ans
      : question.qaArr[que_index].ansArr[ans_index].answer;
    await question.save();
    res.status(200).send({
      message: "Answer updated succesfully",
      answers: question.qaArr[que_index].ansArr,
    });
  } catch (error) {
    res.status(500).send({
      message: "Some internal error occurred",
      error: error.message,
    });
  }
};
const deleteAnswer = async (req, res) => {
  const questionId = req.query.questionId;
  const answerId = req.query.answerId;
  const courseId = req.query.courseId;
  try {
    const question = await QueAns.findOne({ courseId: courseId });
    const que_index = question.qaArr.findIndex((q) => q._id == questionId);
    if (que_index == -1) {
      res.status(404).send({
        message: "Question not found. Something went wrong from your side!",
      });
      return;
    }
    let ans_index = question.qaArr[que_index].ansArr.findIndex(
      (a) => a._id == answerId
    );
    if (ans_index == -1) {
      res.status(404).send({
        message: "Answer not found. Something went wrong from your side!",
      });
      return;
    }
    question.qaArr[que_index].ansArr.splice(ans_index, 1);
    await question.save();
    res.status(200).send({
      message: "Answer deleted succesfully",
      answers: question.qaArr[que_index].ansArr,
    });
  } catch (error) {
    res.status(500).send({
      message: "Some internal error occurred",
      error: error.message,
    });
  }
};

module.exports = {
  getQuestions,
  askQuestion,
  editQuestion,
  deleteQuestion,

  getAnswersOfQuestion,
  replyAnswer,
  editAnswer,
  deleteAnswer,
};
