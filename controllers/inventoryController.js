const pool = require("../db/pool");
const { validationResult } = require("express-validator");

async function renderHomepage(req, res, next) {
  try {
    const { rows: categories } = await pool.query(`
      SELECT *
      FROM categories
      ORDER BY name
    `);

    res.render("index", {
      categories,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

async function getCategory(req, res, next) {
  try {
    const { category } = req.params;

    // Find the category by its slug
    const categoryResult = await pool.query(
      `
      SELECT *
      FROM categories
      WHERE slug = $1
      `,
      [category],
    );

    // Category doesn't exist
    if (categoryResult.rows.length === 0) {
      return res.status(404).send("Category does not exist");
    }

    const currentCategory = categoryResult.rows[0];

    // Get all items that belong to this category
    const { rows } = await pool.query(
      `
      SELECT *
      FROM items
      WHERE category_id = $1
      ORDER BY name
      `,
      [currentCategory.id],
    );

    // Always render the page, even if there are no items
    res.render("category", {
      category: currentCategory,
      items: rows,
    });
  } catch (error) {
    next(error);
  }
}

async function getItem(req, res, next) {
  try {
    const { category, name } = req.params;

    const { rows } = await pool.query(
      `
      SELECT items.*
      FROM items
      JOIN categories
      ON items.category_id = categories.id
      WHERE categories.slug = $1
      AND items.name = $2
      `,
      [category, name],
    );

    if (rows.length === 0) {
      return res.status(404).send("Item not found");
    }

    res.render("item", {
      item: rows[0],
      category,
    });
  } catch (error) {
    next(error);
  }
}
async function createCategory(req, res, next) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const { rows: categories } = await pool.query(`
        SELECT *
        FROM categories
        ORDER BY name
      `);

      return res.status(400).render("index", {
        categories,
        errors: errors.array(),
      });
    }

    const { categoryName } = req.body;

    const slug = categoryName.trim().toLowerCase().replace(/\s+/g, "-");

    await pool.query(
      `
      INSERT INTO categories(name, slug)
      VALUES($1,$2)
      `,
      [categoryName, slug],
    );

    res.redirect("/");
  } catch (error) {
    if (error.code === "23505") {
      const { rows: categories } = await pool.query(`
        SELECT *
        FROM categories
        ORDER BY name
      `);

      return res.status(400).render("index", {
        categories,
        errors: [{ msg: "Category already exists." }],
      });
    }

    next(error);
  }
}

async function deleteItem(req, res, next) {
  const { password } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).send("Incorrect password.");
  }

  alert("success");

  res.redirect(`/${req.params.category}`);
}

async function updateItem(req, res, next) {
  const { password } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).send("Incorrect password.");
  }

  // delete item...

  res.redirect(`/${req.params.category}`);
}

module.exports = {
  renderHomepage,
  getCategory,
  getItem,
  createCategory,
  deleteItem,
  updateItem,
};
