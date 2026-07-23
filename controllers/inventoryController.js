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
  console.log(">>> getItem");
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

    const { categoryName, picture } = req.body;

    const slug = categoryName.trim().toLowerCase().replace(/\s+/g, "-");

    await pool.query(
      `
      INSERT INTO categories(name, slug, picture)
      VALUES($1,$2,$3)
      `,
      [categoryName, slug, picture],
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

async function deleteCategory(req, res, next) {
  console.log(">>> deleteCategory");
  console.log(req.method);
  console.log(req.originalUrl);
  try {
    const { category } = req.params;
    const { password } = req.body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).send("Incorrect password.");
    }

    const itemCount = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM items
      JOIN categories
        ON items.category_id = categories.id
      WHERE categories.slug = $1
      `,
      [category],
    );

    if (Number(itemCount.rows[0].total) > 0) {
      return res
        .status(400)
        .send("Cannot delete a category that still contains items.");
    }

    const result = await pool.query(
      `
  DELETE FROM categories
  WHERE slug = $1
  RETURNING *;
  `,
      [category],
    );

    console.log(result.rows);

    if (result.rows.length === 0) {
      return res.status(404).send("Category not found.");
    }

    res.redirect("/");
  } catch (error) {
    next(error);
  }
}

async function deleteItem(req, res, next) {
  console.log(">>> deleteItem");
  try {
    const { category, name } = req.params;
    const { password } = req.body;

    // Verify admin password
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).send("Incorrect password.");
    }

    // Delete the item
    const result = await pool.query(
      `
      DELETE FROM items
      USING categories
      WHERE items.category_id = categories.id
        AND categories.slug = $1
        AND items.name = $2
      RETURNING items.id;
      `,
      [category, name],
    );

    if (result.rowCount === 0) {
      return res.status(404).send("Item not found.");
    }

    // Redirect back to the category page
    res.redirect(`/${category}`);
  } catch (error) {
    next(error);
  }
}

async function verifyUpdatePassword(req, res) {
  const { password } = req.body;
  const { category, name } = req.params;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).send("Incorrect password.");
  }

  res.redirect(`/${category}/${encodeURIComponent(name)}/update`);
}

async function renderUpdateItem(req, res, next) {
  try {
    const { category, name } = req.params;

    const itemResult = await pool.query(
      `
      SELECT
        items.*,
        categories.slug
      FROM items
      JOIN categories
        ON items.category_id = categories.id
      WHERE categories.slug = $1
        AND items.name = $2
      `,
      [category, name],
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).send("Item not found.");
    }

    const categoriesResult = await pool.query(`
      SELECT id, name
      FROM categories
      ORDER BY name;
    `);

    res.render("updateItem", {
      item: itemResult.rows[0],
      categories: categoriesResult.rows,
    });
  } catch (error) {
    next(error);
  }
}

async function updateItem(req, res, next) {
  try {
    const { category, name } = req.params;

    const { name: newName, price, description, picture, categoryId } = req.body;

    const result = await pool.query(
      `
      UPDATE items
      SET
        name = $1,
        price = $2,
        description = $3,
        picture = $4,
        category_id = $5
      WHERE id = (
        SELECT items.id
        FROM items
        JOIN categories
          ON items.category_id = categories.id
        WHERE categories.slug = $6
          AND items.name = $7
      )
      RETURNING *;
      `,
      [newName, price, description, picture, categoryId, category, name],
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Item not found.");
    }

    // Find the slug of the (possibly new) category
    const categoryResult = await pool.query(
      `
      SELECT slug
      FROM categories
      WHERE id = $1
      `,
      [categoryId],
    );

    const newSlug = categoryResult.rows[0].slug;

    res.redirect(`/${newSlug}/${encodeURIComponent(newName)}`);
  } catch (error) {
    next(error);
  }
}

async function renderCreateItem(req, res, next) {
  try {
    const { category } = req.params;

    const { rows } = await pool.query(
      `
      SELECT *
      FROM categories
      WHERE slug = $1
      `,
      [category],
    );

    if (rows.length === 0) {
      return res.status(404).send("Category not found");
    }

    res.render("createItem", {
      category: rows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function createItem(req, res, next) {
  try {
    const { category } = req.params;

    const { name, price, picture, description } = req.body;

    // Find category ID
    const categoryResult = await pool.query(
      `
      SELECT id
      FROM categories
      WHERE slug = $1
      `,
      [category],
    );

    if (categoryResult.rows.length === 0) {
      return res.status(404).send("Category not found");
    }

    const categoryId = categoryResult.rows[0].id;

    await pool.query(
      `
      INSERT INTO items
      (
        category_id,
        name,
        price,
        picture,
        description
      )
      VALUES
      ($1,$2,$3,$4,$5)
      `,
      [categoryId, name, price, picture, description],
    );

    res.redirect(`/${category}`);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  renderHomepage,
  getCategory,
  getItem,
  createCategory,
  deleteItem,
  verifyUpdatePassword,
  renderUpdateItem,
  updateItem,
  deleteCategory,
  createItem,
  renderCreateItem,
};
