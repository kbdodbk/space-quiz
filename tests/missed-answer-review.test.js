const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class Element {
  constructor(tagName = "div") {
    this.tagName = tagName;
    this.children = [];
    this.style = {};
    this.hidden = false;
    this.disabled = false;
    this._text = "";
    this.classList = { add: () => {} };
  }

  set textContent(value) {
    this._text = String(value);
    this.children = [];
  }

  get textContent() {
    return this._text + this.children.map(child => child.textContent).join("");
  }

  replaceChildren(...children) {
    this._text = "";
    this.children = children;
  }

  append(...children) {
    this.children.push(...children);
  }

  setAttribute() {}
  focus() { this.focused = true; }
  showModal() { this.open = true; }
  close(returnValue) {
    this.returnValue = returnValue;
    this.open = false;
    this.onclose?.();
  }
  get firstElementChild() { return this.children[0]; }
  get offsetWidth() { return 0; }
}

function createQuiz() {
  const ids = [
    "quiz", "result", "count", "score", "bar", "barwrap", "q", "opts",
    "fb", "next", "again", "restart", "restart-dialog", "cancel-restart",
    "confirm-restart", "emoji", "final", "title", "msg", "review",
  ];
  const elements = Object.fromEntries(ids.map(id => [id, new Element()]));
  const document = {
    getElementById: id => elements[id],
    createElement: tagName => new Element(tagName),
  };
  const context = vm.createContext({ document, Math });
  const indexHtml = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const script = indexHtml.match(/<script>([\s\S]*?)<\/script>/)[1];
  vm.runInContext(script, context);
  return { context, elements };
}

function finishRun(context, elements, missFirst = false) {
  for (let n = 0; n < 10; n++) {
    const [, options, correct] = vm.runInContext("questions", context)[n];
    const selected = missFirst && n === 0 ? (correct + 1) % options.length : correct;
    elements.opts.children[selected].onclick();

    if (n === 0 && missFirst) {
      vm.runInContext(`answer(${correct})`, context);
      assert.equal(vm.runInContext("score", context), 0);
      assert.equal(vm.runInContext("answers.length", context), 1);
      assert.ok(elements.opts.children.every(button => button.disabled));
    }

    elements.next.onclick();
    if (n === 0 && missFirst) {
      assert.equal(elements.review.children.length, 0);
    }
  }
}

test("shows labeled missed answers and clears them when replaying", () => {
  const { context, elements } = createQuiz();
  const [question, options, correct] = vm.runInContext("questions", context)[0];
  const selected = (correct + 1) % options.length;

  finishRun(context, elements, true);

  assert.equal(elements.final.textContent, "9 / 10");
  assert.equal(elements.title.textContent, "Astronaut material!");
  assert.equal(elements.title.focused, true);
  assert.equal(elements.review.children[0].textContent, "Missed answers");
  assert.equal(elements.review.children[1].children.length, 1);
  const [item] = elements.review.children[1].children;
  assert.equal(item.tagName, "li");
  assert.equal(item.children[0].textContent, question);
  assert.equal(item.children[1].textContent, `Your answer: ${options[selected]}`);
  assert.equal(item.children[2].textContent, `Correct answer: ${options[correct]}`);

  elements.again.onclick();
  assert.equal(elements.quiz.hidden, false);
  assert.equal(elements.result.hidden, true);
  assert.equal(elements.score.textContent, "Score: 0");
  assert.equal(vm.runInContext("answers.length", context), 0);
  assert.equal(elements.review.children.length, 0);

  const right = vm.runInContext("questions", context)[0][2];
  elements.opts.children[(right + 1) % 4].onclick();
  elements.next.onclick();
  elements.restart.onclick();
  elements["confirm-restart"].onclick();
  assert.equal(elements.count.textContent, "Question 1 of 10");
  assert.equal(elements.score.textContent, "Score: 0");
  assert.equal(vm.runInContext("answers.length", context), 0);
  assert.equal(elements.review.children.length, 0);
});

test("shows a friendly message when every answer is correct", () => {
  const { context, elements } = createQuiz();

  finishRun(context, elements);

  assert.equal(elements.final.textContent, "10 / 10");
  assert.equal(elements.title.textContent, "Mission Commander!");
  assert.equal(elements.review.textContent, "No missed answers — flawless flight!");
});
