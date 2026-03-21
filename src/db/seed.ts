import "dotenv/config";
import { faker } from "@faker-js/faker";
import { db } from "./index";
import {
	analysisIssues,
	leaderboardStats,
	submissions,
	suggestedFixes,
} from "./schema";

const LANGUAGES = [
	"javascript",
	"typescript",
	"python",
	"go",
	"rust",
	"java",
	"c",
	"cpp",
	"ruby",
	"php",
] as const;

const CODE_SNIPPETS: Record<string, string[]> = {
	javascript: [
		`function calc(x) {
  var y = eval(x);
  document.write(y);
  return y;
}`,
		`var data = [];
for (var i = 0; i < 100; i++) {
  data.push(Math.random());
}
console.log(data);`,
		`function getUser(id) {
  var user = JSON.parse(localStorage.getItem('users'))[id];
  return user.name;
}`,
		`var x = 0;
setInterval(function() {
  x = x + 1;
  document.getElementById('counter').innerHTML = x;
}, 1000);`,
		`function process(arr) {
  for (var i = 0; i < arr.length; i++) {
    for (var j = 0; j < arr.length; j++) {
      if (arr[i] == arr[j]) {
        arr.splice(j, 1);
      }
    }
  }
  return arr;
}`,
		`var isEven = function(n) {
  if (n == 0) return true;
  if (n == 1) return false;
  return isEven(n - 2);
};`,
		`function fetchData(url) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, false);
  xhr.send();
  return JSON.parse(xhr.responseText);
}`,
	],
	typescript: [
		`function add(a: any, b: any): any {
  return a + b;
}`,
		`const handleData = (data: object) => {
  return JSON.stringify(JSON.parse(JSON.stringify(data)));
};`,
		`let value: any = getValue();
value = value as unknown as string;
console.log(value);`,
		`interface Config {
  [key: string]: any;
}
const config: Config = {};
config.debug = true;
config.apiKey = 'secret123';`,
	],
	python: [
		`def process(data):
    result = []
    for i in range(len(data)):
        if data[i] != None:
            result.append(data[i] * 2)
    return result`,
		`def calculate(x, y):
    try:
        return x / y
    except:
        pass`,
		`import os
def read_file(path):
    f = open(path)
    data = f.read()
    return data`,
		`class Singleton:
    instance = None
    def __init__(self):
        if Singleton.instance is None:
            Singleton.instance = self
        return Singleton.instance`,
		`def flatten(lst):
    result = []
    for item in lst:
        if type(item) == list:
            result += flatten(item)
        else:
            result.append(item)
    return result`,
	],
	go: [
		`func process(data []int) []int {
  var result []int
  for i := 0; i < len(data); i++ {
    result = append(result, data[i] * 2)
  }
  return result
}`,
		`func readConfig(path string) (Config, error) {
  data, _ := ioutil.ReadFile(path)
  var config Config
  json.Unmarshal(data, &config)
  return config, nil
}`,
		`func handleRequest(w http.ResponseWriter, r *http.Request) {
  w.Write([]byte("hello"))
}`,
	],
	rust: [
		`fn process(data: Vec<i32>) -> Vec<i32> {
    let mut result = Vec::new();
    for i in 0..data.len() {
        result.push(data[i] * 2);
    }
    result
}`,
		`fn read_file(path: &str) -> String {
    let content = std::fs::read_to_string(path).unwrap();
    content
}`,
	],
	java: [
		`public class Utils {
  public static String process(String input) {
    String result = "";
    for (int i = 0; i < input.length(); i++) {
      result += input.charAt(i);
    }
    return result;
  }
}`,
		`public int find(int[] arr, int target) {
  for (int i = 0; i < arr.length; i++) {
    if (arr[i] == target) return i;
  }
  return -1;
}`,
	],
};

const ROAST_MESSAGES: string[] = [
	"this code looks like it was written during a power outage... in 2005.",
	"i've seen better code in a spam email.",
	"this is what happens when stackoverflow goes down.",
	"the janitor called, they want their spaghetti code back.",
	"this code has more red flags than a communist parade.",
	"if this code were a person, it would be uninvited from thanksgiving.",
	"i showed this to my rubber duck and it quit.",
	"this code is the reason seniors drink.",
	"even chatgpt would be embarrassed by this.",
	"this code has the structural integrity of a wet paper towel.",
	"i need therapy after reading this code.",
	"this code is what nightmares are made of.",
	"if bugs were features, this would be a complete product.",
	"this code has more issues than a teenager's diary.",
	"i ran this code and my computer filed a restraining order.",
	"the linter saw this and immediately shut down.",
	"this code is held together by hope and prayer.",
	"my pet rock writes better code than this.",
	"this code is the programming equivalent of putting ketchup on sushi.",
	"the only thing this code roasts is my faith in humanity.",
];

