const test = require("node:test");
const assert = require("node:assert/strict");
const { versionar } = require("../scripts/versionar.js");

// Se falhar: algum asset mudou sem atualizar o ?v= — rode `node scripts/versionar.js`.
test("URLs dos assets têm o hash do conteúdo atual (cache busting)", () => {
  assert.deepEqual(versionar({ escrever: false }), []);
});
