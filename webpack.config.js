const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HardSource = require('hard-source-webpack-plugin');

module.exports = {
    target: 'electron-renderer',
    entry: './ts/index.tsx',
    cache: true,
    mode: 'development', // "production" | "development" | "none"
    devtool: 'source-map',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'index.js',
        libraryTarget: "commonjs2",
    },
    node: {
        __dirname: false,
        __filename: false
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader'
        }, {
            test: /\.tsx?$/,
            enforce: 'pre',
            loader: 'tslint-loader',
            options: {
                configFile: './tslint.json',
                typeCheck: true,
                fix: true,
            },
        }, {
            test: /\.css$/,
            loaders: ['style-loader', 'css-loader'],
        }, {
            test: /\.scss$/,
            use: [
                MiniCssExtractPlugin.loader,
                {
                    loader: 'css-loader',
                    options: {
                        // url: false,
                        // url()の変換でエラーが生じるためurl()を変換しない
                        // 参考 : http://www.kantenna.com/pg/2018/05/webpack_scss.php
                        // minimize: true,
                        sourceMap: true
                    }
                },
                {
                    loader: 'sass-loader',
                    options: {
                        sourceMap: true
                    }
                }
            ],
        }, {
            test: /\.woff$/,
            loaders: [
                'url-loader'
            ]
        }, {
            test: /\.ttf$/,
            loaders: [
                'url-loader'
            ]
        }, {
            test: /\.svg$/,
            use: [
                {
                    loader: "babel-loader"
                },
                {
                    loader: "react-svg-loader",
                    options: {
                        // jsx: true // true outputs JSX tags
                        svgo: {
                            plugins: [
                                {
                                    removeViewBox: false
                                }
                            ]
                        }
                    }
                }
            ]
        }],
    },
    resolve: {
        extensions: [
            '.ts',
            '.tsx',
            '.js',
            '.scss'
        ]
    },
    externals: [
        'electron',
        'fs',
        'nodegit'
    ],
    plugins: [
        new HardSource(),
        new MiniCssExtractPlugin({
            filename: '[name].css',
        })
    ]
};
