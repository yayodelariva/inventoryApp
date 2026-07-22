require("dotenv").config();
const pool = require("./pool");

const categories = [
  ["Fruits & Vegetables", "fruits-vegetables"],
  ["Dairy", "dairy"],
  ["Pantry", "pantry"],
  ["Meat & Seafood", "meat-seafood"],
  ["Snacks", "snacks"],
  ["Pharmacy", "pharmacy"],
];

const items = {
  "fruits-vegetables": [
    [
      "Apple",
      "fruit",
      1.99,
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6",
    ],
    [
      "Banana",
      "fruit",
      0.79,
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e",
    ],
    [
      "Orange",
      "fruit",
      1.49,
      "https://images.unsplash.com/photo-1547514701-42782101795e",
    ],
    [
      "Strawberry",
      "fruit",
      2.99,
      "https://images.unsplash.com/photo-1464965911861-746a04b4bca6",
    ],
    [
      "Watermelon",
      "fruit",
      5.99,
      "https://images.unsplash.com/photo-1587049352851-8d4e89133924",
    ],

    [
      "Carrot",
      "vegetable",
      1.29,
      "https://images.unsplash.com/photo-1447175008436-054170c2e979",
    ],
    [
      "Broccoli",
      "vegetable",
      2.49,
      "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc",
    ],
    [
      "Spinach",
      "vegetable",
      1.99,
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb",
    ],
  ],

  dairy: [
    [
      "Milk",
      null,
      1.99,
      "https://images.unsplash.com/photo-1563636619-e9143da7973b",
    ],
    [
      "Cheese",
      null,
      3.49,
      "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d",
    ],
    [
      "Yogurt",
      null,
      1.29,
      "https://images.unsplash.com/photo-1488477181946-6428a0291777",
    ],
    [
      "Butter",
      null,
      2.79,
      "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d",
    ],
  ],

  pantry: [
    [
      "Rice",
      null,
      1.99,
      "https://images.unsplash.com/photo-1586201375761-83865001e31c",
    ],
    [
      "Pasta",
      null,
      1.49,
      "https://images.unsplash.com/photo-1556761223-4c4282c73f77",
    ],
    [
      "Coffee",
      null,
      5.99,
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
    ],
  ],

  "meat-seafood": [
    [
      "Chicken Breast",
      "meat",
      6.99,
      "https://images.unsplash.com/photo-1604503468506-a8da13d82791",
    ],
    [
      "Beef Steak",
      "meat",
      12.99,
      "https://images.unsplash.com/photo-1600891964092-4316c288032e",
    ],
    [
      "Salmon",
      "fish",
      14.99,
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288",
    ],
    [
      "Shrimp",
      "fish",
      9.99,
      "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47",
    ],
  ],

  snacks: [
    [
      "Potato Chips",
      null,
      2.49,
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b",
    ],
    [
      "Cookies",
      null,
      2.99,
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35",
    ],
    [
      "Chocolate",
      null,
      3.49,
      "https://images.unsplash.com/photo-1549007994-cb92caebd54b",
    ],
  ],

  pharmacy: [
    [
      "Pain Reliever",
      null,
      4.99,
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae",
    ],
    [
      "Vitamin C",
      null,
      8.99,
      "https://images.unsplash.com/photo-1550572017-edd951aa8ca1",
    ],
    [
      "Bandages",
      null,
      2.99,
      "https://images.unsplash.com/photo-1603398938378-e54eab446dde",
    ],
  ],
};

async function seed() {
  try {
    await pool.query("TRUNCATE items, categories RESTART IDENTITY CASCADE");

    for (const category of categories) {
      await pool.query(
        `
        INSERT INTO categories(name, slug)
        VALUES($1, $2)
        `,
        category,
      );
    }

    const { rows: categoryRows } = await pool.query(
      "SELECT id, slug FROM categories",
    );

    const categoryMap = {};

    categoryRows.forEach((category) => {
      categoryMap[category.slug] = category.id;
    });

    for (const [categorySlug, products] of Object.entries(items)) {
      const categoryId = categoryMap[categorySlug];

      for (const product of products) {
        await pool.query(
          `
          INSERT INTO items
          (name, type, price, picture, category_id)
          VALUES($1,$2,$3,$4,$5)
          `,
          [product[0], product[1], product[2], product[3], categoryId],
        );
      }
    }

    console.log("Database seeded successfully");
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
}

seed();
