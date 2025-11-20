const express = require("express");

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const router = express.Router();

// This will help us connect to the database
const dbo = require("../db/conn");

// This helps convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;

// In-memory game state
let games = {};  
// Structure: 
// games[sessionId] = {
//   player1Name,
//   player2Name,
//   turn,           // 1 or 2
//   secretWord,
//   displayWord,
//   guesses: [],
//   wrong: 0,
//   maxWrong: 6,
//   source: "",     // "typed" or "db"
//   finished: false,
//   success: false
// };


// Middleware: require session
function requireSession(req, res, next) {
  if (!req.session.userId) {
    return res.status(400).json({ error: "session not set yet" });
  }
  next();
}


// Join game / set username
router.post("/hangman/join", requireSession, (req, res) => {
  const sid = req.session.userId;
  const name = req.body.name;

  if (!games[sid]) {
    games[sid] = {
      player1Name: name,
      player2Name: null,
      turn: 1,
      secretWord: "",
      displayWord: "",
      guesses: [],
      wrong: 0,
      maxWrong: 6,
      finished: false,
      success: false
    };
  } else if (!games[sid].player2Name) {
    games[sid].player2Name = name;
  }

  res.json({ status: "ok", game: games[sid] });
});


// Chooser submits a word
router.post("/hangman/setWord", requireSession, async (req, res) => {
  const sid = req.session.userId;
  const game = games[sid];

  if (!game) return res.status(400).json({ error: "game not found" });

  let word = "";
  let source = req.body.source; // "typed" or "db"

  if (source === "typed") {
    word = req.body.word.toUpperCase();
  } else if (source === "db") {
    // pull random word from MongoDB "words" collection
    const db_connect = dbo.getDb();
    const count = await db_connect.collection("words").estimatedDocumentCount();
    const randomIndex = Math.floor(Math.random() * count);
    const randomWord = await db_connect.collection("words").find().skip(randomIndex).limit(1).toArray();
    word = randomWord[0].word.toUpperCase();
  }

  game.secretWord = word;
  game.displayWord = word.replace(/[A-Z]/g, "_");
  game.guesses = [];
  game.wrong = 0;
  game.source = source;
  game.finished = false;
  game.success = false;

  res.json({ status: "word set" });
});


// Guesser submits a guess
router.post("/hangman/guess", requireSession, (req, res) => {
  const sid = req.session.userId;
  const game = games[sid];

  if (!game) return res.status(400).json({ error: "game not found" });
  if (game.finished) return res.json({ status: "finished", game });

  const letter = req.body.letter.toUpperCase();

  if (game.guesses.includes(letter)) {
    return res.json({ error: "already guessed", game });
  }

  game.guesses.push(letter);

  if (game.secretWord.includes(letter)) {
    let updated = "";
    for (let i = 0; i < game.secretWord.length; i++) {
      if (game.secretWord[i] === letter) updated += letter;
      else updated += game.displayWord[i];
    }
    game.displayWord = updated;

    if (game.displayWord === game.secretWord) {
      game.finished = true;
      game.success = true;
    }
  } else {
    game.wrong++;
    if (game.wrong >= game.maxWrong) {
      game.finished = true;
      game.success = false;
    }
  }

  res.json({ status: "ok", game });
});


// Switch turns (after round ends)
router.post("/hangman/nextRound", requireSession, (req, res) => {
  const sid = req.session.userId;
  const game = games[sid];

  if (!game) return res.status(400).json({ error: "game not found" });

  game.turn = game.turn === 1 ? 2 : 1;

  res.json({ status: "turn swapped", turn: game.turn });
});


// Save final results to MongoDB
router.post("/hangman/save", requireSession, async (req, res) => {
  const sid = req.session.userId;
  const game = games[sid];

  if (!game) return res.status(400).json({ error: "game not found" });
  if (!game.finished) return res.status(400).json({ error: "round not finished" });

  const db_connect = dbo.getDb();

  await db_connect.collection("hangmanScores").insertOne({
    player1: game.player1Name,
    player2: game.player2Name,
    word: game.secretWord,
    source: game.source,
    guesses: game.guesses,
    wrong: game.wrong,
    success: game.success,
    date: new Date()
  });

  res.json({ status: "saved" });
});


// Get high score list
router.get("/hangman/scores", requireSession, async (req, res) => {
  const db_connect = dbo.getDb();
  const scores = await db_connect.collection("hangmanScores").find({}).toArray();
  res.json(scores);
});

module.exports = router;
