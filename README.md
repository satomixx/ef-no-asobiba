# Skelton for Frontend
- inspired by https://github.com/mizchi/client-proj-20161231

## Stack

- pakage manager: yarn
- transpiler: babel
- linter: eslint, flow
- test runner: ava
- coverage tools: istanbul, nyc
- builder: webpack
- css: postcss
- html: pub(jade)
- ci: circleci

## Development

```sh
# Run
yarn install
yarn start          # Start localhost:3355 with watch:js and watch:css

# Tasks
yarn run watch:js   # Watch and build js for Chrome
yarn run build:js   # Build js for Chrome
yarn run build:js:production # Build js for IE11+
yarn run build:css
yarn run watch:css
yarn run build:html
yarn run watch:html # 
yarn run lint       # eslint
yarn run lint:fix   # eslint --fix
yarn run typecheck  # flow
yarn run test       # Test in node
yarn run cover      # Test with coverage

script/deploy # Deploy to github-pages
script/compress # Minify js and css before deploy
```

See package.json to learn others.

## Recommended tools

- Atom: linter, linter-eslint, linter-flow

## CircleCI and Deploy

- Clone this repository and register it.
- Run CI by `git push origin your-brach`
- Add deploy key to github
  - CircleCI -  Project Settings - PERMITTIONS -  Checkout SSH Key
- Deploy by `git push origin release` to its github pages.
- If you failed to delpoy by non-fast-forward, `git push origin :gh-pages` and retry it (work arround)

## License

MIT
