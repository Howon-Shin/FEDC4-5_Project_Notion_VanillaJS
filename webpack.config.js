const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = (_, argv) => {
  const isDevelopment = argv.mode !== "production";

  return {
    entry: "./src/main.js",
    resolve: {
      extensions: [".js"],
      alias: {
        "@Components": path.resolve(__dirname, "./src/components"),
        "@Utils": path.resolve(__dirname, "./src/utils"),
        "@Static": path.resolve(__dirname, "./src/static"),
      },
    },
    output: {
      path: path.resolve(__dirname, "./dist"),
      filename: "index.js",
      clean: true,
    },
    devServer: {
      historyApiFallback: true,
      port: 3000,
      hot: true,
    },
    devtool: isDevelopment ? "eval-source-map" : "source-map",
    module: {
      rules: [
        {
          test: /\.(js)$/i,
          exclude: /node_modules/,
          use: "babel-loader",
        },
        {
          test: /\.html$/i,
          use: {
            loader: "html-loader",
          },
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.svg$/i,
          use: "svg-inline-loader",
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "./public/index.html"),
      }),
    ],
  };
};
