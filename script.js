/* =========================================================================
   SPARKLET (EASY VERSION) - script.js
   JavaScript = the BRAIN. It reacts when the user clicks, types or logs in.

   THE ONE BIG IDEA used all over this file
   ----------------------------------------
        DATA  -->  function  -->  changes the PAGE (DOM)

   Example: when you finish a lesson
       1. we change the DATA        state.xp = state.xp + 15
       2. we call a function        updateScreen()
       3. the function rewrites the page so it shows the new XP

   FILE MAP (search for the section number to jump around)
       1. Helper functions     small tools used everywhere
       2. Data                 lessons, diet plan, food list
       3. App state            variables that remember things
       4. Screens + update     switching pages, refreshing numbers
       5. Lessons pop-up       slides, quiz, XP
       6. Login                sign in, sign up, guest, logout
       7. Kid / Adult mode
       8. Diet plan
       9. Food scanner
      10. Event listeners      "when THIS is clicked, run THAT"
      11. Start the app
   ========================================================================= */


/* =========================================================================
   1. HELPER FUNCTIONS
   ========================================================================= */

// Short names for two very common jobs.
// document.getElementById('x')   -> finds the ONE element with id="x"
// document.querySelectorAll('.x') -> finds ALL elements with class="x"
function $(id) {
  return document.getElementById(id);
}
function $all(selector) {
  return document.querySelectorAll(selector);
}

// Show a small message at the bottom for 2.6 seconds.
var toastTimer;
function showToast(message) {
  var toast = $('toast');
  toast.textContent = message;
  toast.classList.add('show');          // CSS slides it up
  clearTimeout(toastTimer);             // cancel the old hide-timer (if any)
  toastTimer = setTimeout(function () {
    toast.classList.remove('show');     // hide it again after 2600 ms
  }, 2600);
}

// localStorage = a small notebook inside the browser. It only stores TEXT.
// JSON.stringify turns an object into text, JSON.parse turns text back.
// try/catch stops the app from crashing if storage is blocked.
function saveData(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { }
}
function loadData(key, fallback) {
  try {
    var text = localStorage.getItem(key);
    if (text === null) { return fallback; }   // nothing saved yet
    return JSON.parse(text);
  } catch (e) {
    return fallback;
  }
}
function removeData(key) {
  try { localStorage.removeItem(key); } catch (e) { }
}

// Turns "Spark123!" into scrambled text so we never store the real password.
// (DEMO ONLY. Real websites do this on a server with strong tools like bcrypt.)
function makeHash(text) {
  var h = 5381;
  for (var i = 0; i < text.length; i++) {
    h = (h * 33 + text.charCodeAt(i)) % 4294967296;
  }
  return 'h' + h;
}

// Regular expression check: something@something.xx
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

// Round to 1 decimal place: 3.14159 -> 3.1
function round1(number) {
  return Math.round(number * 10) / 10;
}

// Makes text safe before putting it inside HTML (stops "<script>" attacks).
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}


/* =========================================================================
   2. DATA  (just information, no logic)
   An OBJECT { } stores named values.   An ARRAY [ ] stores a list.
   ========================================================================= */

// ----- 2a. Lessons. Each lesson has a list of slides. -----
// slide types: info | facts | quiz | challenge
var lessons = {
  move: {
    title: 'Feel-good warm-up', emoji: '🧘', xp: 15,
    slides: [
      { type: 'info', emoji: '🧘', title: 'Feel-good warm-up', text: 'Three easy moves wake up your body in under five minutes. Go at a pace that feels comfortable.' },
      { type: 'facts', emoji: '🤸', title: 'Why warm up?', facts: ['<b>Blood flow</b> rises, so muscles feel ready.', '<b>Joints</b> loosen up and move more freely.', '<b>Mood</b> often lifts after even a little movement.'] },
      { type: 'facts', emoji: '🚶', title: 'Your three moves', facts: ['<b>March in place</b> – 10 slow lifts.', '<b>Shoulder rolls</b> – 5 back, 5 forward.', '<b>Long stretch</b> – reach up and breathe out.'] },
      { type: 'quiz', title: 'Quick check', question: 'What pace should a warm-up feel like?', options: ['As fast as possible', 'Slow and comfortable', 'Painful but worth it'], answer: 1, why: 'Warm-ups are gentle. You are preparing, not racing.' },
      { type: 'quiz', title: 'One more', question: 'When is a good time to do this warm-up?', options: ['Only before a workout', 'First thing, or any time you feel stiff', 'Never on busy days'], answer: 1, why: 'Any time you feel stiff, including after sitting for a while.' },
      { type: 'challenge', emoji: '🏁', title: 'Your mini challenge', text: 'Do 10 slow marches, 5 shoulder rolls and one long stretch. Notice how your body feels.' }
    ]
  },
  fuel: {
    title: 'Build a balanced plate', emoji: '🥗', xp: 15,
    slides: [
      { type: 'info', emoji: '🥗', title: 'Build a balanced plate', text: 'There is no perfect plate. Just try adding a few helpful building blocks.' },
      { type: 'facts', emoji: '🌈', title: 'Three building blocks', facts: ['<b>Colour</b> – fruit and veg of any kind.', '<b>Protein</b> – eggs, beans, fish, tofu, chicken.', '<b>Energy</b> – rice, bread, oats, potato.'] },
      { type: 'facts', emoji: '🥪', title: 'Snack idea', facts: ['Pair <b>crunchy</b> (apple) with <b>creamy</b> (nut butter).', 'Add <b>protein</b> (yoghurt, cheese, hummus) to feel full longer.', 'Keep it <b>simple</b>: two foods is a snack.'] },
      { type: 'quiz', title: 'Quick check', question: 'Which is a good protein food?', options: ['Lentils', 'Lemonade', 'Lettuce'], answer: 0, why: 'Lentils, beans, eggs, fish and tofu all bring protein.' },
      { type: 'quiz', title: 'One more', question: 'How many colours should you aim for today?', options: ['Exactly 7', 'As many as feels fun', 'None'], answer: 1, why: 'Variety is the goal, with no strict counting.' },
      { type: 'challenge', emoji: '🏁', title: 'Your mini challenge', text: 'Name one colourful food, one protein food and one energy food you enjoy.' }
    ]
  },
  hydrate: {
    title: 'Hydration hero', emoji: '💧', xp: 10,
    slides: [
      { type: 'info', emoji: '💧', title: 'Hydration hero', text: 'Water supports focus, movement and a comfortable day.' },
      { type: 'facts', emoji: '🚰', title: 'Easy water wins', facts: ['Keep a <b>bottle</b> where you can see it.', 'Drink a glass with <b>every meal</b>.', 'Add <b>lemon, mint or ice</b> for flavour.'] },
      { type: 'facts', emoji: '👀', title: 'Spot the signs', facts: ['<b>Pale yellow</b> pee usually means you are doing well.', '<b>Thirst, headache or tiredness</b> can mean you need a drink.', 'Hot days and exercise mean you need <b>more</b>.'] },
      { type: 'quiz', title: 'Quick check', question: 'Which is a smart habit pairing?', options: ['Water beside your toothbrush', 'Water only when exhausted', 'Skip water at meals'], answer: 0, why: 'Pairing a new habit with an existing one makes it stick.' },
      { type: 'challenge', emoji: '🏁', title: 'Your mini challenge', text: 'Fill a glass or bottle and take five mindful sips.' }
    ]
  },
  rest: {
    title: 'Rest and recharge', emoji: '🌙', xp: 20,
    slides: [
      { type: 'info', emoji: '🌙', title: 'Rest and recharge', text: 'A calm wind-down helps you feel ready for tomorrow.' },
      { type: 'facts', emoji: '😴', title: 'Wind-down ideas', facts: ['Dim lights <b>30 minutes</b> before bed.', 'Put screens <b>aside</b> for a quiet minute.', 'Try <b>3 slow breaths</b>: in for 4, out for 6.'] },
      { type: 'quiz', title: 'Quick check', question: 'What helps your body wind down?', options: ['Bright screens at 1am', 'A calm, dim, quiet routine', 'A big late espresso'], answer: 1, why: 'Calm and dim signals tell your body it is time to sleep.' },
      { type: 'challenge', emoji: '🏁', title: 'Your mini challenge', text: 'Put your screen aside for one quiet minute and take three deep breaths.' }
    ]
  }
};

// ----- 2b. Diet plan -----
// The 5 meal times of the day
var SLOTS = [
  { id: 'b',  emoji: '🌅', name: 'Breakfast',      time: '8:00 AM' },
  { id: 's1', emoji: '🍎', name: 'Morning snack',  time: '11:00 AM' },
  { id: 'l',  emoji: '☀️', name: 'Lunch',          time: '1:00 PM' },
  { id: 's2', emoji: '🥜', name: 'Evening snack',  time: '4:30 PM' },
  { id: 'd',  emoji: '🌙', name: 'Dinner',         time: '8:00 PM' }
];
var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Daily goals used for the progress bars
var TARGETS = {
  adult: { kcal: 1900, protein: 65, carbs: 260, fat: 60 },
  kid:   { kcal: 1500, protein: 35, carbs: 200, fat: 50 }
};

