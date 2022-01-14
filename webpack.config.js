const webpack = require("webpack");
const path = require('path');

module.exports = {
    entry: {
        app: './src/scripts/app.ts',
        chargement: './src/scripts/chargement.js',
        inscription: './src/scripts/inscription.ts',
        login: './src/scripts/login.ts',
        options: './src/scripts/options.ts',
        profil: './src/scripts/profil.ts',
        getPassword: './src/scripts/getPassword.ts',
        game: './src/scripts/game.ts',
        lobby_client: './src/scripts/lobby_client.ts',
        verifCode: "./src/scripts/verifCode.ts",
        credits: "./src/scripts/credits.ts",
        menu: "./src/scripts/menu.ts",
        menu_jouer: "./src/scripts/menu_jouer.ts",
        page404: "./src/scripts/page404.ts"
    },
    output: {
        path: path.resolve(__dirname, 'public/dist'),
        filename: '[name].js',
    },
    module: {
        rules: [
            { test: /\.ts$/, use: 'ts-loader' },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    "style-loader",
                    // Translates CSS into CommonJS
                    "css-loader",
                    // Compiles Sass to CSS
                    "sass-loader",
                ],
            },
            { test: /\.css$/, use: ['style-loader','css-loader'] },
        ]
    },
    resolve: {
        extensions: ['.js', '.ts', '.json', '.wasm'],
    },
    externals: {
        jquery: 'jQuery',
        'react-native-sqlite-storage': 'react-native-sqlite-storage'
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        })
    ]
};