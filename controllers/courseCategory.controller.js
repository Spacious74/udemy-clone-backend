const CourseCategory = require("../models/CourseCategory");

const addCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).send({ success: false, message: "Category name is required" });
        }

        const existingCategory = await CourseCategory.findOne({ name });
        if (existingCategory) {
            return res.status(400).send({ success: false, message: "Category already exists" });
        }

        const newCategory = await CourseCategory.create({ name, description });
        
        return res.status(201).send({
            success: true,
            message: "Category added successfully",
            data: newCategory
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Failed to add category",
            error: error.message
        });
    }
};

const getAllCategories = async (req, res) => {
    try {
        const categories = await CourseCategory.find({ isActive: true }).sort({ name: 1 });
        return res.status(200).send({
            success: true,
            data: categories
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Failed to fetch categories",
            error: error.message
        });
    }
};

module.exports = {
    addCategory,
    getAllCategories
};