// PLAN[who][dayNumber][mealNumber]  ->  one meal
// If a meal has "nonveg", that is the non-vegetarian replacement.
var PLAN = {
  adult: [
    [  // Mon
      { name:'Veg poha with peanuts + curd', emoji:'🍚', kcal:380, protein:14, carbs:55, fat:12, desc:'1 plate poha, 1 tbsp peanuts, ½ cup curd' },
      { name:'Apple + 10 almonds', emoji:'🍎', kcal:150, protein:4, carbs:22, fat:7, desc:'1 medium apple, 10 almonds' },
      { name:'Roti, dal tadka & sabzi', emoji:'🍛', kcal:620, protein:22, carbs:95, fat:16, desc:'2 rotis, 1 bowl dal tadka, mixed veg sabzi, cucumber salad',
        nonveg:{ name:'Roti, chicken curry & salad', emoji:'🍗', kcal:640, protein:38, carbs:60, fat:22, desc:'2 rotis, 150 g chicken curry, salad' } },
      { name:'Roasted chana + green tea', emoji:'🫘', kcal:150, protein:8, carbs:22, fat:3, desc:'40 g roasted chana, 1 cup green tea' },
      { name:'Vegetable khichdi + curd', emoji:'🥣', kcal:480, protein:17, carbs:75, fat:10, desc:'1½ cups khichdi with veggies, ½ cup curd',
        nonveg:{ name:'Grilled fish, rice & veg', emoji:'🐟', kcal:520, protein:36, carbs:55, fat:15, desc:'150 g grilled fish, ¾ cup rice, sautéed veg' } },
    ],
    [  // Tue
      { name:'Moong dal chilla ×2 + chutney', emoji:'🥞', kcal:360, protein:18, carbs:42, fat:12, desc:'2 chillas, mint chutney' },
      { name:'Banana + peanut butter', emoji:'🍌', kcal:200, protein:5, carbs:30, fat:8, desc:'1 banana, 1 tbsp peanut butter' },
      { name:'Brown rice, rajma & salad', emoji:'🍚', kcal:600, protein:22, carbs:100, fat:10, desc:'1 cup brown rice, 1 bowl rajma, salad',
        nonveg:{ name:'Brown rice, egg curry & salad', emoji:'🥚', kcal:600, protein:26, carbs:80, fat:20, desc:'1 cup brown rice, 2-egg curry, salad' } },
      { name:'Fruit chaat', emoji:'🍇', kcal:120, protein:2, carbs:28, fat:1, desc:'1 bowl seasonal fruit with chaat masala' },
      { name:'Paneer bhurji + 2 rotis + greens', emoji:'🧀', kcal:560, protein:28, carbs:50, fat:26, desc:'100 g paneer bhurji, 2 rotis, sautéed greens',
        nonveg:{ name:'Chicken tikka + 2 rotis + salad', emoji:'🍗', kcal:540, protein:42, carbs:45, fat:18, desc:'150 g chicken tikka, 2 rotis, salad' } },
    ],
    [  // Wed
      { name:'Oats upma + glass of milk', emoji:'🥣', kcal:400, protein:16, carbs:58, fat:11, desc:'1 bowl veg oats upma, 1 glass milk' },
      { name:'Mixed nuts + orange', emoji:'🍊', kcal:200, protein:6, carbs:20, fat:12, desc:'small handful nuts, 1 orange' },
      { name:'Palak paneer, 2 rotis & raita', emoji:'🥬', kcal:640, protein:26, carbs:70, fat:28, desc:'1 bowl palak paneer, 2 rotis, raita',
        nonveg:{ name:'Chicken palak, 2 rotis & raita', emoji:'🍗', kcal:600, protein:40, carbs:62, fat:22, desc:'150 g chicken palak, 2 rotis, raita' } },
      { name:'Sprout salad', emoji:'🌱', kcal:150, protein:10, carbs:24, fat:2, desc:'1 bowl moong sprouts, onion, tomato, lemon' },
      { name:'Veg dalia + dal soup', emoji:'🍲', kcal:430, protein:16, carbs:70, fat:8, desc:'1 bowl dalia with veg, 1 cup dal soup',
        nonveg:{ name:'Egg bhurji, roti & salad', emoji:'🍳', kcal:400, protein:22, carbs:32, fat:18, desc:'2-egg bhurji, 1 roti, salad' } },
    ],
    [  // Thu
      { name:'Idli ×3 + sambar + chutney', emoji:'🍙', kcal:350, protein:12, carbs:62, fat:6, desc:'3 idlis, 1 bowl sambar, coconut chutney' },
      { name:'Guava + almonds', emoji:'🍐', kcal:150, protein:4, carbs:22, fat:7, desc:'1 guava, 8 almonds' },
      { name:'Curd rice with veg + dal', emoji:'🍚', kcal:560, protein:18, carbs:90, fat:12, desc:'1½ cups curd rice, mixed veg, 1 cup dal' },
      { name:'Buttermilk + roasted makhana', emoji:'🥛', kcal:130, protein:5, carbs:20, fat:3, desc:'1 glass chaas, 30 g makhana' },
      { name:'Dal, 2 rotis & bhindi', emoji:'🍛', kcal:560, protein:20, carbs:85, fat:14, desc:'1 bowl dal, 2 rotis, bhindi sabzi',
        nonveg:{ name:'Tandoori fish, roti & salad', emoji:'🐟', kcal:520, protein:38, carbs:50, fat:16, desc:'150 g tandoori fish, 2 rotis, salad' } },
    ],
    [  // Fri
      { name:'Veg sandwich + glass of milk', emoji:'🥪', kcal:400, protein:16, carbs:52, fat:13, desc:'2 whole-wheat slices, veg + cheese, 1 glass milk' },
      { name:'Veg sticks + hummus', emoji:'🥕', kcal:130, protein:5, carbs:16, fat:6, desc:'carrot & cucumber sticks, 3 tbsp hummus' },
      { name:'Veg pulao + chana masala', emoji:'🍛', kcal:620, protein:22, carbs:95, fat:15, desc:'1½ cups pulao, 1 bowl chana masala',
        nonveg:{ name:'Veg pulao + chicken curry', emoji:'🍗', kcal:640, protein:38, carbs:75, fat:18, desc:'1 cup pulao, 150 g chicken curry' } },
      { name:'Curd bowl with berries', emoji:'🫐', kcal:140, protein:10, carbs:16, fat:4, desc:'1 cup thick curd, mixed berries' },
      { name:'Tofu stir-fry + 2 rotis', emoji:'🥦', kcal:520, protein:26, carbs:55, fat:20, desc:'150 g tofu/paneer stir-fry, 2 rotis',
        nonveg:{ name:'Prawn stir-fry + rice', emoji:'🍤', kcal:500, protein:34, carbs:52, fat:15, desc:'150 g prawn stir-fry, ¾ cup rice' } },
    ],
    [  // Sat
      { name:'Stuffed paratha + curd', emoji:'🫓', kcal:420, protein:14, carbs:55, fat:16, desc:'1 aloo/paneer paratha, ½ cup curd' },
      { name:'Papaya / watermelon bowl', emoji:'🍉', kcal:90, protein:2, carbs:22, fat:1, desc:'1 bowl seasonal fruit' },
      { name:'Veg biryani + raita', emoji:'🍛', kcal:640, protein:16, carbs:100, fat:18, desc:'1½ cups veg biryani, raita, salad',
        nonveg:{ name:'Chicken biryani + raita', emoji:'🍗', kcal:660, protein:34, carbs:85, fat:20, desc:'1½ cups chicken biryani, raita' } },
      { name:'Roasted peanuts + tea', emoji:'🥜', kcal:190, protein:8, carbs:6, fat:15, desc:'30 g peanuts, 1 cup tea' },
      { name:'Soup + grilled paneer sandwich', emoji:'🥪', kcal:480, protein:24, carbs:45, fat:22, desc:'1 bowl veg soup, grilled paneer sandwich',
        nonveg:{ name:'Soup + grilled chicken sandwich', emoji:'🥪', kcal:470, protein:34, carbs:44, fat:14, desc:'1 bowl chicken soup, grilled chicken sandwich' } },
    ],
    [  // Sun
      { name:'Masala dosa ×2 + sambar', emoji:'🥞', kcal:400, protein:10, carbs:70, fat:8, desc:'2 dosas, sambar, chutney' },
      { name:'Seasonal fruit + nuts', emoji:'🥭', kcal:170, protein:3, carbs:30, fat:6, desc:'1 bowl fruit, 6 almonds/walnuts' },
      { name:'Thali: roti, dal, paneer & rice', emoji:'🍽️', kcal:680, protein:26, carbs:95, fat:22, desc:'1 roti, dal, paneer sabzi, ½ cup rice, salad',
        nonveg:{ name:'Roti, dal, chicken & rice', emoji:'🍽️', kcal:690, protein:40, carbs:88, fat:20, desc:'1 roti, dal, 120 g chicken curry, ½ cup rice' } },
      { name:'Roasted corn / sprouts', emoji:'🌽', kcal:150, protein:6, carbs:26, fat:2, desc:'1 small corn cob or 1 bowl sprouts' },
      { name:'Moong soup + roti + veg', emoji:'🍲', kcal:380, protein:18, carbs:52, fat:8, desc:'1 bowl moong dal soup, 1 roti, steamed veg' },
    ],
  ],
  kid: [
    [  // Mon
      { name:'Banana oat pancakes + milk', emoji:'🥞', kcal:320, protein:12, carbs:50, fat:8, desc:'2 small pancakes, 1 glass milk' },
      { name:'Apple slices + cheese cube', emoji:'🍎', kcal:110, protein:4, carbs:16, fat:4, desc:'½ apple, 1 cheese cube' },
      { name:'Veggie-paneer roti roll', emoji:'🌯', kcal:420, protein:14, carbs:55, fat:14, desc:'1 roll with paneer & veggies, cucumber',
        nonveg:{ name:'Chicken roti roll', emoji:'🌯', kcal:430, protein:20, carbs:50, fat:14, desc:'1 roll with chicken & veggies, cucumber' } },
      { name:'Fruit yogurt cup', emoji:'🍓', kcal:120, protein:5, carbs:18, fat:3, desc:'1 small cup curd with fruit' },
      { name:'Khichdi with ghee + veggie sticks', emoji:'🥣', kcal:380, protein:12, carbs:58, fat:10, desc:'1 bowl khichdi, 1 tsp ghee, carrot sticks' },
    ],
    [  // Tue
      { name:'Paneer sandwich + milk', emoji:'🥪', kcal:330, protein:14, carbs:38, fat:13, desc:'1 sandwich, 1 small glass milk',
        nonveg:{ name:'Egg sandwich + milk', emoji:'🥪', kcal:320, protein:15, carbs:36, fat:13, desc:'1 egg sandwich, 1 small glass milk' } },
      { name:'Banana', emoji:'🍌', kcal:100, protein:1, carbs:26, fat:0, desc:'1 banana' },
      { name:'Dal-rice + carrot salad', emoji:'🍚', kcal:450, protein:14, carbs:72, fat:10, desc:'1 bowl rice, ½ bowl dal, 1 tsp ghee, carrot salad' },
      { name:'Makhana bowl + milk', emoji:'🥛', kcal:130, protein:4, carbs:18, fat:4, desc:'1 cup roasted makhana, ½ glass milk' },
      { name:'Veggie pasta (hidden veg sauce)', emoji:'🍝', kcal:420, protein:13, carbs:65, fat:10, desc:'1 bowl whole-wheat pasta in tomato-veg sauce' },
    ],
    [  // Wed
      { name:'Poha with peas + milk', emoji:'🍚', kcal:340, protein:10, carbs:52, fat:9, desc:'1 small plate poha, 1 glass milk' },
      { name:'Orange + almonds', emoji:'🍊', kcal:100, protein:3, carbs:15, fat:4, desc:'1 orange, 5 almonds' },
      { name:'Rajma-rice bowl + cucumber', emoji:'🍚', kcal:440, protein:15, carbs:72, fat:8, desc:'1 small bowl rice + rajma, cucumber slices' },
      { name:'Mini idlis + chutney', emoji:'🍙', kcal:110, protein:4, carbs:22, fat:1, desc:'3 mini idlis' },
      { name:'Veg paratha + curd', emoji:'🫓', kcal:400, protein:11, carbs:50, fat:16, desc:'1 veg-stuffed paratha, ½ cup curd' },
    ],
    [  // Thu
      { name:'Ragi porridge with banana', emoji:'🥣', kcal:310, protein:8, carbs:55, fat:6, desc:'1 bowl ragi porridge, ½ banana' },
      { name:'Peanut-jaggery chikki', emoji:'🥜', kcal:110, protein:3, carbs:14, fat:5, desc:'1 small piece' },
      { name:'Veg fried rice with paneer', emoji:'🍚', kcal:440, protein:14, carbs:62, fat:15, desc:'1 bowl fried rice with veggies & paneer',
        nonveg:{ name:'Veg fried rice with egg', emoji:'🍚', kcal:440, protein:14, carbs:60, fat:15, desc:'1 bowl fried rice with veggies & egg' } },
      { name:'Veggie sticks + hummus', emoji:'🥕', kcal:100, protein:3, carbs:12, fat:5, desc:'carrot & cucumber sticks, 2 tbsp hummus' },
      { name:'Dal soup, roti & sabzi', emoji:'🍲', kcal:400, protein:15, carbs:55, fat:10, desc:'1 bowl dal soup, 1 roti, sabzi' },
    ],
    [  // Fri
      { name:'Idli ×3 + sambar', emoji:'🍙', kcal:300, protein:10, carbs:55, fat:4, desc:'3 idlis, small bowl sambar' },
      { name:'Grapes / strawberries cup', emoji:'🍇', kcal:80, protein:1, carbs:19, fat:0, desc:'1 cup fruit' },
      { name:'Veg pulao + raita', emoji:'🍛', kcal:430, protein:12, carbs:68, fat:10, desc:'1 bowl veg pulao, raita' },
      { name:'Cheese-corn toast', emoji:'🧀', kcal:150, protein:6, carbs:18, fat:6, desc:'1 slice toast with cheese & corn' },
      { name:'Roti-base veggie pizza', emoji:'🍕', kcal:420, protein:16, carbs:48, fat:16, desc:'1 roti pizza, paneer & veggies',
        nonveg:{ name:'Roti-base chicken pizza', emoji:'🍕', kcal:430, protein:20, carbs:46, fat:15, desc:'1 roti pizza, chicken & veggies' } },
    ],
    [  // Sat
      { name:'Besan chilla ×2 + chutney', emoji:'🥞', kcal:300, protein:12, carbs:34, fat:13, desc:'2 small chillas, mint chutney' },
      { name:'Banana milkshake', emoji:'🥤', kcal:160, protein:6, carbs:28, fat:3, desc:'1 glass, no added sugar' },
      { name:'Homemade veg burger + salad', emoji:'🍔', kcal:440, protein:12, carbs:62, fat:15, desc:'aloo-veg tikki in whole-wheat bun, salad' },
      { name:'Popcorn + fruit', emoji:'🍿', kcal:100, protein:2, carbs:18, fat:2, desc:'1 cup plain popcorn, a few fruit pieces' },
      { name:'Palak dal + rice', emoji:'🥬', kcal:420, protein:15, carbs:65, fat:9, desc:'1 bowl rice, palak dal' },
    ],
    [  // Sun
      { name:'Small masala dosa', emoji:'🥞', kcal:330, protein:8, carbs:55, fat:8, desc:'1 dosa, sambar' },
      { name:'Mango slices', emoji:'🥭', kcal:100, protein:1, carbs:24, fat:1, desc:'1 small bowl' },
      { name:'Paneer wrap + fruit', emoji:'🌯', kcal:450, protein:16, carbs:56, fat:16, desc:'1 wrap with paneer & veggies, ½ apple',
        nonveg:{ name:'Egg wrap + fruit', emoji:'🌯', kcal:440, protein:18, carbs:54, fat:16, desc:'1 egg wrap, ½ apple' } },
      { name:'Fruit custard', emoji:'🍮', kcal:150, protein:4, carbs:24, fat:4, desc:'1 small bowl' },
      { name:'Veg dalia / khichdi', emoji:'🥣', kcal:400, protein:13, carbs:60, fat:9, desc:'1 bowl with veggies & ghee' },
    ],
  ]
};

