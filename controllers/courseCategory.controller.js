const CourseCategory = require("../models/CourseCategory");

const addCategory = async (req, res) => {
    try {
        const { name, description, parentId } = req.body;
        if (!name) {
            return res.status(400).send({ success: false, message: "Category name is required" });
        }

        // We can allow duplicate names if they are in different hierarchies, but let's keep it simple and require unique names or just check existing.
        // Actually, schema has unique: true on name. So we don't need to manually check or we can catch the duplicate key error.
        const existingCategory = await CourseCategory.findOne({ name });
        if (existingCategory) {
            return res.status(400).send({ success: false, message: "Category already exists" });
        }

        const newCategory = await CourseCategory.create({ name, description, parentId: parentId || null });
        
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

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, isActive, parentId } = req.body;

        const updatedCategory = await CourseCategory.findByIdAndUpdate(
            id,
            { name, description, isActive, parentId, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).send({ success: false, message: "Category not found" });
        }

        return res.status(200).send({
            success: true,
            message: "Category updated successfully",
            data: updatedCategory
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Failed to update category",
            error: error.message
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await CourseCategory.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).send({ success: false, message: "Category not found" });
        }

        // Optional: Also delete sub-categories if a parent is deleted
        await CourseCategory.deleteMany({ parentId: id });

        return res.status(200).send({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Failed to delete category",
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

const getAllParentCategories = async (req, res) => {
    try {
        const parentCategories = await CourseCategory.find({ isActive: true, parentId: null }).sort({ name: 1 });
        return res.status(200).send({
            success: true,
            data: parentCategories
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Failed to fetch parent categories",
            error: error.message
        });
    }
};

const getSubCategoriesByParentId = async (req, res) => {
    try {
        const { parentId } = req.params;
        const subCategories = await CourseCategory.find({ isActive: true, parentId }).sort({ name: 1 });
        return res.status(200).send({
            success: true,
            data: subCategories
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Failed to fetch sub-categories",
            error: error.message
        });
    }
};

module.exports = {
    addCategory,
    updateCategory,
    deleteCategory,
    getAllCategories,
    getAllParentCategories,
    getSubCategoriesByParentId
};
