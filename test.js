const test = require("ava");
const { prefix, route, router } = require(".");

test("prefix aggregates prefixes", (t) => {
  const { create } = prefix("/:repo", [
    {
      create: (options) => {
        t.is(options.prefix, "/:user/:repo");
        return () => {};
      },
    },
  ]);

  create({ prefix: "/:user" });
});

test("route calls given function on match", (t) => {
  const expected = {
    req: {
      method: "GET",
      url: "https://github.com/ct0r",
    },
    res: {},
    args: [{}, {}],
  };

  const fn = (req, res, ...args) => {
    t.is(req, expected.req);
    t.is(res, expected.res);
    t.deepEqual(args, expected.args);
    t.deepEqual(req.params, { user: "ct0r" });
  };

  const { create } = route("/:user", "GET", fn);

  create({
    args: expected.args,
    prefix: "",
  })(expected.req, expected.res);
});

test("route doesn't call given function when method doesn't match", (t) => {
  const { create } = route("/:user", "GET", t.fail);

  const result = create({
    args: [],
    prefix: "",
  })({
    method: "POST",
    url: "https://github.com/ct0r",
  });

  t.is(result, undefined);
});

test("route doesn't call given function when url doesn't match", (t) => {
  const { create } = route("/:user", "GET", t.fail);

  const result = create({
    args: [],
    prefix: "",
  })({
    method: "GET",
    url: "https://github.com",
  });

  t.is(result, undefined);
});

test("route accepts routes ending with /", (t) => {
  const { create } = route("/:user/", "GET", t.pass);

  create({
    args: [],
    prefix: "",
  })({
    method: "GET",
    url: "https://github.com/ct0r",
  });
});

test("route aggregates prefixes", (t) => {
  const { create } = route("/", "GET", t.pass);

  create({
    args: [],
    prefix: "/:user",
  })({
    method: "GET",
    url: "https://github.com/ct0r",
  });
});

test("router returns first non-undefined result", async (t) => {
  const expected = {
    result: {},
  };

  const result = await router([
    () => {},
    () => {
      return expected.result;
    },
    t.fail,
  ])({}, {});

  t.is(result, expected.result);
});

test("router returns when response stream is finished", async (t) => {
  const fn = router([
    () => {},
    (req, res) => {
      res.finished = true;
    },
    t.fail,
  ]);

  const result = await fn({}, {});

  t.is(result, undefined);
});

test("router passes arguments to given functions", (t) => {
  const expected = {
    req: {},
    res: {},
    args: [{}, {}],
  };

  const fn = (req, res, ...args) => {
    t.is(req, expected.req);
    t.is(res, expected.res);
    t.deepEqual(args, expected.args);
  };

  router([fn], { args: expected.args })(expected.req, expected.res);
});