// ----- 2c. Food list for the scanner. Numbers are per 100 grams. -----
var FOODS = {
  apple: { name:'Apple', emoji:'🍎', kcal:52, protein:0.3, carbs:14, fat:0.2, fibre:2.4, grams:150, portion:'1 medium', health:5 },
  banana: { name:'Banana', emoji:'🍌', kcal:89, protein:1.1, carbs:23, fat:0.3, fibre:2.6, grams:120, portion:'1 medium', health:4 },
  orange: { name:'Orange', emoji:'🍊', kcal:47, protein:0.9, carbs:12, fat:0.1, fibre:2.4, grams:130, portion:'1 medium', health:5 },
  mango: { name:'Mango', emoji:'🥭', kcal:60, protein:0.8, carbs:15, fat:0.4, fibre:1.6, grams:165, portion:'1 cup', health:4 },
  grapes: { name:'Grapes', emoji:'🍇', kcal:69, protein:0.7, carbs:18, fat:0.2, fibre:0.9, grams:100, portion:'1 cup', health:4 },
  strawberry: { name:'Strawberries', emoji:'🍓', kcal:32, protein:0.7, carbs:8, fat:0.3, fibre:2, grams:150, portion:'1 cup', health:5 },
  watermelon: { name:'Watermelon', emoji:'🍉', kcal:30, protein:0.6, carbs:8, fat:0.2, fibre:0.4, grams:200, portion:'1 bowl', health:5 },
  pineapple: { name:'Pineapple', emoji:'🍍', kcal:50, protein:0.5, carbs:13, fat:0.1, fibre:1.4, grams:165, portion:'1 cup', health:4 },
  pomegranate: { name:'Pomegranate', emoji:'🍎', kcal:83, protein:1.7, carbs:19, fat:1.2, fibre:4, grams:100, portion:'½ cup seeds', health:5 },
  rice: { name:'Cooked rice', emoji:'🍚', kcal:130, protein:2.7, carbs:28, fat:0.3, fibre:0.4, grams:180, portion:'1 bowl', health:3 },
  roti: { name:'Roti / chapati', emoji:'🫓', kcal:297, protein:9, carbs:46, fat:7, fibre:5, grams:40, portion:'1 roti', health:4 },
  bread: { name:'Bread', emoji:'🍞', kcal:265, protein:9, carbs:49, fat:3.2, fibre:2.7, grams:50, portion:'2 slices', health:3 },
  pasta: { name:'Pasta (cooked)', emoji:'🍝', kcal:158, protein:5.8, carbs:31, fat:0.9, fibre:1.8, grams:200, portion:'1 plate', health:3 },
  oats: { name:'Oatmeal', emoji:'🥣', kcal:71, protein:2.5, carbs:12, fat:1.5, fibre:1.7, grams:250, portion:'1 bowl', health:5 },
  poha: { name:'Poha', emoji:'🍚', kcal:130, protein:2.7, carbs:25, fat:2.5, fibre:1.5, grams:200, portion:'1 plate', health:4 },
  idli: { name:'Idli', emoji:'🍙', kcal:130, protein:4, carbs:26, fat:0.4, fibre:1, grams:40, portion:'1 idli', health:4 },
  dosa: { name:'Dosa', emoji:'🥞', kcal:168, protein:3.9, carbs:29, fat:3.7, fibre:1.5, grams:100, portion:'1 dosa', health:3 },
  paratha: { name:'Paratha', emoji:'🫓', kcal:326, protein:7, carbs:45, fat:13, fibre:3, grams:80, portion:'1 paratha', health:2 },
  dal: { name:'Dal', emoji:'🍲', kcal:116, protein:9, carbs:20, fat:0.4, fibre:8, grams:200, portion:'1 bowl', health:5 },
  rajma: { name:'Rajma', emoji:'🫘', kcal:127, protein:8.7, carbs:23, fat:0.5, fibre:6.4, grams:180, portion:'1 bowl', health:5 },
  chana: { name:'Chana masala', emoji:'🫘', kcal:160, protein:7, carbs:22, fat:5, fibre:6, grams:180, portion:'1 bowl', health:4 },
  paneer: { name:'Paneer', emoji:'🧀', kcal:265, protein:18, carbs:1.2, fat:20, fibre:0, grams:80, portion:'80 g', health:3 },
  curd: { name:'Curd / yogurt', emoji:'🥛', kcal:61, protein:3.5, carbs:4.7, fat:3.3, fibre:0, grams:150, portion:'¾ cup', health:4 },
  milk: { name:'Milk', emoji:'🥛', kcal:61, protein:3.2, carbs:4.8, fat:3.3, fibre:0, grams:240, portion:'1 glass', health:4 },
  egg: { name:'Boiled egg', emoji:'🥚', kcal:155, protein:13, carbs:1.1, fat:11, fibre:0, grams:50, portion:'1 egg', health:4 },
  omelette: { name:'Omelette', emoji:'🍳', kcal:154, protein:11, carbs:0.6, fat:12, fibre:0, grams:90, portion:'2-egg', health:3 },
  chickencurry: { name:'Chicken curry', emoji:'🍗', kcal:150, protein:15, carbs:4, fat:8, fibre:0.5, grams:200, portion:'1 bowl', health:3 },
  grilledchicken: { name:'Grilled chicken', emoji:'🍗', kcal:165, protein:31, carbs:0, fat:3.6, fibre:0, grams:120, portion:'1 breast', health:5 },
  fish: { name:'Grilled fish', emoji:'🐟', kcal:150, protein:26, carbs:0, fat:5, fibre:0, grams:120, portion:'1 fillet', health:5 },
  pizza: { name:'Pizza', emoji:'🍕', kcal:266, protein:11, carbs:33, fat:10, fibre:2.3, grams:110, portion:'1 slice', health:2 },
  burger: { name:'Burger', emoji:'🍔', kcal:295, protein:17, carbs:24, fat:14, fibre:1.3, grams:200, portion:'1 burger', health:2 },
  hotdog: { name:'Hot dog', emoji:'🌭', kcal:290, protein:10, carbs:18, fat:18, fibre:0.8, grams:100, portion:'1 hot dog', health:1 },
  fries: { name:'French fries', emoji:'🍟', kcal:312, protein:3.4, carbs:41, fat:15, fibre:3.8, grams:110, portion:'1 medium', health:1 },
  samosa: { name:'Samosa', emoji:'🥟', kcal:262, protein:4.7, carbs:28, fat:15, fibre:2.5, grams:60, portion:'1 samosa', health:1 },
  biryani: { name:'Biryani', emoji:'🍛', kcal:170, protein:7, carbs:24, fat:5, fibre:1, grams:250, portion:'1 plate', health:3 },
  salad: { name:'Green salad', emoji:'🥗', kcal:20, protein:1.2, carbs:4, fat:0.2, fibre:1.8, grams:150, portion:'1 bowl', health:5 },
  broccoli: { name:'Broccoli', emoji:'🥦', kcal:34, protein:2.8, carbs:7, fat:0.4, fibre:2.6, grams:100, portion:'1 cup', health:5 },
  cauliflower: { name:'Cauliflower', emoji:'🥦', kcal:25, protein:1.9, carbs:5, fat:0.3, fibre:2, grams:100, portion:'1 cup', health:5 },
  carrot: { name:'Carrot', emoji:'🥕', kcal:41, protein:0.9, carbs:10, fat:0.2, fibre:2.8, grams:80, portion:'1 medium', health:5 },
  cucumber: { name:'Cucumber', emoji:'🥒', kcal:15, protein:0.7, carbs:3.6, fat:0.1, fibre:0.5, grams:100, portion:'½ cucumber', health:5 },
  tomato: { name:'Tomato', emoji:'🍅', kcal:18, protein:0.9, carbs:3.9, fat:0.2, fibre:1.2, grams:120, portion:'1 medium', health:5 },
  potato: { name:'Potato (boiled)', emoji:'🥔', kcal:87, protein:1.9, carbs:20, fat:0.1, fibre:1.8, grams:170, portion:'1 medium', health:3 },
  sabzi: { name:'Mixed veg sabzi', emoji:'🥘', kcal:80, protein:2.5, carbs:9, fat:4, fibre:2.5, grams:150, portion:'1 bowl', health:4 },
  corn: { name:'Corn', emoji:'🌽', kcal:96, protein:3.4, carbs:21, fat:1.5, fibre:2.4, grams:100, portion:'1 small cob', health:4 },
  mushroom: { name:'Mushrooms', emoji:'🍄', kcal:22, protein:3.1, carbs:3.3, fat:0.3, fibre:1, grams:100, portion:'1 cup', health:5 },
  avocado: { name:'Avocado / guacamole', emoji:'🥑', kcal:160, protein:2, carbs:9, fat:15, fibre:6.7, grams:100, portion:'½ avocado', health:4 },
  soup: { name:'Soup', emoji:'🍲', kcal:35, protein:2, carbs:5, fat:1, fibre:0.8, grams:250, portion:'1 bowl', health:4 },
  nuts: { name:'Mixed nuts', emoji:'🥜', kcal:607, protein:20, carbs:21, fat:54, fibre:7, grams:30, portion:'small handful', health:4 },
  peanuts: { name:'Peanuts', emoji:'🥜', kcal:567, protein:26, carbs:16, fat:49, fibre:8.5, grams:30, portion:'30 g', health:4 },
  icecream: { name:'Ice cream', emoji:'🍦', kcal:207, protein:3.5, carbs:24, fat:11, fibre:0.7, grams:100, portion:'1 scoop ×2', health:1 },
  chocolate: { name:'Chocolate', emoji:'🍫', kcal:546, protein:5, carbs:60, fat:31, fibre:7, grams:30, portion:'30 g', health:1 },
  cake: { name:'Cake', emoji:'🍰', kcal:350, protein:5, carbs:50, fat:15, fibre:1, grams:90, portion:'1 slice', health:1 },
  cookie: { name:'Cookies', emoji:'🍪', kcal:480, protein:5, carbs:64, fat:24, fibre:2, grams:40, portion:'2 cookies', health:1 },
  juice: { name:'Fruit juice', emoji:'🧃', kcal:45, protein:0.5, carbs:10, fat:0.1, fibre:0.2, grams:250, portion:'1 glass', health:2 },
  tea: { name:'Tea with milk', emoji:'☕', kcal:40, protein:1, carbs:6, fat:1.5, fibre:0, grams:150, portion:'1 cup', health:3 },
  coffee: { name:'Coffee', emoji:'☕', kcal:20, protein:0.5, carbs:3, fat:0.6, fibre:0, grams:150, portion:'1 cup', health:3 },
  sandwich: { name:'Sandwich', emoji:'🥪', kcal:250, protein:10, carbs:30, fat:9, fibre:2.5, grams:150, portion:'1 sandwich', health:3 },
  pancake: { name:'Pancakes', emoji:'🥞', kcal:227, protein:6, carbs:28, fat:10, fibre:1, grams:100, portion:'2 pancakes', health:2 },
  wrap: { name:'Wrap / burrito', emoji:'🌯', kcal:210, protein:9, carbs:28, fat:7, fibre:2.5, grams:200, portion:'1 wrap', health:3 },
  chips: { name:'Chips / crisps', emoji:'🥔', kcal:536, protein:7, carbs:53, fat:35, fibre:4.4, grams:30, portion:'small packet', health:1 },
  cola: { name:'Soft drink', emoji:'🥤', kcal:42, protein:0, carbs:10.6, fat:0, fibre:0, grams:330, portion:'1 can', health:1 },
  popcorn: { name:'Popcorn', emoji:'🍿', kcal:387, protein:13, carbs:78, fat:4.5, fibre:15, grams:30, portion:'1 cup', health:3 },
  lemon: { name:'Lemon', emoji:'🍋', kcal:29, protein:1.1, carbs:9, fat:0.3, fibre:2.8, grams:60, portion:'1 lemon', health:5 }
};


