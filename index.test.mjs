import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";

const clipboard = { copies: [], failure: undefined };
mock.module("@earendil-works/pi-coding-agent", {
  namedExports: {
    async copyToClipboard(value) {
      if (clipboard.failure) throw clipboard.failure;
      clipboard.copies.push(value);
    },
  },
});
const { default: register } = await import("./index.ts");

beforeEach(() => {
  clipboard.copies.length = 0;
  clipboard.failure = undefined;
});

function fixture(entries) {
  const commands = new Map();
  const notices = [];
  const order = [];
  register({ registerCommand: (name, command) => commands.set(name, command) });
  const context = {
    waitForIdle: async () => {
      order.push("idle");
    },
    sessionManager: {
      getBranch: () => {
        order.push("branch");
        return entries;
      },
    },
    ui: { notify: (message, type) => notices.push({ message, type }) },
  };
  return {
    commands,
    notices,
    order,
    run: () => commands.get("copy-all").handler("", context),
  };
}

const message = (role, content) => ({
  type: "message",
  message: { role, content },
});

test("registers only the explicit copy-all command", () => {
  assert.deepEqual([...fixture([]).commands.keys()], ["copy-all"]);
});

test("copies branch user/assistant content after waiting, excluding tools and thinking", async () => {
  const f = fixture([
    message("user", "  Explain this  "),
    message("assistant", [
      { type: "thinking", thinking: "not copied" },
      { type: "text", text: "Answer" },
    ]),
    message("toolResult", [{ type: "text", text: "not copied" }]),
    { type: "custom", customType: "fixture", data: "not copied" },
    message("user", [
      { type: "text", text: "Screenshot" },
      { type: "image", data: "not copied" },
    ]),
  ]);
  await f.run();
  assert.deepEqual(f.order, ["idle", "branch"]);
  assert.deepEqual(clipboard.copies, [
    "USER:\nExplain this\n\n---\n\nASSISTANT:\nAnswer\n\n---\n\nUSER:\nScreenshot\n[image]",
  ]);
  assert.deepEqual(f.notices, [
    { message: "Copied 3 messages to clipboard", type: "info" },
  ]);
});

test("empty and non-text branches do not overwrite the clipboard", async () => {
  const f = fixture([
    message("user", "  "),
    message("assistant", [{ type: "toolCall", name: "fixture" }]),
  ]);
  await f.run();
  assert.deepEqual(clipboard.copies, []);
  assert.deepEqual(f.notices, [
    { message: "No user or assistant messages to copy", type: "info" },
  ]);
});

test("clipboard failures propagate without reporting successful copying", async () => {
  clipboard.failure = new Error("synthetic clipboard unavailable");
  const f = fixture([message("user", "fixture")]);
  await assert.rejects(f.run(), /synthetic clipboard unavailable/);
  assert.deepEqual(f.notices, []);
});