const ISSUE_TEMPLATES = [
	{
		title: "using eval()",
		description:
			"eval() executes arbitrary code and is a massive security vulnerability. Never trust user input with eval.",
		severity: "critical" as const,
	},
	{
		title: "document.write()",
		description:
			"document.write() overwrites the entire document after page load. Use DOM manipulation methods instead.",
		severity: "critical" as const,
	},
	{
		title: "var instead of const/let",
		description:
			"The var keyword is function-scoped rather than block-scoped, which can lead to unexpected behavior and bugs.",
		severity: "warning" as const,
	},
	{
		title: "synchronous network call",
		description:
			"Synchronous XMLHttpRequest blocks the main thread and freezes the UI. Use async/await or fetch() instead.",
		severity: "critical" as const,
	},
	{
		title: "n² complexity",
		description:
			"This nested loop creates O(n²) time complexity. Consider using a Set or Map for O(n) lookup.",
		severity: "warning" as const,
	},
	{
		title: "recursive even check",
		description:
			"Checking even/odd via recursion will overflow the stack for large numbers. Use modulo operator: n % 2.",
		severity: "critical" as const,
	},
	{
		title: "bare except/pass",
		description:
			"Catching all exceptions and silently passing hides bugs. Always catch specific exceptions and log them.",
		severity: "critical" as const,
	},
	{
		title: "unclosed file handle",
		description:
			"Opening a file without closing it leaks resources. Use a context manager (with open() as f).",
		severity: "warning" as const,
	},
	{
		title: "any type used",
		description:
			"Using 'any' defeats the purpose of TypeScript. Define proper types for type safety.",
		severity: "warning" as const,
	},
	{
		title: "string concatenation in loop",
		description:
			"Concatenating strings with += in a loop creates O(n²) copies. Use StringBuilder or join().",
		severity: "warning" as const,
	},
	{
		title: "hardcoded credentials",
		description:
			"API keys and secrets should never be hardcoded. Use environment variables or a secrets manager.",
		severity: "critical" as const,
	},
	{
		title: "error silently ignored",
		description:
			"Ignoring errors returned by functions leads to silent failures. Always handle errors explicitly.",
		severity: "critical" as const,
	},
	{
		title: "splicing array during iteration",
		description:
			"Modifying an array while iterating over it causes skipped elements and unexpected behavior.",
		severity: "critical" as const,
	},
	{
		title: "global state mutation",
		description:
			"Mutating global state makes code unpredictable and hard to test. Use immutable patterns or state management.",
		severity: "warning" as const,
	},
	{
		title: "deeply nested callbacks",
		description:
			"Callback hell makes code unreadable. Use async/await, Promises, or named functions to flatten the structure.",
		severity: "warning" as const,
	},
	{
		title: "unwrap() without error handling",
		description:
			"Calling .unwrap() will panic at runtime if there's an error. Use match, if let, or the ? operator instead.",
		severity: "critical" as const,
	},
	{
		title: "magic numbers",
		description:
			"Using raw numbers like 100 or 86400 makes code unreadable. Extract them into named constants.",
		severity: "good" as const,
	},
	{
		title: "missing input validation",
		description:
			"Never trust external input. Always validate and sanitize data before processing.",
		severity: "warning" as const,
	},
	{
		title: "singleton anti-pattern",
		description:
			"Global mutable singletons create hidden dependencies. Use dependency injection instead.",
		severity: "warning" as const,
	},
	{
		title: "JSON.parse(JSON.stringify())",
		description:
			"Deep cloning via JSON is slow and loses functions, dates, and undefined. Use structuredClone() or a proper deep clone utility.",
		severity: "warning" as const,
	},
];