/* =========================================================================
   3. APP STATE  (variables that REMEMBER things while the page is open)
   ========================================================================= */

var state = {
  xp: 120,
  coins: 35,
  doneLessons: [],                       // e.g. ['move', 'fuel']
  quests: { move: false, meal: false }   // daily quests
};

var currentUser = null;      // who is logged in: { name, email, goal, audience, guest }
var audience = 'adult';      // 'adult' or 'kid'
var currentLesson = null;    // which lesson is open: 'move', 'fuel', ...
var slideNumber = 0;         // which slide of that lesson (0 = first)

var dietType = 'veg';        // 'veg' or 'nv'
var currentDay = (new Date().getDay() + 6) % 7;   // JS: Sunday=0. This makes Monday=0.
var dayLog = { eaten: {}, extra: [] };            // what the user ate today

// Food scanner memory
var scanItems = [];          // foods currently in the result list
var scanSummary = '';
var scanTips = [];
var scanNote = '';
var scanHealth = null;       // 1-5 stars from the AI (optional)


/* =========================================================================
   4. SCREENS + REFRESHING THE NUMBERS
   ========================================================================= */

// Show one view (page) and hide the others.
function showView(name) {
  document.body.dataset.view = name;     // CSS uses this to hide the hero on some pages

  var views = $all('.view');
  for (var i = 0; i < views.length; i++) {
    // add "active" only to the view whose id equals name
    views[i].classList.toggle('active', views[i].id === name);
  }
  var buttons = $all('nav button');
  for (var j = 0; j < buttons.length; j++) {
    buttons[j].classList.toggle('active', buttons[j].dataset.view === name);
  }
  $(name).scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function isLocked(lessonKey) {
  // "rest" unlocks after 2 lessons are finished
  return lessonKey === 'rest' && state.doneLessons.length < 2;
}

// THE REFRESH FUNCTION: reads `state` and rewrites everything that depends on it.
// We call it after every change.
function updateScreen() {
  // --- top bar numbers ---
  $('xpTotal').textContent = state.xp;
  $('coins').textContent = state.coins;

  // --- daily quests (water is always done, so we start from 1) ---
  var questCount = 1;
  if (state.quests.move) { questCount = questCount + 1; }
  if (state.quests.meal) { questCount = questCount + 1; }
  $('ringText').textContent = questCount + '/3';

  if (questCount === 3) { $('dailyStatus').textContent = 'Daily goal complete!'; }
  else if (questCount === 2) { $('dailyStatus').textContent = 'Nearly there!'; }
  else { $('dailyStatus').textContent = 'One quest complete!'; }

  // the little ring is a circle painted with degrees (360 = full circle)
  var degrees = questCount / 3 * 360;
  document.querySelector('.ring').style.background =
    'conic-gradient(var(--green) 0 ' + degrees + 'deg, #e6f4db ' + degrees + 'deg)';

  // tick marks in the "Today's spark" card
  setMiniQuest('miniMove', state.quests.move);
  setMiniQuest('miniMeal', state.quests.meal);

  // "Do it" buttons in the Daily quests panel
  var questButtons = $all('.quest-action');
  for (var i = 0; i < questButtons.length; i++) {
    var done = state.quests[questButtons[i].dataset.quest];
    questButtons[i].textContent = done ? 'Done ✓' : 'Do it';
    questButtons[i].classList.toggle('done', done);
  }

  // --- the 4 lesson cards ---
  var cards = $all('.lesson');
  for (var k = 0; k < cards.length; k++) {
    var key = cards[k].dataset.lesson;
    var finished = state.doneLessons.includes(key);
    var button = cards[k].querySelector('.lesson-button');

    cards[k].classList.toggle('completed', finished);
    cards[k].classList.toggle('locked', isLocked(key));

    if (finished) { button.textContent = 'Completed ✓'; }
    else if (isLocked(key)) { button.textContent = 'Locked'; }
    else { button.textContent = 'Start'; }
  }

  updateProgressPage();
}

function setMiniQuest(id, done) {
  var box = $(id);
  box.classList.toggle('done', done);
  box.querySelector('.check').textContent = done ? '✓' : '○';
}

// The Progress page: ring + badges
function updateProgressPage() {
  var count = state.doneLessons.length;
  var percent = Math.round(count / 4 * 100);

  $('completeCount').textContent = count;
  $('bigRing').style.setProperty('--progress', percent);   // CSS reads this number

  if (count === 4) {
    $('progressTitle').textContent = 'You completed the path!';
    $('progressText').textContent = 'Wonderful consistency. Your Sparklet path is glowing.';
  } else if (count === 0) {
    $('progressTitle').textContent = "Let's get started!";
    $('progressText').textContent = 'Complete a lesson to light up the path.';
  } else {
    $('progressTitle').textContent = "You're off to a bright start!";
    $('progressText').textContent = 'Complete ' + (4 - count) + ' more to light up the path.';
  }

  // badge unlocks: true/false decides if the class "unlocked" is on
  $('badge1').classList.toggle('unlocked', count >= 1);
  $('badge2').classList.toggle('unlocked', count >= 2);
  $('badge3').classList.toggle('unlocked', state.doneLessons.includes('fuel'));
  $('badge4').classList.toggle('unlocked', count === 4);
}

// Complete a daily quest button
function completeQuest(name) {
  if (state.quests[name]) {
    showToast('This quest is already complete.');
    return;
  }
  state.quests[name] = true;
  state.xp = state.xp + 8;
  state.coins = state.coins + 2;
  showToast('Quest complete! +8 XP and 2 coins.');
  updateScreen();
}

function resetDemo() {
  state.xp = 120;
  state.coins = 35;
  state.doneLessons = [];
  state.quests.move = false;
  state.quests.meal = false;
  updateScreen();
  showToast('Demo progress reset. Ready for a fresh spark!');
}


/* =========================================================================
   5. LESSONS POP-UP (slides + quiz)
   ========================================================================= */

function currentSlide() {
  return lessons[currentLesson].slides[slideNumber];
}

function openLesson(key) {
  if (isLocked(key)) {
    showToast('Complete two lessons to unlock Rest and recharge.');
    return;
  }
  currentLesson = key;
  slideNumber = 0;

  // forget old quiz answers so the lesson starts fresh
  var slides = lessons[key].slides;
  for (var i = 0; i < slides.length; i++) {
    slides[i].answered = false;
  }

  showSlide();
  $('lessonModal').classList.add('show');
}

function closeLesson() {
  $('lessonModal').classList.remove('show');
}

// Draws the current slide inside the pop-up.
function showSlide() {
  var lesson = lessons[currentLesson];
  var slide = currentSlide();
  var total = lesson.slides.length;

  // progress bar at the top = (slide number / total) as a percentage
  $('slideBar').style.width = Math.round((slideNumber + 1) / total * 100) + '%';

  var html = '<div class="count">' + (slideNumber + 1) + ' of ' + total + '</div>';

  if (slide.type === 'info') {
    html += '<div class="lesson-orb">' + slide.emoji + '</div>';
    html += '<h2>' + slide.title + '</h2><p>' + slide.text + '</p>';

  } else if (slide.type === 'facts') {
    html += '<div class="lesson-orb">' + slide.emoji + '</div><h2>' + slide.title + '</h2>';
    html += '<ul class="facts">';
    for (var i = 0; i < slide.facts.length; i++) {
      html += '<li><span>✦</span><span>' + slide.facts[i] + '</span></li>';
    }
    html += '</ul>';

  } else if (slide.type === 'challenge') {
    html += '<div class="lesson-orb">' + slide.emoji + '</div>';
    html += '<h2>' + slide.title + '</h2><p>' + slide.text + '</p>';
    html += '<div class="challenge"><b>Tip</b><span>Go at your own pace. Small counts!</span></div>';

  } else {   // quiz
    html += '<h2>' + slide.question + '</h2><div class="quiz-opts">';
    for (var n = 0; n < slide.options.length; n++) {
      html += '<button data-n="' + n + '">' + slide.options[n] + '</button>';
    }
    html += '</div><div class="quiz-fb" id="quizFeedback"></div>';
  }

  $('slideBody').innerHTML = html;   // put the finished HTML on the page

  if (slide.type === 'quiz') {
    // the buttons only exist NOW, so we attach their click handlers now
    var optionButtons = $all('.quiz-opts button');
    for (var b = 0; b < optionButtons.length; b++) {
      optionButtons[b].addEventListener('click', checkAnswer);
    }
    if (slide.answered) { showRightAnswer(slide); }   // user came back to a solved quiz
  }

  updateModalButtons();
}

// Runs when a quiz option is clicked. "event" tells us which one.
function checkAnswer(event) {
  var slide = currentSlide();
  var chosen = Number(event.target.dataset.n);     // data-n="1" -> 1
  var feedback = $('quizFeedback');

  if (chosen === slide.answer) {
    slide.answered = true;
    showRightAnswer(slide);
    updateModalButtons();                // "Next" becomes clickable
  } else {
    event.target.classList.add('wrong');
    event.target.disabled = true;
    feedback.className = 'quiz-fb no';
    feedback.textContent = 'Not quite. Try another!';
  }
}

function showRightAnswer(slide) {
  var optionButtons = $all('.quiz-opts button');
  for (var i = 0; i < optionButtons.length; i++) {
    optionButtons[i].disabled = true;
  }
  optionButtons[slide.answer].classList.add('right');
  var feedback = $('quizFeedback');
  feedback.className = 'quiz-fb ok';
  feedback.textContent = '✓ ' + slide.why;
}

// Back / Next button text and enabled state
function updateModalButtons() {
  var slide = currentSlide();
  var isLast = slideNumber === lessons[currentLesson].slides.length - 1;
  var canGoNext = slide.type !== 'quiz' || slide.answered;   // quiz must be solved first

  $('slideBack').classList.toggle('invisible', slideNumber === 0);

  var nextButton = $('slideNext');
  if (isLast) {
    nextButton.textContent = state.doneLessons.includes(currentLesson) ? 'Completed ✓' : 'Mark complete';
  } else {
    nextButton.textContent = 'Next';
  }
  nextButton.disabled = !canGoNext;
}

function nextSlide() {
  var slide = currentSlide();
  if (slide.type === 'quiz' && !slide.answered) { return; }

  if (slideNumber < lessons[currentLesson].slides.length - 1) {
    slideNumber = slideNumber + 1;
    showSlide();
  } else {
    finishLesson();       // we were on the last slide
  }
}

function previousSlide() {
  if (slideNumber > 0) {
    slideNumber = slideNumber - 1;
    showSlide();
  }
}

// Give the reward (only the FIRST time).
function finishLesson() {
  var lesson = lessons[currentLesson];

  if (!state.doneLessons.includes(currentLesson)) {
    state.doneLessons.push(currentLesson);
    state.xp = state.xp + lesson.xp;
    state.coins = state.coins + 5;
    if (currentLesson === 'move') { state.quests.move = true; }
    if (currentLesson === 'fuel') { state.quests.meal = true; }
    showToast('Sparkle! You earned ' + lesson.xp + ' XP and 5 coins.');
  } else {
    showToast('That lesson is already complete. Nice work!');
  }
  closeLesson();
  updateScreen();
}


/* =========================================================================
   6. LOGIN  (sign in, sign up, guest, log out)
   There is NO server. Accounts are saved in this browser's localStorage.
   ========================================================================= */

function getUsers() {
  return loadData('sparklet_users', {});       // { 'email': { name, passwordHash, goal, audience } }
}

// Create the demo account the first time the app runs.
function createDemoUser() {
  var users = getUsers();
  if (!users['demo@sparklet.app']) {
    users['demo@sparklet.app'] = {
      name: 'Demo',
      passwordHash: makeHash('demo@sparklet.app:Spark123!'),
      goal: 10,
      audience: 'adult'
    };
    saveData('sparklet_users', users);
  }
}

// ----- messages -----
// Show or clear the red error text under ONE input.
function showError(inputId, message) {
  var errorBox = $(inputId + 'Err');            // e.g. 'inEmail' + 'Err' = 'inEmailErr'
  if (errorBox) { errorBox.textContent = message; }
  var field = $(inputId).closest('.field');     // nearest parent with class "field"
  if (field) { field.classList.toggle('bad', message !== ''); }
}

// Show a message box at the top of the form. type = 'error' or 'ok'. No message = hide it.
function showAlert(type, message) {
  var box = $('formAlert');
  if (message) {
    box.className = 'form-alert show ' + type;
    box.textContent = message;
  } else {
    box.className = 'form-alert';
    box.textContent = '';
  }
}

// ----- switching between Sign in and Create account -----
function showAuthMode(mode) {
  var isSignUp = mode === 'up';
  $('tabSignIn').classList.toggle('on', !isSignUp);
  $('tabSignUp').classList.toggle('on', isSignUp);
  $('signInForm').classList.toggle('hidden', isSignUp);
  $('signUpForm').classList.toggle('hidden', !isSignUp);
  $('authTitle').textContent = isSignUp ? 'Join Sparklet' : 'Welcome back!';
  $('authSub').textContent = isSignUp ? 'Create a free account and start your first streak.' : 'Sign in to keep your streak glowing.';
  showAlert('', '');
}

// ----- password strength -----
function checkPassword(password) {
  var rules = {
    length: password.length >= 8,
    upperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password)
  };
  var score = 0;
  if (password !== '') {
    for (var name in rules) {          // loop over every rule
      if (rules[name]) { score = score + 1; }
    }
  }
  return { rules: rules, score: score };
}

