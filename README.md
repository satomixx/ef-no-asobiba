# Skelton for Frontend
- inspired by https://github.com/mizchi/client-proj-20161231

## Stack

- pakage manager: yarn
- transpiler: babel
- linter: eslint, flow
- builder: webpack
- css: postcss
- html: pug(jade)

# Setup
## Download Three.js
- https://github.com/mrdoob/three.js/
You can use three.min.js. And you should download whole project to use much more various libraries.

# Development

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

# Forked By
- Globe
  - https://codepen.io/qkevinto/pen/EVGrGq
- The Aviator
  - https://tympanus.net/codrops/2016/04/26/the-aviator-animating-basic-3d-scene-threejs/
- 3D Tetoris
  - http://www.smashinglabs.pl/three-js-tetris-tutorial
- Dungeon
  - http://www.sugiyama-daigo.com/codecamp-teacher-blog/article7/index.html
- Interactive 3D Mall Map
  - https://tympanus.net/Development/Interactive3DMallMap/
- Drums
  - https://tympanus.net/Tutorials/SVGDrums/
- Distortion
  - https://tympanus.net/codrops/2016/05/03/animated-heat-distortion-effects-webgl/

# References
- https://books.google.co.jp/books?id=UvrYAgAAQBAJ&pg=PA76&lpg=PA76&dq=three.js+earth+mapping&source=bl&ots=21pxdvQtYS&sig=rJ8ki_shmNM3jtwMymdIGri6MmM&hl=ja&sa=X&ved=0ahUKEwjtuvSk15vRAhUFTrwKHYRiD884FBDoAQhEMAc#v=onepage&q&f=false

# License

MIT
