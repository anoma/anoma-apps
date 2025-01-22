const path = require('path');

module.exports = {
    entry: [
        './src/index.js'
    ],
    output: {
        path: path.join(__dirname, '/dist'),
        filename: "main.js"
    },
    devServer: {
        static: {
            directory: path.join(__dirname, "dist"),
        },
        client: {
            overlay: false,
        },
        compress: true,
        port: 9000,
    },
    module: {
        rules: [
        {
            test: /\.nockma$/,
            use: 'file-loader'
        },
        ],
    },
    mode: 'development'
};
