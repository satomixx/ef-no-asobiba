/* flow */
const AsyncAwaitPlugin = require("webpack-async-await") ;

module.exports = {
    entry: {
        "main": "./src/js/main.js",
        "ground": "./src/js/ground.js",
        "globe": "./src/js/globe.js",
    },
    output: {
        path: "public/js",
        filename: "[name].bundle.js"
    },
    plugins: [
        new AsyncAwaitPlugin({})
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                use: "babel-loader",
                exclude: /node_modules/
            }
        ]
    }
};