const FIX_TEMPLATES = [
	{
		originalCode: `var result = eval(input);`,
		fixedCode: `const result = JSON.parse(input);`,
		explanation:
			"Replace eval() with JSON.parse() for safe parsing of JSON data.",
	},
	{
		originalCode: `var total = 0;
for (var i = 0; i < items.length; i++) {
  total += items[i].price;
}`,
		fixedCode: `const total = items.reduce((sum, item) => sum + item.price, 0);`,
		explanation: "Use Array.reduce() for cleaner, more functional aggregation.",
	},
	{
		originalCode: `f = open(path)
data = f.read()`,
		fixedCode: `with open(path) as f:
    data = f.read()`,
		explanation:
			"Use a context manager to ensure the file is properly closed after reading.",
	},
	{
		originalCode: `try:
    result = x / y
except:
    pass`,
		fixedCode: `try:
    result = x / y
except ZeroDivisionError:
    logging.error("Division by zero")
    result = None`,
		explanation:
			"Catch specific exceptions and log the error instead of silently swallowing it.",
	},
	{
		originalCode: `result += input.charAt(i);`,
		fixedCode: `result = new StringBuilder(input).toString();`,
		explanation:
			"Use StringBuilder for efficient string concatenation in loops.",
	},
	{
		originalCode: `data, _ := ioutil.ReadFile(path)`,
		fixedCode: `data, err := os.ReadFile(path)
if err != nil {
    return nil, fmt.Errorf("reading config: %w", err)
}`,
		explanation:
			"Always check and propagate errors in Go instead of discarding them with _.",
	},
	{
		originalCode: `content = std::fs::read_to_string(path).unwrap();`,
		fixedCode: `content = std::fs::read_to_string(path)?;`,
		explanation:
			"Use the ? operator to propagate errors instead of panicking with unwrap().",
	},
	{
		originalCode: `value = value as unknown as string;`,
		fixedCode: `const value = String(rawValue);`,
		explanation:
			"Avoid double casting through any/unknown. Use explicit conversion functions.",
	},
];

function randomCode(language: string): string {
	const snippets = CODE_SNIPPETS[language];
	if (!snippets) {
		return `// ${language} code\nfunction main() {\n  console.log("hello");\n}`;
	}
	return faker.helpers.arrayElement(snippets);
}

function randomIssues(): Array<{
	severity: "critical" | "warning" | "good";
	title: string;
	description: string;
	lineStart: number;
	lineEnd: number;
	position: number;
}> {
	const count = faker.number.int({ min: 2, max: 5 });
	const selected = faker.helpers.arrayElements(ISSUE_TEMPLATES, count);
	return selected.map((issue, i) => ({
		severity: issue.severity,
		title: issue.title,
		description: issue.description,
		lineStart: faker.number.int({ min: 1, max: 10 }),
		lineEnd: faker.number.int({ min: 1, max: 10 }),
		position: i,
	}));
}

function randomFixes(): Array<{
	originalCode: string;
	fixedCode: string;
	explanation: string;
	position: number;
}> {
	const count = faker.number.int({ min: 1, max: 2 });
	const selected = faker.helpers.arrayElements(FIX_TEMPLATES, count);
	return selected.map((fix, i) => ({
		originalCode: fix.originalCode,
		fixedCode: fix.fixedCode,
		explanation: fix.explanation,
		position: i,
	}));
}

function randomScore(): number {
	return Number(faker.number.float({ min: 0.5, max: 9.8, fractionDigits: 1 }));
}

async function seed() {
	console.log("seeding database...");

	await db.transaction(async (tx) => {
		for (let i = 0; i < 100; i++) {
			const language = faker.helpers.arrayElement(LANGUAGES);
			const code = randomCode(language);
			const lineCount = code.split("\n").length;
			const score = randomScore();
			const roastMode = faker.datatype.boolean({ probability: 0.4 });
			const roastMessage = faker.helpers.arrayElement(ROAST_MESSAGES);

			const [submission] = await tx
				.insert(submissions)
				.values({
					code,
					language,
					lineCount,
					roastMode,
					score,
					roastMessage,
					status: "analyzed",
					createdAt: faker.date.recent({ days: 30 }),
				})
				.returning({ id: submissions.id });

			const issues = randomIssues();
			await tx
				.insert(analysisIssues)
				.values(
					issues.map((issue) => ({ ...issue, submissionId: submission.id })),
				);

			const fixes = randomFixes();
			await tx
				.insert(suggestedFixes)
				.values(fixes.map((fix) => ({ ...fix, submissionId: submission.id })));

			if ((i + 1) % 25 === 0) {
				console.log(`  ${i + 1}/100 submissions created`);
			}
		}

		// Update leaderboard stats
		await tx
			.insert(leaderboardStats)
			.values({ id: 1, totalSubmissions: 100, avgScore: 5.0 })
			.onConflictDoUpdate({
				target: leaderboardStats.id,
				set: { totalSubmissions: 100, avgScore: 5.0 },
			});
	});

	console.log("seed complete: 100 submissions with issues and fixes");
}

seed().catch((err) => {
	console.error("seed failed:", err);
	process.exit(1);
});
