// ===== EDIT QUESTIONS HERE =====
// answer = index (0-3) of the correct option in `options`.
// memorize = pattern shown alone for `seconds` BEFORE the question appears (then hidden for good).
// Each question gets a 60s answer timer, 10 points. Order + option order are shuffled per team.
export const ROUNDS = {
  1: { name: 'Memory Protocol', tagline: 'Lock it in. Recall it under pressure.', count: 10 },
  2: { name: 'Logic Lab', tagline: 'Trace the code. Beat the clock.', count: 10 },
  3: { name: 'Core Memory', tagline: 'Remember it, then reason with it.', count: 10 },
};

export const QUESTIONS = {
  // ─────────────────────────────── ROUND 1: Memory Protocol ───────────────────────────────
  // Show a snippet, hide it, then ask about it.
  1: [
    {
      id: 'm1',
      memorize: { title: 'CONFIG FILE', seconds: 6, lines: ["user  = 'neo'", 'level = 4', "key   = 'A9'", 'port  = 8080'] },
      text: 'What value was assigned to key?',
      options: ["'A9'", "'9A'", "'B9'", "'A7'"], answer: 0,
    },
    {
      id: 'm2',
      memorize: { title: 'DATA STRUCTURES', seconds: 6, lines: ['1. Stack', '2. Queue', '3. Tree', '4. Graph', '5. Heap'] },
      text: 'Which structure was listed 3rd?',
      options: ['Stack', 'Queue', 'Tree', 'Heap'], answer: 2,
    },
    {
      id: 'm3',
      memorize: { title: 'KEY → VALUE', seconds: 6, lines: ['A → 42', 'B → 17', 'C → 93', 'D → 58'] },
      text: 'What value was paired with C?',
      options: ['17', '93', '58', '39'], answer: 1,
    },
    {
      id: 'm4',
      memorize: { title: 'ANIMAL CODES', seconds: 6, lines: ['Cat  → 001', 'Dog  → 010', 'Fox  → 011', 'Owl  → 100'] },
      text: 'What code was assigned to Fox?',
      options: ['010', '011', '100', '001'], answer: 1,
    },
    {
      id: 'm5',
      memorize: { title: 'NUMBER LIST', seconds: 6, lines: ['7  14  21  28  35  42'] },
      text: 'What is the 5th number in the sequence you saw?',
      options: ['28', '35', '42', '21'], answer: 1,
    },
    {
      id: 'm6',
      memorize: { title: 'COLOURS', seconds: 6, lines: ['1. Red', '2. Green', '3. Blue', '4. Yellow', '5. Purple'] },
      text: 'Which colour was at position 4?',
      options: ['Blue', 'Yellow', 'Purple', 'Green'], answer: 1,
    },
    {
      id: 'm7',
      memorize: { title: 'GRID', seconds: 6, lines: ['Row 1: A B C', 'Row 2: D E F', 'Row 3: G H I'] },
      text: 'Which letter was in Row 2, position 2?',
      options: ['D', 'E', 'F', 'B'], answer: 1,
    },
    {
      id: 'm8',
      memorize: { title: 'SERVER INFO', seconds: 6, lines: ['host = "api.techflix.io"', 'port = 443', 'timeout = 30', 'retries = 3'] },
      text: 'What was the value of timeout?',
      options: ['443', '30', '3', '60'], answer: 1,
    },
    {
      id: 'm9',
      memorize: { title: 'PLANET ORDER', seconds: 6, lines: ['1-Mercury  2-Venus  3-Earth', '4-Mars     5-Jupiter'] },
      text: 'Which planet is at position 4?',
      options: ['Earth', 'Mars', 'Jupiter', 'Venus'], answer: 1,
    },
    {
      id: 'm10',
      memorize: { title: 'SCORES', seconds: 6, lines: ['Alice: 87', 'Bob:   93', 'Carol: 76', 'Dave:  91'] },
      text: 'Who had the highest score?',
      options: ['Alice', 'Bob', 'Carol', 'Dave'], answer: 1,
    },
  ],

  // ─────────────────────────────── ROUND 2: Logic Lab ───────────────────────────────
  // Code tracing, binary, bitwise, data structures, recursion — easy to medium.
  2: [
    {
      id: 'l1',
      text: 'What does this program print?',
      code: 'x = 5\nfor i in range(1, 4):\n    x += i\nprint(x)',
      options: ['8', '11', '14', '9'], answer: 1,
    },
    {
      id: 'l2',
      text: 'What is the output? (bitwise AND)',
      code: 'print(6 & 3)',
      options: ['0', '2', '3', '7'], answer: 1,
    },
    {
      id: 'l3',
      text: 'What is the decimal value of the binary number 101101?',
      options: ['43', '45', '47', '53'], answer: 1,
    },
    {
      id: 'l4',
      text: 'An empty stack gets: push 4, push 7, push 9, pop, push 2, pop, pop. What is on top now?',
      options: ['4', '7', '9', '2'], answer: 0,
    },
    {
      id: 'l5',
      text: 'What does this program print?',
      code: 'def f(n):\n    if n <= 1:\n        return 1\n    return n * f(n - 1)\n\nprint(f(4) - f(3))',
      options: ['12', '18', '24', '6'], answer: 1,
    },
    {
      id: 'l6',
      text: 'What is the output of this snippet?',
      code: 'a = [1, 2, 3, 4, 5]\nprint(a[1:4])',
      options: ['[1, 2, 3]', '[2, 3, 4]', '[2, 3, 4, 5]', '[1, 2, 3, 4]'], answer: 1,
    },
    {
      id: 'l7',
      text: 'What does this print?',
      code: 'x = 10\ny = 3\nprint(x // y, x % y)',
      options: ['3 1', '3 2', '4 1', '3 3'], answer: 0,
    },
    {
      id: 'l8',
      text: 'How many times does "hello" get printed?',
      code: 'for i in range(2):\n    for j in range(3):\n        print("hello")',
      options: ['2', '3', '5', '6'], answer: 3,
    },
    {
      id: 'l9',
      text: 'What is 0b1010 | 0b0110 in decimal?',
      options: ['12', '14', '10', '16'], answer: 1,
    },
    {
      id: 'l10',
      text: 'What does this code return?',
      code: 'def mystery(lst):\n    return sum(lst) / len(lst)\n\nprint(mystery([10, 20, 30]))',
      options: ['15.0', '20.0', '60.0', '30.0'], answer: 1,
    },
  ],

  // ─────────────────────────────── ROUND 3: Core Memory ───────────────────────────────
  // Show snippet → hide it → ask a reasoning question about it.
  3: [
    {
      id: 'c1',
      memorize: { title: 'VARIABLES', seconds: 6, lines: ['a = 4', 'b = 6', 'c = a + b'] },
      text: 'What is c * 2?',
      options: ['10', '12', '20', '24'], answer: 2,
    },
    {
      id: 'c2',
      memorize: { title: 'PATTERN', seconds: 6, lines: ['2 → 6 → 18 → 54 → ?'] },
      text: 'What number comes next in the pattern you saw?',
      options: ['108', '162', '148', '72'], answer: 1,
    },
    {
      id: 'c3',
      memorize: { title: 'ARRAY', seconds: 6, lines: ['[3, 8, 1, 9, 4]'] },
      text: 'What is the sum of the largest and smallest numbers in the array you saw?',
      options: ['11', '12', '10', '13'], answer: 2,
    },
    {
      id: 'c4',
      memorize: { title: 'STACK LOG', seconds: 6, lines: ['push 5', 'push 2', 'pop', 'push 8', 'push 1'] },
      text: 'After those operations, what does the stack hold (bottom → top)?',
      options: ['5, 8, 1', '5, 2, 8, 1', '1, 8, 5', '5, 8, 2'], answer: 0,
    },
    {
      id: 'c5',
      memorize: { title: 'FUNCTION', seconds: 6, lines: ['def f(x):', '    return x * 2 + 1'] },
      text: 'What is f(f(3))?',
      options: ['7', '13', '15', '17'], answer: 2,
    },
    {
      id: 'c6',
      memorize: { title: 'LOOP TRACE', seconds: 6, lines: ['total = 0', 'for i in [1,2,3,4]:', '    total += i'] },
      text: 'What is the value of total after the loop?',
      options: ['6', '8', '10', '12'], answer: 2,
    },
    {
      id: 'c7',
      memorize: { title: 'DICT', seconds: 6, lines: ['d = {"x": 5, "y": 8, "z": 3}'] },
      text: 'What is d["y"] - d["z"]?',
      options: ['3', '5', '8', '11'], answer: 1,
    },
    {
      id: 'c8',
      memorize: { title: 'SEQUENCE', seconds: 6, lines: ['1, 1, 2, 3, 5, 8, 13, ?'] },
      text: 'What is the next number in the sequence?',
      options: ['18', '20', '21', '25'], answer: 2,
    },
    {
      id: 'c9',
      memorize: { title: 'BINARY OPS', seconds: 6, lines: ['a = 0b1100', 'b = 0b1010', 'c = a & b'] },
      text: 'What is the decimal value of c?',
      options: ['6', '8', '10', '14'], answer: 1,
    },
    {
      id: 'c10',
      memorize: { title: 'SCORE TABLE', seconds: 6, lines: ['R1: 30   R2: 50   R3: 20', 'Bonus: 15'] },
      text: 'What is the total score including the bonus?',
      options: ['100', '105', '110', '115'], answer: 3,
    },
  ],
};
