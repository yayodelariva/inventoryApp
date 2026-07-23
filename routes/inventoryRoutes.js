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

router.post(
  "/:category/:name/update/verify",
  inventoryController.verifyUpdatePassword,
);

router.post("/categories/:category/delete", inventoryController.deleteCategory);

router.post("/:category/:name/update", inventoryController.updateItem);

router.get("/:category/:name/update", inventoryController.renderUpdateItem);

router.get(
  "/categories/:category/items/new",
  inventoryController.renderCreateItem,
);

router.post(
  "/categories/:category/items/create",
  inventoryController.createItem,
);

router.post("/:category/:name/delete", inventoryController.deleteItem);

router.get("/:category/:name", inventoryController.getItem);

router.get("/:category", inventoryController.getCategory);

module.exports = router;