function updatePasswordMeter() {
  var result = checkPassword($('upPass').value);
  $('meter').dataset.score = result.score;      // CSS colours the bars from this number
  $('ruleLength').classList.toggle('ok', result.rules.length);
  $('ruleCase').classList.toggle('ok', result.rules.upperLower);
  $('ruleNumber').classList.toggle('ok', result.rules.number);
  $('ruleSymbol').classList.toggle('ok', result.rules.symbol);
  showError('upPass', '');
}

// Show / Hide password button
function togglePassword(event) {
  var button = event.target;
  var input = $(button.dataset.target);
  if (input.type === 'password') {
    input.type = 'text';
    button.textContent = 'Hide';
  } else {
    input.type = 'password';
    button.textContent = 'Show';
  }
}

// ----- SIGN IN -----
function handleSignIn(event) {
  event.preventDefault();               // stop the browser from reloading the page
  showAlert('', '');

  var email = $('inEmail').value.trim().toLowerCase();
  var password = $('inPass').value;
  var hasError = false;

  // 1) check the inputs
  if (email === '') { showError('inEmail', 'Enter your email address.'); hasError = true; }
  else if (!isValidEmail(email)) { showError('inEmail', "That email doesn't look right."); hasError = true; }
  else { showError('inEmail', ''); }

  if (password === '') { showError('inPass', 'Enter your password.'); hasError = true; }
  else { showError('inPass', ''); }

  if (hasError) { return; }

  // 2) look for the user and compare the scrambled passwords
  var user = getUsers()[email];
  if (!user || user.passwordHash !== makeHash(email + ':' + password)) {
    showAlert('error', "That email and password don't match. Please try again.");
    return;
  }

  startSession({ name: user.name, email: email, goal: user.goal, audience: user.audience });
}

