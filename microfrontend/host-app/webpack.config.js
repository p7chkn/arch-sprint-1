const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const path = require('path');

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 3000,
  },
  output: {
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      src: path.resolve(__dirname, 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.svg$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]'
        }
      }




    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      filename: 'remoteEntry.js',
      remotes: {
              profileApp: 'profileApp@http://localhost:3001/remoteEntry.js',
            },
      exposes: {
        './App': './src/components/App',
        './AddIcon': './src/images/add-icon.svg',
        './CloseIcon': './src/images/close.svg',
        './DeleteIcon': './src/images/delete-icon.svg',
        './EditIcon': './src/images/edit-icon.svg',
        './ErrorIcon': './src/images/error-icon.svg',
        './LikeActiveIcon': './src/images/like-active.svg',
        './LikeInactiveIcon': './src/images/like-inactive.svg',
        './Logo': './src/images/logo.svg',
        './SuccessIcon': './src/images/success-icon.svg',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: false,
          eager: false
        },
        'react-dom': {
          singleton: true,
          requiredVersion: false,
          eager: false
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
