// ===== EDIT QUESTIONS HERE =====
// answer = index (0-3) of the correct option in `options`.
// memorize = pattern shown alone for `seconds` BEFORE the question appears (then hidden).
// Each question gets a 60s answer timer, 10 points. Order + option order are shuffled per team.
export const ROUNDS = {
  1: { name: 'Memory Protocol', tagline: 'Burn it into RAM. Recall under pressure.', count: 10 },
  2: { name: 'Logic Lab',       tagline: 'Trace the code. Beat the clock.',          count: 10 },
  3: { name: 'Core Memory',     tagline: 'Remember it. Then reason with it.',        count: 10 },
};

export const QUESTIONS = {

  // ══════════════════════════════════════════════════════════════════════════
  //  ROUND 1 — Memory Protocol
  //  Memorise a technical snapshot, then answer about it.
  // ══════════════════════════════════════════════════════════════════════════
  1: [
    {
      id: 'm1',
      memorize: {
        title: 'HEX → DECIMAL TABLE', seconds: 7,
        lines: ['0xAF → 175', '0xBE → 190', '0xCD → 205', '0xDE → 222'],
      },
      text: 'What is the decimal value of 0xBE?',
      options: ['175', '190', '205', '222'], answer: 1,
    },
    {
      id: 'm2',
      memorize: {
        title: 'HTTP STATUS CODES', seconds: 7,
        lines: ['404 → Not Found', '403 → Forbidden', '500 → Internal Server Error', '301 → Moved Permanently'],
      },
      text: 'Which HTTP status code means Forbidden?',
      options: ['404', '403', '500', '301'], answer: 1,
    },
    {
      id: 'm3',
      memorize: {
        title: 'CPU REGISTERS', seconds: 7,
        lines: ['AX = 0x00FF', 'BX = 0x1A2B', 'CX = 0x3C4D', 'DX = 0xFF00'],
      },
      text: 'What value is stored in the CX register?',
      options: ['0x1A2B', '0x3C4D', '0xFF00', '0x00FF'], answer: 1,
    },
    {
      id: 'm4',
      memorize: {
        title: 'WELL-KNOWN PORT NUMBERS', seconds: 7,
        lines: ['HTTP → 80   HTTPS → 443', 'FTP  → 21   SSH   → 22', 'SMTP → 25   DNS   → 53'],
      },
      text: 'What port does SMTP use?',
      options: ['25', '53', '21', '80'], answer: 0,
    },
    {
      id: 'm5',
      memorize: {
        title: 'OSI MODEL', seconds: 7,
        lines: ['7-Application  6-Presentation  5-Session', '4-Transport    3-Network       2-Data Link', '1-Physical'],
      },
      text: 'Which layer number is the Session layer?',
      options: ['4', '5', '6', '3'], answer: 1,
    },
    {
      id: 'm6',
      memorize: {
        title: 'WORST-CASE TIME COMPLEXITIES', seconds: 7,
        lines: ['Bubble Sort   → O(n²)', 'Merge Sort    → O(n log n)', 'Quick Sort    → O(n²)', 'Insertion Sort→ O(n²)'],
      },
      text: 'Which algorithm has O(n log n) worst-case complexity?',
      options: ['Bubble Sort', 'Quick Sort', 'Merge Sort', 'Insertion Sort'], answer: 2,
    },
    {
      id: 'm7',
      memorize: {
        title: 'SUBNET INFO', seconds: 7,
        lines: ['IP:        10.0.0.45', 'Mask:      255.255.255.192', 'Gateway:   10.0.0.1', 'Broadcast: 10.0.0.63'],
      },
      text: 'What was the Broadcast address?',
      options: ['10.0.0.1', '10.0.0.63', '10.0.0.255', '10.0.0.45'], answer: 1,
    },
    {
      id: 'm8',
      memorize: {
        title: 'XNOR TRUTH TABLE', seconds: 7,
        lines: ['A  B │ A⊕B  A⊙B', '0  0 │  0    1', '0  1 │  1    0', '1  0 │  1    0', '1  1 │  0    1'],
      },
      text: 'What is A⊙B (XNOR) when A = 0, B = 1?',
      options: ['0', '1', 'X', 'Undefined'], answer: 0,
    },
    {
      id: 'm9',
      memorize: {
        title: 'BUBBLE SORT PASSES', seconds: 7,
        lines: ['Initial:      [8, 3, 1, 7, 5]', 'After pass 1: [3, 1, 7, 5, 8]', 'After pass 2: [1, 3, 5, 7, 8]'],
      },
      text: 'What element is at index 2 after pass 1?',
      options: ['1', '7', '5', '3'], answer: 1,
    },
    {
      id: 'm10',
      memorize: {
        title: 'DECIMAL → HEX', seconds: 7,
        lines: [' 50 → 0x32', ' 75 → 0x4B', '100 → 0x64', '255 → 0xFF'],
      },
      text: 'What is the hexadecimal representation of 75?',
      options: ['0x32', '0x4B', '0x64', '0x4A'], answer: 1,
    },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  //  ROUND 2 — Logic Lab
  //  Code tracing, bit-ops, complexity, Python gotchas — engineering level.
  // ══════════════════════════════════════════════════════════════════════════
  2: [
    {
      id: 'l1',
      text: 'What does this print? (Python closure trap)',
      code: 'funcs = []\nfor i in range(4):\n    funcs.append(lambda: i * i)\nprint(funcs[1]())',
      // After loop i=3, all lambdas capture the SAME i → 3*3 = 9
      options: ['1', '4', '9', '16'], answer: 2,
    },
    {
      id: 'l2',
      text: 'What does this print? (mutable default argument)',
      code: 'def f(x, lst=[]):\n    lst.append(x)\n    return lst\nf(1)\nf(2)\nprint(f(3))',
      // Default list persists across calls → [1, 2, 3]
      options: ['[3]', '[1, 2, 3]', '[2, 3]', 'Error'], answer: 1,
    },
    {
      id: 'l3',
      text: 'What does this print? (XOR swap)',
      code: 'a, b = 13, 9\na ^= b\nb ^= a\na ^= b\nprint(a, b)',
      // XOR swap swaps the values → 9 13
      options: ['13 9', '9 13', '4 9', '13 4'], answer: 1,
    },
    {
      id: 'l4',
      text: 'What does this print? (clear lowest set bit)',
      code: 'x = 0b10110100   # 180\nprint(x & (x - 1))',
      // 180 = 10110100, 179 = 10110011, AND = 10110000 = 176
      options: ['176', '172', '164', '180'], answer: 0,
    },
    {
      id: 'l5',
      text: 'What does this print?',
      code: 'def g(n):\n    if n <= 0: return 0\n    return g(n-3) + g(n-2) + 1\nprint(g(5))',
      // g(2)=1, g(3)=2, g(5)=g(2)+g(3)+1=4
      options: ['3', '4', '5', '6'], answer: 1,
    },
    {
      id: 'l6',
      text: 'What does this print?',
      code: 'def gen():\n    for i in range(1, 6):\n        if i % 2 == 0:\n            yield i ** 2\ng = gen()\nprint(next(g) + next(g))',
      // yields 4 (i=2), 16 (i=4) → 4+16 = 20
      options: ['4', '20', '36', '16'], answer: 1,
    },
    {
      id: 'l7',
      text: 'What is the time complexity of this function?',
      code: 'def mystery(n):\n    i = n\n    while i > 1:\n        i = i // 2',
      options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(√n)'], answer: 1,
    },
    {
      id: 'l8',
      text: 'What does this print? (class variable shared across instances)',
      code: 'class A:\n    x = 0\n    def __init__(self): A.x += 1\na1 = A(); a2 = A(); a3 = A()\nprint(A.x)',
      // Each instantiation increments class var → 3
      options: ['0', '1', '2', '3'], answer: 3,
    },
    {
      id: 'l9',
      text: 'What does this print? (slice with step)',
      code: 'a = list(range(10))\nb = a[2:7:2]\nprint(b)',
      // a[2:7:2] → indices 2,4,6 → [2, 4, 6]
      options: ['[2, 4, 6, 8]', '[2, 4, 6]', '[3, 5, 7]', '[2, 5]'], answer: 1,
    },
    {
      id: 'l10',
      text: 'What is the average-case time complexity of searching for a key in a balanced Binary Search Tree with n nodes?',
      options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], answer: 1,
    },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  //  ROUND 3 — Core Memory
  //  See complex code/data, then reason about it after it disappears.
  // ══════════════════════════════════════════════════════════════════════════
  3: [
    {
      id: 'c1',
      memorize: {
        title: 'RECURSIVE FUNCTION', seconds: 8,
        lines: ['def dp(n, k):', '    if k==0 or k==n: return 1', '    return dp(n-1,k-1) + dp(n-1,k)'],
      },
      text: 'What is dp(5, 2)?  (This is C(n,k) — binomial coefficient)',
      // C(5,2) = 10
      options: ['6', '8', '10', '12'], answer: 2,
    },
    {
      id: 'c2',
      memorize: {
        title: 'DIRECTED GRAPH', seconds: 8,
        lines: ['A → [B, C]', 'B → [D]', 'C → [D, E]', 'D → [F]', 'E → [F]'],
      },
      text: 'How many distinct paths exist from A to F?',
      // A→B→D→F, A→C→D→F, A→C→E→F → 3
      options: ['2', '3', '4', '5'], answer: 1,
    },
    {
      id: 'c3',
      memorize: {
        title: 'NESTED LOOP', seconds: 8,
        lines: ['n = 6', 'total = 0', 'for i in range(1, n):', '    for j in range(i, n):', '        total += 1'],
      },
      text: 'What is the value of total after execution?',
      // 5+4+3+2+1 = 15
      options: ['10', '12', '15', '20'], answer: 2,
    },
    {
      id: 'c4',
      memorize: {
        title: 'QUEUE OPERATIONS', seconds: 8,
        lines: ['enqueue 3, enqueue 7, enqueue 1', 'dequeue', 'enqueue 9, enqueue 4', 'dequeue, dequeue'],
      },
      text: 'What element is at the FRONT of the queue after all operations?',
      // [3,7,1] → deq→[7,1] → enq9→[7,1,9] → enq4→[7,1,9,4] → deq→[1,9,4] → deq→[9,4] → front=9
      options: ['1', '4', '7', '9'], answer: 3,
    },
    {
      id: 'c5',
      memorize: {
        title: 'EUCLIDEAN GCD', seconds: 8,
        lines: ['def f(x, y):', '    while y:', '        x, y = y, x % y', '    return x'],
      },
      text: 'What does f(48, 18) return?',
      // GCD(48,18)=GCD(18,12)=GCD(12,6)=GCD(6,0)=6
      options: ['3', '6', '9', '12'], answer: 1,
    },
    {
      id: 'c6',
      memorize: {
        title: 'BITWISE XOR', seconds: 8,
        lines: ['a = 0b11001010  # 202', 'b = 0b10110101  # 181', 'c = a ^ b', 'd = c & 0xFF'],
      },
      text: 'What is the decimal value of d?',
      // 11001010 ^ 10110101 = 01111111 = 127; 127 & 0xFF = 127
      options: ['55', '75', '127', '255'], answer: 2,
    },
    {
      id: 'c7',
      memorize: {
        title: 'LINKED LIST', seconds: 8,
        lines: ['n1=Node(10); n2=Node(20); n3=Node(30)', 'n1.next = n2', 'n2.next = n3'],
      },
      text: 'What is the value of n1.next.next.v?',
      options: ['10', '20', '30', 'Error'], answer: 2,
    },
    {
      id: 'c8',
      memorize: {
        title: 'BINARY SEARCH', seconds: 8,
        lines: ['arr=[2,5,8,12,16,23,38,56,72,91]', 'target=23', 'lo=0, hi=9'],
      },
      text: 'How many comparisons does binary search make to find 23?',
      // mid=4→16<23→lo=5; mid=7→56>23→hi=6; mid=5→23 found. 3 comparisons.
      options: ['2', '3', '4', '5'], answer: 1,
    },
    {
      id: 'c9',
      memorize: {
        title: 'BINARY SEARCH TREE', seconds: 8,
        lines: ['       10', '      /  \\', '     5    15', '    / \\     \\', '   3   7    20'],
      },
      text: 'What is the sum of all nodes on the path from root to node 7?',
      // 10 → 5 → 7 = 22
      options: ['15', '17', '22', '25'], answer: 2,
    },
    {
      id: 'c10',
      memorize: {
        title: 'BITWISE EXPRESSION', seconds: 8,
        lines: ['x = 0xFF & (0xAB | 0x54)', 'y = x >> 4', 'z = y & 0x0F'],
      },
      text: 'What is the decimal value of z?',
      // 0xAB|0x54=0xFF; 0xFF&0xFF=255; 255>>4=15; 15&0x0F=15
      options: ['15', '31', '63', '127'], answer: 0,
    },
  ],
};
