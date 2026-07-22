const { Router } = require("express");
const inventoryController = require("../controllers/inventoryController");
const { validateCategory } = require("../validators/categoryValidator");

const router = Router();

router.get("/", inventoryController.renderHomepage);

router.post(
  "/categories/create",
  validateCategory,
  inventoryController.createCategory,
);

router.get("/:category/:name", inventoryController.getItem);

router.get("/:category", inventoryController.getCategory);

module.exports = router;
