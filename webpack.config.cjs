// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: './src/index.ts',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      path: require.resolve('path-browserify'),
      os: require.resolve('os-browserify/browser'),
      crypto: require.resolve('crypto-browserify'),
      http: require.resolve('stream-http'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
      url: require.resolve('url/')
    }
  },
  output: {
    filename: 'bundle.cjs',
    path: path.resolve(__dirname, 'build')
  }
};
