/* Recipe Finder prototype data. Prices are rough 2026 student-shop prices in Rand, per serving. */
window.RF_DATA = {
  equipment: {
    stove: "Two-plate stove",
    microwave: "Microwave",
    kettle: "Kettle only",
    none: "No cooking"
  },
  // basics most students already have; not counted against the match
  staples: ["salt", "pepper", "oil", "water", "sugar"],
  suggestions: ["egg", "rice", "onion", "tomato", "cheese", "bread", "pasta", "tuna", "baked beans",
    "maize meal", "carrot", "frozen mixed veg", "soy sauce", "milk", "banana", "oats", "honey",
    "2-minute noodles", "frozen peas", "tortilla wrap", "cooked chicken", "mayonnaise", "lettuce",
    "chopped tomatoes", "garlic", "curry powder", "butter", "chilli sauce", "spinach"],
  recipes: [
    {
      id: "egg-fried-rice", name: "Egg fried rice", meal: "Supper",
      desc: "A quick way to use leftover rice. One pan, about twenty minutes.",
      time: 20, cost: 14, difficulty: "Easy", equipment: ["stove"], servings: 1,
      rating: 4.6, reviews: 38, cookedThisWeek: 21,
      img: "img/egg-fried-rice.svg",
      alt: "A white bowl of fried rice with yellow egg, green peas and diced carrot",
      ingredients: [
        { key: "rice", qty: 1, unit: "cup cooked", name: "rice" },
        { key: "egg", qty: 2, unit: "", name: "eggs" },
        { key: "onion", qty: 0.5, unit: "", name: "onion, chopped" },
        { key: "frozen mixed veg", qty: 0.5, unit: "cup", name: "frozen mixed veg" },
        { key: "soy sauce", qty: 1, unit: "tbsp", name: "soy sauce" },
        { key: "oil", qty: 1, unit: "tbsp", name: "cooking oil" }
      ],
      steps: [
        { text: "Heat the oil in a pan on medium heat." },
        { text: "Fry the chopped onion until it is soft, about 3 minutes.", timer: 3 },
        { text: "Add the frozen veg and stir for 2 minutes.", timer: 2 },
        { text: "Push everything to one side. Crack the eggs into the empty side and scramble them." },
        { text: "Add the rice and mix it all together. Fry for 5 minutes, stirring now and then.", timer: 5 },
        { text: "Stir in the soy sauce, taste, and serve." }
      ]
    },
    {
      id: "mug-omelette", name: "Microwave mug omelette", meal: "Breakfast",
      desc: "Breakfast in a mug when you only have a microwave in res.",
      time: 5, cost: 9, difficulty: "Easy", equipment: ["microwave"], servings: 1,
      rating: 4.4, reviews: 52, cookedThisWeek: 34,
      img: "img/mug-omelette.svg",
      alt: "A white mug filled with fluffy yellow omelette and pieces of tomato",
      ingredients: [
        { key: "egg", qty: 2, unit: "", name: "eggs" },
        { key: "milk", qty: 2, unit: "tbsp", name: "milk" },
        { key: "cheese", qty: 0.25, unit: "cup", name: "grated cheese" },
        { key: "tomato", qty: 0.5, unit: "", name: "tomato, diced" },
        { key: "salt", qty: 1, unit: "pinch", name: "salt" }
      ],
      steps: [
        { text: "Grease a large microwave-safe mug." },
        { text: "Whisk the eggs and milk in the mug with a fork." },
        { text: "Stir in the cheese, tomato and salt." },
        { text: "Microwave for 1 minute, stir, then microwave for another 45 seconds until set.", timer: 2 }
      ]
    },
    {
      id: "tuna-pasta", name: "Tuna and tomato pasta", meal: "Supper",
      desc: "Cheap, filling and good for two meals if you double it.",
      time: 25, cost: 18, difficulty: "Easy", equipment: ["stove"], servings: 1,
      rating: 4.5, reviews: 29, cookedThisWeek: 15,
      img: "img/tuna-pasta.svg",
      alt: "A bowl of pasta shells in red tomato sauce with flakes of tuna and green herbs",
      ingredients: [
        { key: "pasta", qty: 100, unit: "g", name: "pasta" },
        { key: "tuna", qty: 0.5, unit: "tin", name: "tuna" },
        { key: "chopped tomatoes", qty: 0.5, unit: "tin", name: "chopped tomatoes" },
        { key: "onion", qty: 0.5, unit: "", name: "onion" },
        { key: "garlic", qty: 1, unit: "clove", name: "garlic" },
        { key: "oil", qty: 1, unit: "tbsp", name: "oil" }
      ],
      steps: [
        { text: "Boil salted water and cook the pasta for 10 minutes.", timer: 10 },
        { text: "On the second plate, fry the onion and garlic in oil for 3 minutes.", timer: 3 },
        { text: "Add the tomatoes and simmer for 5 minutes.", timer: 5 },
        { text: "Stir in the drained tuna and the cooked pasta. Serve." }
      ]
    },
    {
      id: "pap-chakalaka", name: "Pap and quick chakalaka", meal: "Supper",
      desc: "A proper home-style plate that still fits a student budget.",
      time: 35, cost: 12, difficulty: "Medium", equipment: ["stove"], servings: 1,
      rating: 4.8, reviews: 44, cookedThisWeek: 27,
      img: "img/pap-chakalaka.svg",
      alt: "A plate with white pap next to a spicy orange chakalaka of beans, carrot and tomato",
      ingredients: [
        { key: "maize meal", qty: 0.5, unit: "cup", name: "maize meal" },
        { key: "baked beans", qty: 0.5, unit: "tin", name: "baked beans" },
        { key: "onion", qty: 0.5, unit: "", name: "onion" },
        { key: "tomato", qty: 1, unit: "", name: "tomato" },
        { key: "carrot", qty: 1, unit: "", name: "carrot, grated" },
        { key: "curry powder", qty: 1, unit: "tsp", name: "curry powder" }
      ],
      steps: [
        { text: "Bring 1 cup of water to the boil and slowly stir in the maize meal." },
        { text: "Cover and cook on low for 20 minutes, stirring every few minutes.", timer: 20 },
        { text: "On the other plate, fry the onion, carrot and curry powder for 4 minutes.", timer: 4 },
        { text: "Add the tomato and beans and simmer for 5 minutes. Serve with the pap.", timer: 5 }
      ]
    },
    {
      id: "kettle-noodles", name: "Cheesy kettle noodles with peas", meal: "Lunch",
      desc: "For days when the kettle is all you have.",
      time: 10, cost: 10, difficulty: "Easy", equipment: ["kettle"], servings: 1,
      rating: 4.1, reviews: 61, cookedThisWeek: 40,
      img: "img/kettle-noodles.svg",
      alt: "A bowl of yellow noodles with green peas and melted cheese",
      ingredients: [
        { key: "2-minute noodles", qty: 1, unit: "pack", name: "2-minute noodles" },
        { key: "frozen peas", qty: 0.25, unit: "cup", name: "frozen peas" },
        { key: "cheese", qty: 0.25, unit: "cup", name: "grated cheese" },
        { key: "chilli sauce", qty: 1, unit: "tsp", name: "chilli sauce (optional)" }
      ],
      steps: [
        { text: "Boil the kettle." },
        { text: "Put the noodles and peas in a bowl and cover with boiling water. Put a plate on top." },
        { text: "Wait 4 minutes.", timer: 4 },
        { text: "Drain most of the water, add the flavour sachet, cheese and chilli sauce, and stir." }
      ]
    },
    {
      id: "bean-toast", name: "Cheese and bean toast", meal: "Lunch",
      desc: "Classic res food. Done in ten minutes.",
      time: 10, cost: 11, difficulty: "Easy", equipment: ["stove"], servings: 1,
      rating: 4.3, reviews: 33, cookedThisWeek: 18,
      img: "img/bean-toast.svg",
      alt: "A slice of golden toast topped with baked beans and melted cheese on a plate",
      ingredients: [
        { key: "bread", qty: 2, unit: "slices", name: "bread" },
        { key: "baked beans", qty: 0.5, unit: "tin", name: "baked beans" },
        { key: "cheese", qty: 0.25, unit: "cup", name: "grated cheese" },
        { key: "butter", qty: 1, unit: "tsp", name: "butter" }
      ],
      steps: [
        { text: "Toast the bread in a dry pan, about 2 minutes a side.", timer: 4 },
        { text: "Warm the beans in a small pot for 3 minutes.", timer: 3 },
        { text: "Butter the toast, spoon the beans on top and add the cheese." }
      ]
    },
    {
      id: "chicken-wrap", name: "Chicken mayo wrap", meal: "Lunch",
      desc: "No stove needed. Uses ready-cooked chicken from the shop.",
      time: 10, cost: 22, difficulty: "Easy", equipment: ["none"], servings: 1,
      rating: 4.2, reviews: 17, cookedThisWeek: 9,
      img: "img/chicken-wrap.svg",
      alt: "A rolled tortilla wrap filled with chicken, lettuce and tomato",
      ingredients: [
        { key: "tortilla wrap", qty: 2, unit: "", name: "tortilla wraps" },
        { key: "cooked chicken", qty: 1, unit: "cup", name: "cooked chicken, shredded" },
        { key: "mayonnaise", qty: 2, unit: "tbsp", name: "mayonnaise" },
        { key: "lettuce", qty: 2, unit: "leaves", name: "lettuce" },
        { key: "tomato", qty: 1, unit: "", name: "tomato, sliced" }
      ],
      steps: [
        { text: "Mix the chicken with the mayonnaise." },
        { text: "Lay out the wraps and add lettuce and tomato." },
        { text: "Add the chicken, roll up tightly and cut in half." }
      ]
    },
    {
      id: "overnight-oats", name: "Overnight oats with banana", meal: "Breakfast",
      desc: "Make it before bed, grab it before your 8am class.",
      time: 5, cost: 7, difficulty: "Easy", equipment: ["none"], servings: 1,
      rating: 4.5, reviews: 26, cookedThisWeek: 12,
      img: "img/overnight-oats.svg",
      alt: "A glass jar of creamy oats topped with banana slices and honey",
      ingredients: [
        { key: "oats", qty: 0.5, unit: "cup", name: "oats" },
        { key: "milk", qty: 0.5, unit: "cup", name: "milk" },
        { key: "banana", qty: 1, unit: "", name: "banana" },
        { key: "honey", qty: 1, unit: "tsp", name: "honey" }
      ],
      steps: [
        { text: "Put the oats and milk in a jar and stir." },
        { text: "Slice the banana on top and add the honey." },
        { text: "Close the jar and leave it in the fridge overnight." }
      ]
    }
  ],
  seedReviews: {
    "egg-fried-rice": [
      { name: "Thandi M.", detail: "2nd year, lives in res", rating: 5, date: "12 Oct 2026",
        text: "Used rice from the night before and it worked so much better than fresh rice. Tip: no soy sauce? A bit of chutney and salt is fine." },
      { name: "Kyle P.", detail: "1st year, shared digs", rating: 4, date: "3 Oct 2026",
        text: "Easy. I added the leftover chicken from Sunday. Two plates is enough." }
    ],
    "mug-omelette": [
      { name: "Lerato K.", detail: "3rd year", rating: 5, date: "15 Oct 2026",
        text: "Life saver before early lectures. Use a big mug, mine overflowed the first time." }
    ]
  }
};
