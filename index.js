const url = require("url");
const { pathToRegexp } = require("path-to-regexp");

function router(fns, options = {}) {
  options.args = options.args || [];
  options.prefix = options.prefix || "";

  fns = fns.map((fn) => resolve(fn, options));

  return async (req, res) => {
    for (let i = 0; i < fns.length; i++) {
      const result = await fns[i](req, res, ...options.args);
      if (result !== undefined || res.finished) return result;
    }
  };
}

function route(path, method, fn) {
  path = path.endsWith("/") ? path.slice(0, -1) : path;

  return {
    create: (options) => {
      fn = resolve(fn, options);

      const keys = [];
      const regexp = pathToRegexp(options.prefix + path, keys);

      return (req, res) => {
        if (req.method !== method) return;

        const params = regexp.exec(url.parse(req.url).pathname);
        if (!params) return;

        req.params = {};
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i].name;
          req.params[key] = params[i + 1];
        }

        return fn(req, res, ...options.args);
      };
    },
  };
}

function prefix(path, fns) {
  return {
    create: (options) =>
      router(fns, { ...options, prefix: options.prefix + path }),
  };
}

function resolve(fn, options) {
  fn = typeof fn.create === "function" ? fn.create(options) : fn;

  if (typeof fn !== "function") throw TypeError("Handler must be a function");

  return fn;
}

module.exports = {
  prefix,
  route,
  router,
};
