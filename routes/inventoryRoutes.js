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

router.post("/:category/:name/update", inventoryController.updateItem);

router.post("/:category/:name/delete", inventoryController.deleteItem);

router.get("/:category/:name", inventoryController.getItem);

router.get("/:category", inventoryController.getCategory);

module.exports = router;