// ----- SIGN UP -----
function handleSignUp(event) {
  event.preventDefault();
  showAlert('', '');

  var name = $('upName').value.trim();
  var email = $('upEmail').value.trim().toLowerCase();
  var password = $('upPass').value;
  var hasError = false;

  if (name === '') { showError('upName', 'Tell us what to call you.'); hasError = true; }
  else { showError('upName', ''); }

  if (email === '') { showError('upEmail', 'Enter your email address.'); hasError = true; }
  else if (!isValidEmail(email)) { showError('upEmail', "That email doesn't look right."); hasError = true; }
  else { showError('upEmail', ''); }

  var strength = checkPassword(password);
  if (password === '') { showError('upPass', 'Create a password.'); hasError = true; }
  else if (!strength.rules.length || strength.score < 3) {
    showError('upPass', 'Make it stronger: 8+ characters plus at least two of case, number or symbol.');
    hasError = true;
  } else { showError('upPass', ''); }

  if (!$('terms').checked) { $('termsErr').textContent = 'Please accept the terms to continue.'; hasError = true; }
  else { $('termsErr').textContent = ''; }

  if (hasError) { return; }

  var users = getUsers();
  if (users[email]) {
    showError('upEmail', 'An account with this email already exists. Try signing in.');
    return;
  }

  // read which radio button is ticked
  var goal = Number(document.querySelector('input[name=goal]:checked').value);
  var chosenAudience = document.querySelector('input[name=audience]:checked').value;

  users[email] = { name: name, passwordHash: makeHash(email + ':' + password), goal: goal, audience: chosenAudience };
  saveData('sparklet_users', users);

  startSession({ name: name, email: email, goal: goal, audience: chosenAudience });
}

function startSession(user) {
  saveData('sparklet_session', user);    // so a refresh keeps us logged in
  showApp(user);
}

// Hide the login screen and set up the app for this user.
function showApp(user) {
  currentUser = user;
  $('authScreen').classList.add('hidden');
  document.body.classList.add('logged-in');

  var name = user.name || 'friend';
  $('avatar').textContent = name[0].toUpperCase();          // first letter
  $('welcomeText').textContent = user.guest ? 'Welcome, guest' : 'Welcome back, ' + name;

  if (user.goal) {
    $('miniMoveText').textContent = '🏃 Move for ' + user.goal + ' minutes';
  }
  if (user.audience) {
    audience = user.audience;
    saveData('sparklet_aud', audience);
  }

  loadDayLog();
  applyMode();
  showToast(user.guest ? 'Browsing as a guest.' : 'Hi ' + name + '! Ready for today\'s quest?');
}

function logout() {
  removeData('sparklet_session');
  currentUser = null;
  document.body.classList.remove('logged-in');
  $('authScreen').classList.remove('hidden');
  showAuthMode('in');
  $('signInForm').reset();
}


/* =========================================================================
   7. KID / ADULT MODE
   Same app, different words and numbers.
   ========================================================================= */

function applyMode() {
  var isKid = audience === 'kid';
  document.body.classList.toggle('kid', isKid);

  $('modeBtn').textContent = isKid ? '🧒 Kid mode' : '🧑 Adult mode';
  $('heroTitle').textContent = isKid ? 'Small healthy choices, big bright energy!' : 'Build healthier habits, one day at a time.';
  $('heroText').textContent = isKid
    ? 'Complete a quick activity today and keep your Sparklet streak glowing.'
    : 'Short lessons, a daily meal plan and a food scanner to keep you on track.';
  $('dietTitle').textContent = isKid ? 'My yummy week' : 'Daily diet plan';
  $('dietSub').textContent = isKid
    ? 'Five tasty meals a day to help you grow strong. Tap "I ate this" when you are done!'
    : 'Five balanced meals a day with estimated calories and macros. Sample for an average adult, around 1,900 kcal.';

  updateScreen();
  renderDiet();
  renderScanResult();
}

function toggleMode() {
  audience = (audience === 'kid') ? 'adult' : 'kid';
  saveData('sparklet_aud', audience);
  applyMode();
  showToast(audience === 'kid' ? 'Kid mode on: friendly words!' : 'Adult mode on: full nutrition numbers.');
}


/* =========================================================================
   8. DIET PLAN
   ========================================================================= */

// ----- the daily log (saved per person, per date) -----
function dayLogKey() {
  var d = new Date();
  var who = currentUser ? (currentUser.email || currentUser.name) : 'guest';
  return 'sparklet_day_' + who + '_' + d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}
function loadDayLog() {
  dayLog = loadData(dayLogKey(), { eaten: {}, extra: [] });
}
function saveDayLog() {
  saveData(dayLogKey(), dayLog);
}

// ----- picking the right meal -----
function getMeal(day, slot) {
  var meal = PLAN[audience][day][slot];
  if (dietType === 'nv' && meal.nonveg) {
    return meal.nonveg;                       // non-veg replacement
  }
  return meal;
}
function getMealId(day, slot) {
  var usesNonveg = dietType === 'nv' && PLAN[audience][day][slot].nonveg;
  return audience + '-' + day + '-' + SLOTS[slot].id + '-' + (usesNonveg ? 'nv' : 'v');
}

// kid mode shows words instead of calories
function energyWord(kcal) {
  if (kcal < 150) { return 'small'; }
  if (kcal < 350) { return 'medium'; }
  return 'big';
}

// the coloured nutrition chips
function makeChips(meal) {
  if (audience === 'kid') {
    return '<span class="chip k">⚡ ' + energyWord(meal.kcal) + ' energy</span>' +
           '<span class="chip p">💪 ' + meal.protein + ' g protein</span>';
  }
  return '<span class="chip k">' + meal.kcal + ' kcal</span>' +
         '<span class="chip p">P ' + meal.protein + ' g</span>' +
         '<span class="chip c">C ' + meal.carbs + ' g</span>' +
         '<span class="chip f">F ' + meal.fat + ' g</span>';
}

// Draw the whole diet page.
function renderDiet() {
  // Veg / Non-veg buttons
  $('vegBtn').classList.toggle('on', dietType === 'veg');
  $('nvBtn').classList.toggle('on', dietType === 'nv');

  // --- day tabs: Mon Tue Wed ... ---
  var todayNumber = (new Date().getDay() + 6) % 7;
  var tabs = $('dayTabs');
  tabs.innerHTML = '';                              // empty it first
  for (var d = 0; d < DAYS.length; d++) {
    var tab = document.createElement('button');     // make a new <button>
    tab.dataset.day = d;                            // remember which day it is
    tab.className = (d === currentDay ? 'on ' : '') + (d === todayNumber ? 'today' : '');
    tab.innerHTML = DAYS[d] + (d === todayNumber ? '<small>today</small>' : '');
    tab.addEventListener('click', chooseDay);
    tabs.appendChild(tab);                          // put it on the page
  }

  // --- the 5 meals ---
  var list = $('mealList');
  list.innerHTML = '';
  var planTotals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  var eatenTotals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };

  for (var s = 0; s < SLOTS.length; s++) {
    var meal = getMeal(currentDay, s);
    var id = getMealId(currentDay, s);
    var eaten = dayLog.eaten[id] === true;

    // add this meal to the totals
    planTotals.kcal += meal.kcal;   planTotals.protein += meal.protein;
    planTotals.carbs += meal.carbs; planTotals.fat += meal.fat;
    if (eaten) {
      eatenTotals.kcal += meal.kcal;   eatenTotals.protein += meal.protein;
      eatenTotals.carbs += meal.carbs; eatenTotals.fat += meal.fat;
    }

    var card = document.createElement('article');
    card.className = 'meal' + (eaten ? ' eaten' : '');
    card.innerHTML =
      '<div class="meal-orb">' + meal.emoji + '</div>' +
      '<div>' +
        '<div class="slot">' + SLOTS[s].name + ' · ' + SLOTS[s].time + '</div>' +
        '<h3>' + meal.name + '</h3>' +
        '<p>' + meal.desc + '</p>' +
        '<div class="chips">' + makeChips(meal) + '</div>' +
      '</div>' +
      '<button class="btn ' + (eaten ? 'btn-outline' : 'btn-green') + '" data-id="' + id + '">' +
        (eaten ? 'Eaten ✓' : 'I ate this') +
      '</button>';
    card.querySelector('button').addEventListener('click', toggleEaten);
    list.appendChild(card);
  }

  // foods added from the scanner also count as eaten
  for (var e = 0; e < dayLog.extra.length; e++) {
    eatenTotals.kcal += dayLog.extra[e].kcal;
    eatenTotals.protein += dayLog.extra[e].protein;
    eatenTotals.carbs += dayLog.extra[e].carbs;
    eatenTotals.fat += dayLog.extra[e].fat;
  }

  renderTotals(planTotals, eatenTotals);
  renderExtras();
}

function chooseDay(event) {
  currentDay = Number(event.currentTarget.dataset.day);   // currentTarget = the button we attached to
  renderDiet();
}

function toggleEaten(event) {
  var id = event.currentTarget.dataset.id;
  if (dayLog.eaten[id]) {
    delete dayLog.eaten[id];                      // un-tick
  } else {
    dayLog.eaten[id] = true;                      // tick
    showToast(audience === 'kid' ? 'Yum! Great job fuelling up! 🌟' : 'Logged. Nice work!');
  }
  saveDayLog();
  renderDiet();
}

// One progress bar. value / target gives the % filled (max 100).
function makeBar(label, value, target, colorClass, unit, kidLabel) {
  var percent = Math.min(100, Math.round(value / target * 100));
  var shownLabel = (audience === 'kid' && kidLabel) ? kidLabel : label;
  var shownValue = (audience === 'kid' && unit === 'kcal')
    ? percent + '% full'
    : Math.round(value) + ' / ' + target + ' ' + unit;

  return '<div class="bar-label"><span>' + shownLabel + '</span><span>' + shownValue + '</span></div>' +
         '<div class="bar ' + colorClass + '"><i style="width:' + percent + '%"></i></div>';
}

