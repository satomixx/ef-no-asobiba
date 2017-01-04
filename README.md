# Skelton for Frontend
- inspired by https://github.com/mizchi/client-proj-20161231

## Stack

- pakage manager: yarn
- transpiler: babel
- linter: eslint, flow
- builder: webpack
- css: postcss
- html: pug(jade)

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
yarn run watch:html 
```

See package.json to learn others.

## License

MIT
