const angleWords = ['back', 'front', 'side', 'top', 'bottom', 'internal', 'inside', 'handle', 'zippers', 'pockets', 'logo', 'detail'];
const titles = [
  "Beauty Yellow Back",
  "Beauty Yellow Front",
  "Beauty Yellow Side Handle ",
  "Beauty Yellow Side Zippers",
  "Beauty Yellow Top Side",
  "Beauty Gray Suade Back",
  "Beauty Gray Suade Front",
  "Beauty Gray Suade Side Handle",
  "Beauty Gray Suade Side Zippers",
  "Beauty Gray Suade Top Side",
  "Beauty Gray Suade Internal Pockets",
  "Beauty Gray Suade Inside Logo"
];

titles.forEach(t => {
    let words = t.trim().split(/\s+/);
    while (words.length > 1 && angleWords.includes(words[words.length - 1].toLowerCase().replace(/[^a-z]/g, ''))) {
        words.pop();
    }
    console.log(t, "->", words.join(' '));
});
