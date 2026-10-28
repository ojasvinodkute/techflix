// ===== EDIT QUESTIONS HERE =====
// answer = index (0-3) of the correct option in `options`.
// memorize = pattern shown alone for `seconds` BEFORE the question appears (then hidden for good).
// Each question gets a 30s answer timer, 10 points. Order + option order are shuffled per team.
export const ROUNDS = {
  1: { name: 'Memory Protocol', tagline: 'Lock it in. Recall it under pressure.', count: 3 },
  2: { name: 'Logic Lab', tagline: 'Trace the code. Beat the clock.', count: 5 },
  3: { name: 'Core Memory', tagline: 'Remember it, then reason with it.', count: 5 },
};

export const QUESTIONS = {
  1: [
    { id: 'm1', memorize: { title: 'CONFIG FILE', seconds: 5, lines: ["user  = 'neo'", 'level = 4', "key   = 'A9'", 'port  = 8080'] },
      text: 'What value was assigned to key?', options: ["'A9'", "'9A'", "'B9'", "'A7'"], answer: 0 },
    { id: 'm2', memorize: { title: 'DATA STRUCTURES', seconds: 5, lines: ['1. Stack', '2. Queue', '3. Tree', '4. Graph', '5. Heap'] },
      text: 'Which structure was listed 3rd?', options: ['Stack', 'Queue', 'Tree', 'Heap'], answer: 2 },
    { id: 'm3', memorize: { title: 'KEY → VALUE', seconds: 5, lines: ['A → 42', 'B → 17', 'C → 93', 'D → 58'] },
      text: 'What value was paired with C?', options: ['17', '93', '58', '39'], answer: 1 },
  ],
  2: [
    { id: 'l1', text: 'What does this program print?', code: 'x = 5\nfor i in range(1, 4):\n    x += i\nprint(x)',
      options: ['8', '11', '14', '9'], answer: 1 },
    { id: 'l2', text: 'What is the output? (bitwise AND)', code: 'print(6 & 3)',
      options: ['0', '2', '3', '7'], answer: 1 },
    { id: 'l3', text: 'What is the decimal value of the binary number 101101?',
      options: ['43', '45', '47', '53'], answer: 1 },
    { id: 'l4', text: 'An empty stack gets: push 4, push 7, push 9, pop, push 2, pop, pop. What is on top now?',
      options: ['4', '7', '9', '2'], answer: 0 },
    { id: 'l5', text: 'What does this program print?', code: 'def f(n):\n    if n <= 1:\n        return 1\n    return n * f(n - 1)\n\nprint(f(4) - f(3))',
      options: ['12', '18', '24', '6'], answer: 1 },
  ],
  3: [
    { id: 'c1', memorize: { title: 'VARIABLES', seconds: 5, lines: ['a = 4', 'b = 6', 'c = a + b'] },
      text: 'What is c * 2 ?', options: ['10', '12', '20', '24'], answer: 2 },
    { id: 'c2', memorize: { title: 'PATTERN', seconds: 5, lines: ['2 → 6 → 18 → 54 → ?'] },
      text: 'What number comes next in the pattern you saw?', options: ['108', '162', '148', '72'], answer: 1 },
    { id: 'c3', memorize: { title: 'ARRAY', seconds: 5, lines: ['[3, 8, 1, 9, 4]'] },
      text: 'What is the sum of the largest and smallest numbers in the array you saw?', options: ['11', '12', '10', '13'], answer: 2 },
    { id: 'c4', memorize: { title: 'STACK LOG', seconds: 5, lines: ['push 5', 'push 2', 'pop', 'push 8', 'push 1'] },
      text: 'After those operations, what does the stack hold (bottom → top)?', options: ['5, 8, 1', '5, 2, 8, 1', '1, 8, 5', '5, 8, 2'], answer: 0 },
    { id: 'c5', memorize: { title: 'FUNCTION', seconds: 5, lines: ['def f(x):', '    return x * 2 + 1'] },
      text: 'What is f(f(3)) ?', options: ['7', '13', '15', '17'], answer: 2 },
  ],
};