function renderTotals(planTotals, eatenTotals) {
  var target = TARGETS[audience];
  var isKid = audience === 'kid';

  var html = '<h2>' + (isKid ? 'My fuel gauge' : "Today's intake") + '</h2>';
  html += '<p class="note" style="margin:4px 0 12px">' +
          (isKid ? 'Fills up as you eat. Planned: ' + planTotals.protein + ' g of grow-power protein'
                 : 'Eaten so far vs. target. Plan for this day: ' + planTotals.kcal + ' kcal · ' + planTotals.protein + ' g protein') +
          '</p>';
  html += makeBar('Calories', eatenTotals.kcal, target.kcal, '', 'kcal', '⚡ Energy');
  html += makeBar('Protein', eatenTotals.protein, target.protein, 'c1', 'g', '💪 Grow power');
  html += makeBar('Carbs', eatenTotals.carbs, target.carbs, 'c2', 'g', '🍞 Go fuel');
  html += makeBar('Fat', eatenTotals.fat, target.fat, 'c3', 'g', '🧠 Brain fuel');
  $('dayTotals').innerHTML = html;
}

// the "Scanned & extra foods" list
function renderExtras() {
  var box = $('logList');
  if (dayLog.extra.length === 0) {
    box.innerHTML = '<p class="empty">Nothing logged yet. Foods you scan are added here.</p>';
    return;
  }
  var html = '';
  for (var i = 0; i < dayLog.extra.length; i++) {
    var item = dayLog.extra[i];
    html += '<div class="log-item"><span>' + escapeHtml(item.emoji) + ' ' + escapeHtml(item.name) +
            '<small>' + item.kcal + ' kcal · P ' + item.protein + ' g · C ' + item.carbs + ' g · F ' + item.fat + ' g</small></span>' +
            '<button data-index="' + i + '">✕</button></div>';
  }
  box.innerHTML = html;

  var removeButtons = $all('#logList button');
  for (var b = 0; b < removeButtons.length; b++) {
    removeButtons[b].addEventListener('click', removeExtra);
  }
}

function removeExtra(event) {
  var index = Number(event.currentTarget.dataset.index);
  dayLog.extra.splice(index, 1);                  // remove 1 item at that position
  saveDayLog();
  renderDiet();
}


/* =========================================================================
   9. FOOD SCANNER
   Core formula used everywhere:
        nutrition = (value per 100 g) x (grams / 100)
   ========================================================================= */

// Make a "scan item" from the FOODS list.
function makeItemFromFood(foodKey) {
  var food = FOODS[foodKey];
  return {
    name: food.name,
    emoji: food.emoji,
    grams: food.grams,                   // default portion
    portion: food.portion,               // e.g. "1 medium"
    health: food.health,                 // 1-5
    per100: { kcal: food.kcal, protein: food.protein, carbs: food.carbs, fat: food.fat, fibre: food.fibre }
  };
}

// The formula: nutrition for the portion the user chose.
function nutritionOf(item) {
  var x = item.grams / 100;
  return {
    kcal: item.per100.kcal * x,
    protein: item.per100.protein * x,
    carbs: item.per100.carbs * x,
    fat: item.per100.fat * x,
    fibre: item.per100.fibre * x
  };
}

// Add up all items.
function totalNutrition() {
  var total = { kcal: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 };
  for (var i = 0; i < scanItems.length; i++) {
    var n = nutritionOf(scanItems[i]);
    total.kcal += n.kcal;   total.protein += n.protein; total.carbs += n.carbs;
    total.fat += n.fat;     total.fibre += n.fibre;
  }
  return total;
}

function setStatus(message, isError) {
  var box = $('scanStatus');
  box.textContent = message;
  box.classList.toggle('err', isError === true);
}

// Chips for one item in the result list
function itemChips(item) {
  var n = nutritionOf(item);
  return makeChips({ kcal: Math.round(n.kcal), protein: round1(n.protein), carbs: round1(n.carbs), fat: round1(n.fat) });
}

// Draw the whole result panel.
function renderScanResult() {
  var isKid = audience === 'kid';
  var html = '<h2>' + (isKid ? "What's on my plate?" : 'Results') + '</h2>';

  if (scanNote) { html += '<p class="status err">' + escapeHtml(scanNote) + '</p>'; }
  if (scanSummary) { html += '<p class="note" style="margin:6px 0 10px;font-size:14px">' + escapeHtml(scanSummary) + '</p>'; }
  if (scanItems.length === 0 && !scanNote) {
    html += '<p class="empty">Your foods will appear here. Search or tap a food below, then fix the portion size.</p>';
  }

  // one block per food
  for (var i = 0; i < scanItems.length; i++) {
    var item = scanItems[i];
    html +=
      '<div class="item">' +
        '<div class="item-head"><div><b>' + escapeHtml(item.emoji) + ' ' + escapeHtml(item.name) + '</b><small>' + escapeHtml(item.portion) + '</small></div>' +
        '<button data-remove="' + i + '">✕</button></div>' +
        '<div class="portion"><span>Portion</span>' +
          '<input type="range" min="10" max="600" step="5" value="' + Math.round(item.grams) + '" data-slider="' + i + '">' +
          '<input type="number" min="5" max="2000" value="' + Math.round(item.grams) + '" data-number="' + i + '"><span>g</span></div>' +
        '<div class="chips" id="chips' + i + '">' + itemChips(item) + '</div>' +
      '</div>';
  }

  if (scanItems.length > 0) {
    html += '<div class="total-card" id="totalCard"></div>';
    if (scanTips.length > 0) {
      html += '<ul class="tips">';
      for (var t = 0; t < scanTips.length; t++) { html += '<li>💡 ' + escapeHtml(scanTips[t]) + '</li>'; }
      html += '</ul>';
    }
    html += '<div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">' +
            '<button class="btn btn-green" id="addLogBtn">➕ Add to today</button></div>';
  }

  html += '<div style="margin-top:18px"><b style="font-size:13px;text-transform:uppercase;color:#59647a">' +
          (scanItems.length ? 'Add another food' : 'Find a food') + '</b>' +
          '<input class="search" id="foodSearch" placeholder="Search e.g. idli, banana, pizza..." aria-label="Search foods">' +
          '<div class="picker" id="pickerBox"></div></div>';
  html += '<p class="note" style="margin-top:14px">Estimates only. Real nutrition varies with recipe and portion. Not medical advice.</p>';

  $('scanResult').innerHTML = html;

  // The panel was just rebuilt, so connect the new elements to their functions.
  var sliders = $all('[data-slider]');
  for (var a = 0; a < sliders.length; a++) { sliders[a].addEventListener('input', onSlider); }
  var numbers = $all('[data-number]');
  for (var b = 0; b < numbers.length; b++) { numbers[b].addEventListener('input', onNumber); }
  var removes = $all('[data-remove]');
  for (var c = 0; c < removes.length; c++) { removes[c].addEventListener('click', removeScanItem); }

  if (scanItems.length > 0) {
    $('addLogBtn').addEventListener('click', addToLog);
    updateTotalCard();
  }
  $('foodSearch').addEventListener('input', function (event) { fillPicker(event.target.value); });
  fillPicker('');
}

// Slider moved -> update grams, the number box, the chips and the totals.
function onSlider(event) {
  var index = Number(event.target.dataset.slider);
  setGrams(index, Number(event.target.value));
  document.querySelector('[data-number="' + index + '"]').value = event.target.value;
}
// Number typed -> same, but sync the slider.
function onNumber(event) {
  var index = Number(event.target.dataset.number);
  var grams = Number(event.target.value);
  if (grams < 5) { return; }                       // ignore empty / tiny while typing
  setGrams(index, Math.min(grams, 2000));
  document.querySelector('[data-slider="' + index + '"]').value = grams;
}
function setGrams(index, grams) {
  scanItems[index].grams = grams;
  $('chips' + index).innerHTML = itemChips(scanItems[index]);
  updateTotalCard();
}

function removeScanItem(event) {
  scanItems.splice(Number(event.currentTarget.dataset.remove), 1);
  renderScanResult();
}

// The green "Estimated total" box
function updateTotalCard() {
  var card = $('totalCard');
  if (!card) { return; }

  var total = totalNutrition();
  var target = TARGETS[audience];
  var isKid = audience === 'kid';

  // health stars: from the AI if we have it, otherwise the average of the foods
  var stars = scanHealth;
  if (stars === null) {
    var sum = 0, count = 0;
    for (var i = 0; i < scanItems.length; i++) {
      if (scanItems[i].health) { sum += scanItems[i].health; count += 1; }
    }
    if (count > 0) { stars = sum / count; }
  }

  var html;
  if (isKid) {
    html = '<h3>Power report</h3>';
    if (stars) { html += '<div style="font-size:22px">' + '⭐'.repeat(Math.round(stars)) + '</div>'; }
    html += '<div class="big-num"><div><b>' + energyWord(total.kcal).toUpperCase() + '</b><small>⚡ Energy</small></div>' +
            '<div><b>' + round1(total.protein) + ' g</b><small>💪 Protein</small></div>' +
            '<div><b>' + round1(total.carbs) + ' g</b><small>🍞 Carbs</small></div>' +
            '<div><b>' + round1(total.fibre) + ' g</b><small>🌾 Fibre</small></div></div>';
  } else {
    html = '<h3>Estimated total</h3>';
    if (stars) { html += '<div class="score">Health score ' + Math.round(stars * 2) + '/10</div>'; }
    html += '<div class="big-num"><div><b>' + Math.round(total.kcal) + '</b><small>kcal</small></div>' +
            '<div><b>' + round1(total.protein) + ' g</b><small>Protein</small></div>' +
            '<div><b>' + round1(total.carbs) + ' g</b><small>Carbs</small></div>' +
            '<div><b>' + round1(total.fat) + ' g</b><small>Fat</small></div></div>';
  }

  // protein bar (and calories bar for adults)
  var proteinPercent = Math.min(100, Math.round(total.protein / target.protein * 100));
  html += '<div class="bar-label"><span>Protein vs daily goal</span><span>' + proteinPercent + '%</span></div>' +
          '<div class="bar c1"><i style="width:' + proteinPercent + '%"></i></div>';
  if (!isKid) {
    var kcalPercent = Math.min(100, Math.round(total.kcal / target.kcal * 100));
    html += '<div class="bar-label"><span>Calories vs daily goal</span><span>' + kcalPercent + '%</span></div>' +
            '<div class="bar"><i style="width:' + kcalPercent + '%"></i></div>';
  }
  card.innerHTML = html;
}

