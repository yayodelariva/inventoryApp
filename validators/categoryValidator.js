const { body } = require("express-validator");

const validateCategory = [
  body("categoryName")
    .trim()
    .notEmpty()
    .withMessage("Category name is required.")
    .isLength({ min: 2, max: 50 })
    .withMessage("Category name must be between 2 and 50 characters.")
    .matches(/^[A-Za-z0-9\s&-]+$/)
    .withMessage(
      "Category name can only contain letters, numbers, spaces, '&' and '-'.",
    )
    .escape(),
];

module.exports = {
  validateCategory,
};
