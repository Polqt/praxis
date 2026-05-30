import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as postgresModule from 'postgres'
import { tasks, skills } from './schema'

const postgres = (postgresModule as any).default ?? postgresModule
const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client)

async function seed() {
  await db.insert(tasks).values([
    {
      title: 'Recursive Factorial',
      description: `## Recursive Factorial\n\nWrite a function \`factorial(n)\` that returns the factorial of a non-negative integer \`n\` using recursion.\n\n**Examples:**\n- \`factorial(0)\` → \`1\`\n- \`factorial(5)\` → \`120\`\n- \`factorial(10)\` → \`3628800\``,
      language: 'python' as const,
      difficulty: 'BEGINNER' as const,
      starterCode: `def factorial(n):\n    # Your solution here\n    pass`,
      testCode: `from solution import factorial\nassert factorial(0) == 1, "factorial(0) should return 1"\nassert factorial(1) == 1, "factorial(1) should return 1"\nassert factorial(5) == 120, "factorial(5) should return 120"\nassert factorial(10) == 3628800, "factorial(10) should return 3628800"\nprint("ALL_TESTS_PASSED")`,
      skillTags: ['Python', 'Recursion', 'Algorithms'],
    },
    {
      title: 'Palindrome Checker',
      description: `## Palindrome Checker\n\nWrite a function \`is_palindrome(s)\` that returns \`True\` if the string is a palindrome, \`False\` otherwise.\n\nIgnore case and spaces.\n\n**Examples:**\n- \`is_palindrome("racecar")\` → \`True\`\n- \`is_palindrome("hello")\` → \`False\`\n- \`is_palindrome("a man a plan a canal panama")\` → \`True\``,
      language: 'python' as const,
      difficulty: 'BEGINNER' as const,
      starterCode: `def is_palindrome(s):\n    # Your solution here\n    pass`,
      testCode: `from solution import is_palindrome\nassert is_palindrome("racecar") == True\nassert is_palindrome("hello") == False\nassert is_palindrome("Racecar") == True\nassert is_palindrome("a man a plan a canal panama") == True\nassert is_palindrome("") == True\nprint("ALL_TESTS_PASSED")`,
      skillTags: ['Python', 'String Manipulation', 'Logic'],
    },
    {
      title: 'List Flattener',
      description: `## List Flattener\n\nWrite a function \`flatten(lst)\` that takes a nested list and returns a flat list with all values.\n\n**Examples:**\n- \`flatten([1, 2, 3])\` → \`[1, 2, 3]\`\n- \`flatten([1, [2, [3, 4]], 5])\` → \`[1, 2, 3, 4, 5]\`\n- \`flatten([])\` → \`[]\``,
      language: 'python' as const,
      difficulty: 'INTERMEDIATE' as const,
      starterCode: `def flatten(lst):\n    # Your solution here\n    pass`,
      testCode: `from solution import flatten\nassert flatten([1, 2, 3]) == [1, 2, 3]\nassert flatten([1, [2, 3]]) == [1, 2, 3]\nassert flatten([1, [2, [3, 4]], 5]) == [1, 2, 3, 4, 5]\nassert flatten([[1, [2]], [3, [4, [5]]]]) == [1, 2, 3, 4, 5]\nassert flatten([]) == []\nprint("ALL_TESTS_PASSED")`,
      skillTags: ['Python', 'Recursion', 'Data Structures'],
    },
  ]).onConflictDoNothing()

  await db.insert(skills).values([
    { name: 'Python', category: 'Python' },
    { name: 'Recursion', category: 'Algorithms' },
    { name: 'Algorithms', category: 'Algorithms' },
    { name: 'String Manipulation', category: 'Python' },
    { name: 'Logic', category: 'Algorithms' },
    { name: 'Data Structures', category: 'Algorithms' },
  ]).onConflictDoNothing()

  console.log('Seed complete')
  await client.end()
}

seed().catch(console.error)
