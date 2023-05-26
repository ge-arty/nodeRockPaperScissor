const crypto = require("crypto");
const readline = require("readline");

class RockPaperScissorsGame {
  constructor(moves) {
    this.moves = moves;
    this.moveMap = this.createMoveMap(moves);
    this.halfMoves = Math.floor(moves.length / 2);
    this.key = this.generateKey();
  }

  createMoveMap(moves) {
    const moveMap = {};
    for (let i = 0; i < moves.length; i++) {
      moveMap[i + 1] = moves[i];
    }
    return moveMap;
  }

  generateKey() {
    return crypto.randomBytes(32);
  }

  calculateHMAC(message) {
    const hmac = crypto.createHmac("sha256", this.key);
    hmac.update(message);
    return hmac.digest("hex");
  }

  getUserMove() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      console.log("Available moves:");
      for (const [move, moveName] of Object.entries(this.moveMap)) {
        console.log(`${move} - ${moveName}`);
      }
      console.log("0 - exit");
      console.log("? - help");

      rl.question("Enter your move: ", (input) => {
        rl.close();
        const move = parseInt(input);
        if (!isNaN(move) && move >= 0 && move <= this.moves.length) {
          resolve(move);
        } else if (input.toLowerCase() === "?") {
          this.printHelpTable();
          this.getUserMove().then(resolve);
        } else {
          console.log("Invalid move. Please try again.");
          this.getUserMove().then(resolve);
        }
      });
    });
  }

  printHelpTable() {
    const size = this.moves.length;
    const table = [["Move"]];
    for (let i = 0; i < size; i++) {
      table[0][i + 1] = this.moveMap[i + 1];
      table[i + 1] = new Array(size + 1);
      table[i + 1][0] = this.moveMap[i + 1];
    }

    for (let i = 1; i <= size; i++) {
      for (let j = 1; j <= size; j++) {
        table[i][j] = this.determineWinner(this.moveMap[i], this.moveMap[j]);
      }
    }

    console.log("Help table:");
    for (const row of table) {
      console.log(row.join("\t"));
    }
  }

  determineWinner(move1, move2) {
    const index1 = this.moves.indexOf(move1);
    const index2 = this.moves.indexOf(move2);

    if (index1 === index2) {
      return "Draw";
    } else if (
      (index1 < index2 && index2 - index1 <= this.halfMoves) ||
      (index1 > index2 && index1 - index2 > this.halfMoves)
    ) {
      return "Win";
    } else {
      return "Lose";
    }
  }
}

const moves = process.argv.slice(2);
if (
  moves.length < 3 ||
  moves.length % 2 === 0 ||
  new Set(moves).size !== moves.length
) {
  console.log(
    "Invalid arguments. Please provide an odd number of non-repeating moves"
  );
} else {
  const game = new RockPaperScissorsGame(moves);
  const computerMove = Math.floor(Math.random() * moves.length) + 1;

  console.log("HMAC:", game.calculateHMAC(game.moveMap[computerMove]));
  game.getUserMove().then((userMove) => {
    if (userMove === 0) {
      console.log("Goodbye!");
      process.exit(0);
    }

    console.log(`Your move: ${game.moveMap[userMove]}`);
    console.log(`Computer move: ${game.moveMap[computerMove]}`);

    const result = game.determineWinner(
      game.moveMap[userMove],
      game.moveMap[computerMove]
    );
    if (result === "Win") {
      console.log("You win!");
    } else if (result === "Lose") {
      console.log("You lose!");
    } else {
      console.log("It's a draw!");
    }

    console.log("HMAC key:", game.key.toString("hex"));
  });
}

// node game.js A B C D E F G
// node game.js A B C

// Table gen
// node game.js A B C D E

// Errors
//  node game.js A A C
//  node game.js A C
