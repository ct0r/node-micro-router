# ct0r/micro-router

A minimalistic router for [zeit/micro].

## Installation

```bash
npm install ct0r/node-micro-router#semver:0.1.0
```

## Usage

```js
const { prefix, route, router } = require("@ct0r/micro-router");

module.exports = router([
  prefix("/:user/repos", [
    route("/", "GET", (req, res) => {}),
    route("/:repo", "DELETE", (req, res) => {}),
  ]),
]);
```

Nest your prefixes:

```js
module.exports = router(
  [
    prefix("/:org", [
      prefix("/projects", [
        route("/", "GET", listProjects),
        route("/:project", "GET", findProject),
      ]),
      prefix("/repos", [
        route("/", "GET", listRepos),
        route("/:repo", "GET", findRepo),
      ]),
    ]),
  ],
  {
    prefix: "/orgs",
  }
);
```

Pass your own arguments:

```js
const db = connectToDb();

module.exports = router(
  [
    route("/:repo", "GET", (req, res, db) => {
      // some db stuff
    }),
  ],
  {
    args: [db],
  }
);
```

## API

##### `router(fns, { prefix, args })`

##### `route(path, method, fn)`

##### `prefix(path, fns)`

[zeit/micro]: https://github.com/zeit/micro
