import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

const REPLY =
  "I asked everyone on my team about your error. Nobody knew. Now they are all standing behind me, reading your ticket, and honestly, they look concerned for you.";

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outputPath = join(outputDir, "entry.txt");

type ReplyFacts = {
  reply: string;
  characters: number;
  bytes: number;
  lines: number;
};

function fail(message: string): never {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function replyFacts(text: string): ReplyFacts {
  return {
    reply: text,
    characters: [...text].length,
    bytes: Buffer.byteLength(text, "utf8"),
    lines: text.split(/\r\n|\r|\n/).length,
  };
}

function validate(text: string): ReplyFacts {
  const facts = replyFacts(text);
  if (facts.reply.trim().length === 0) {
    fail("entry is empty after trimming whitespace");
  }
  if (facts.reply !== facts.reply.trim()) {
    fail("entry has leading or trailing whitespace");
  }
  if (facts.lines !== 1) {
    fail(`entry must be a single line (got ${facts.lines} lines)`);
  }
  if (facts.characters < 1 || facts.characters > 200) {
    fail(`entry must be 1..200 characters (got ${facts.characters})`);
  }
  if (facts.bytes < 1 || facts.bytes > 200) {
    fail(`entry must be 1..200 bytes (got ${facts.bytes})`);
  }
  return facts;
}

const facts = validate(REPLY);

const payload = `${facts.reply}\n`;
const expected = Buffer.from(payload, "utf8");

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, payload, { encoding: "utf8" });

const written = readFileSync(outputPath);
if (!written.equals(expected)) {
  fail("read-back does not match the bytes written");
}

console.log(outputPath);
console.log(`characters: ${facts.characters}`);
console.log(`bytes: ${facts.bytes}`);
console.log(`lines: ${facts.lines}`);