// The list of food buttons under the search box.
function fillPicker(query) {
  query = query.trim().toLowerCase();
  var box = $('pickerBox');
  var html = '';
  var shown = 0;

  for (var key in FOODS) {
    var name = FOODS[key].name.toLowerCase();
    var matches = query === '' || name.includes(query) || key.includes(query);
    if (matches && shown < 14) {
      html += '<button data-food="' + key + '">' + FOODS[key].emoji + ' ' + escapeHtml(FOODS[key].name) + '</button>';
      shown = shown + 1;
    }
  }
  if (shown === 0) { html = '<span class="empty" style="margin:0">No match. Try another name.</span>'; }
  box.innerHTML = html;

  var buttons = $all('[data-food]');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', addFood);
  }
}

function addFood(event) {
  scanItems.push(makeItemFromFood(event.currentTarget.dataset.food));
  renderScanResult();
}

// "Add to today": save the whole plate in the daily log.
function addToLog() {
  if (scanItems.length === 0) { return; }
  var total = totalNutrition();
  var names = [];
  for (var i = 0; i < scanItems.length; i++) { names.push(scanItems[i].name); }

  dayLog.extra.push({
    name: names.join(' + ').slice(0, 70),
    emoji: scanItems[0].emoji,
    kcal: Math.round(total.kcal),
    protein: round1(total.protein),
    carbs: round1(total.carbs),
    fat: round1(total.fat)
  });
  saveDayLog();

  state.xp = state.xp + 5;
  updateScreen();
  showToast(audience === 'kid' ? 'Added to your day! +5 XP 🌟' : "Added to today's log. +5 XP");

  clearScan();
  renderDiet();
}

// Reset the scanner to empty.
function clearScan() {
  scanItems = [];
  scanSummary = '';
  scanTips = [];
  scanNote = '';
  scanHealth = null;
  $('viewer').classList.remove('has-shot');
  setStatus('');
  renderScanResult();
}

// ----- photo upload + optional AI -----
// The user picks a photo. We shrink it (big photos are slow to upload),
// show it, and if an API key is saved we ask Claude to read it.
function onPhotoChosen(event) {
  var file = event.target.files[0];
  event.target.value = '';                    // allow choosing the same file again
  if (!file) { return; }

  var image = new Image();
  var url = URL.createObjectURL(file);        // a temporary address for the file
  image.onload = function () {
    var scale = Math.min(1, 1024 / Math.max(image.width, image.height));
    var canvas = document.createElement('canvas');   // an invisible drawing board
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);

    var dataUrl = canvas.toDataURL('image/jpeg', 0.85);   // photo as text: "data:image/jpeg;base64,...."
    $('shot').src = dataUrl;
    $('viewer').classList.add('has-shot');
    handlePhoto(dataUrl);
  };
  image.onerror = function () { setStatus('That file could not be read as an image.', true); };
  image.src = url;
}

function handlePhoto(dataUrl) {
  scanItems = []; scanSummary = ''; scanTips = []; scanNote = ''; scanHealth = null;
  var key = loadData('sparklet_ai_key', '');

  if (key === '') {
    setStatus('Photo added. Now pick the foods you see below. (Add an API key in AI settings to detect them automatically.)');
    renderScanResult();
  } else {
    askClaude(dataUrl, key);
  }
}

function makePrompt() {
  var who = audience === 'kid'
    ? 'a child, so keep notes short, friendly and encouraging, never mention dieting, weight or guilt'
    : 'an adult, so keep tips practical and neutral';
  return 'You are a careful nutrition assistant inside a family wellness app. Look at the photo.\n' +
    'If it does not show food or drink, reply {"is_food":false,"message":"short reason"}.\n' +
    'Otherwise identify every distinct food or drink, estimate each one\'s portion in grams, and estimate nutrition for THAT portion.\n' +
    'The viewer is ' + who + '.\n' +
    'Reply with JSON only, no markdown, in exactly this shape:\n' +
    '{"is_food":true,"summary":"one short sentence","health_score":1-10,"items":[{"name":"","emoji":"","portion":"e.g. 1 bowl (~200 g)","grams":0,"calories":0,"protein_g":0,"carbs_g":0,"fat_g":0,"fiber_g":0}],"tips":["up to 3 short tips"]}';
}

// fetch() sends a request over the internet. It gives back a "promise":
// ".then(...)" runs when the answer arrives, ".catch(...)" runs if something fails.
function askClaude(dataUrl, key) {
  var model = loadData('sparklet_ai_model', '') || 'claude-sonnet-5-5';
  setStatus('Claude is looking at your food...');

  fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 1200,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: dataUrl.split(',')[1] } },
          { type: 'text', text: makePrompt() }
        ]
      }]
    })
  })
    .then(function (response) {
      if (!response.ok) { throw new Error('HTTP ' + response.status); }
      return response.json();
    })
    .then(function (body) {
      var text = '';
      for (var i = 0; i < body.content.length; i++) { text += body.content[i].text || ''; }
      var match = text.match(/\{[\s\S]*\}/);        // find the {...} JSON part of the reply
      if (!match) { throw new Error('bad reply'); }
      useClaudeReply(JSON.parse(match[0]));
    })
    .catch(function (error) {
      setStatus('Could not get an answer (' + error.message + '). Check your key, or pick the food by name below.', true);
      renderScanResult();
    });
}

function useClaudeReply(reply) {
  if (reply.is_food === false) {
    scanNote = reply.message || 'I could not see any food in that photo. Try again closer and with more light.';
  } else {
    scanSummary = reply.summary || '';
    scanHealth = reply.health_score ? reply.health_score / 2 : null;
    scanTips = (reply.tips || []).slice(0, 3);

    for (var i = 0; i < reply.items.length; i++) {
      var it = reply.items[i];
      var grams = Math.max(5, Number(it.grams) || 100);
      var x = 100 / grams;                            // convert "for this portion" -> "per 100 g"
      scanItems.push({
        name: String(it.name).slice(0, 60),
        emoji: it.emoji || '🍽️',
        grams: grams,
        portion: it.portion || '',
        health: null,
        per100: {
          kcal: (Number(it.calories) || 0) * x,
          protein: (Number(it.protein_g) || 0) * x,
          carbs: (Number(it.carbs_g) || 0) * x,
          fat: (Number(it.fat_g) || 0) * x,
          fibre: (Number(it.fiber_g) || 0) * x
        }
      });
    }
  }
  setStatus(scanItems.length > 0 ? 'Done. Check the foods and portion sizes below.' : '');
  renderScanResult();
}

function saveAiSettings() {
  var key = $('aiKey').value.trim();
  var model = $('aiModel').value.trim();
  if (key) { saveData('sparklet_ai_key', key); } else { removeData('sparklet_ai_key'); }
  if (model) { saveData('sparklet_ai_model', model); } else { removeData('sparklet_ai_model'); }
  showToast('AI settings saved.');
}


/* =========================================================================
   10. EVENT LISTENERS
   Pattern:   element.addEventListener('click', functionToRun)
   "When this element is clicked, run that function."
   ========================================================================= */

// --- menu buttons ---
var menuButtons = $all('nav button');
for (var m = 0; m < menuButtons.length; m++) {
  menuButtons[m].addEventListener('click', function (event) {
    showView(event.currentTarget.dataset.view);
  });
}

// --- lesson cards and "Try it" buttons: open the lesson named in data-lesson ---
var lessonButtons = $all('.lesson-button, .open-lesson');
for (var l = 0; l < lessonButtons.length; l++) {
  lessonButtons[l].addEventListener('click', function (event) {
    var card = event.currentTarget.closest('[data-lesson]');    // the parent that has data-lesson
    openLesson(card.dataset.lesson);
  });
}
// ("closest" works for the explore cards too: the button itself has data-lesson)

// --- quests ---
var questDoButtons = $all('.quest-action');
for (var q = 0; q < questDoButtons.length; q++) {
  questDoButtons[q].addEventListener('click', function (event) {
    completeQuest(event.currentTarget.dataset.quest);
  });
}

$('heroStart').addEventListener('click', function () {
  openLesson(state.quests.move ? 'fuel' : 'move');
});
$('tipBtn').addEventListener('click', function () { showToast('Saved in your mind toolkit. ✦'); });
$('resetBtn').addEventListener('click', resetDemo);

// --- lesson pop-up ---
$('slideNext').addEventListener('click', nextSlide);
$('slideBack').addEventListener('click', previousSlide);
$('closeModal').addEventListener('click', closeLesson);
$('lessonModal').addEventListener('click', function (event) {
  if (event.target.id === 'lessonModal') { closeLesson(); }      // click on the dark area
});
document.addEventListener('keydown', function (event) {          // keyboard shortcuts
  if (!$('lessonModal').classList.contains('show')) { return; }
  if (event.key === 'ArrowRight') { nextSlide(); }
  else if (event.key === 'ArrowLeft') { previousSlide(); }
  else if (event.key === 'Escape') { closeLesson(); }
});

// --- login ---
$('tabSignIn').addEventListener('click', function () { showAuthMode('in'); });
$('tabSignUp').addEventListener('click', function () { showAuthMode('up'); });
$('signInForm').addEventListener('submit', handleSignIn);
$('signUpForm').addEventListener('submit', handleSignUp);
$('upPass').addEventListener('input', updatePasswordMeter);
$('guestBtn').addEventListener('click', function () { startSession({ name: 'Guest', guest: true }); });
$('logoutBtn').addEventListener('click', logout);
var eyeButtons = $all('.eye');
for (var e = 0; e < eyeButtons.length; e++) {
  eyeButtons[e].addEventListener('click', togglePassword);
}

// --- mode + diet ---
$('modeBtn').addEventListener('click', toggleMode);
$('vegBtn').addEventListener('click', function () { dietType = 'veg'; saveData('sparklet_diet', dietType); renderDiet(); });
$('nvBtn').addEventListener('click', function () { dietType = 'nv'; saveData('sparklet_diet', dietType); renderDiet(); });
$('goScanBtn').addEventListener('click', function () { showView('scan'); });

// --- scanner ---
$('fileInput').addEventListener('change', onPhotoChosen);
$('clearBtn').addEventListener('click', clearScan);
$('aiSave').addEventListener('click', saveAiSettings);


/* =========================================================================
   11. START THE APP  (runs once when the page loads)
   ========================================================================= */

createDemoUser();

// load saved choices
audience = loadData('sparklet_aud', 'adult');
dietType = loadData('sparklet_diet', 'veg');
$('aiKey').value = loadData('sparklet_ai_key', '');
$('aiModel').value = loadData('sparklet_ai_model', '');

// Already logged in before? Skip the login screen.
var savedSession = loadData('sparklet_session', null);
if (savedSession) {
  showApp(savedSession);
} else {
  $('authScreen').classList.remove('hidden');   // show the login screen
  applyMode();
}
