const env = process.env.NODE_ENV
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const path = require('path');
function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  baseUrl: env === 'production'
    ? ''
    : '/',
  outputDir: 'dist',
  productionSourceMap: true,
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@', resolve('src'))

  },
  configureWebpack: config => {
    config.externals = {
      'web3': 'web3'
    }
    if (env === 'production') {
      config.plugins.push(
        new CompressionWebpackPlugin({
          algorithm: 'gzip',
          test:  /\.(js|css)$/,
          threshold: 10240,
          minRatio: 0.8
        })
      )
    }
  },
  lintOnSave: false,
  devServer: {
    inline: true,
    hot: true,
    host: '0.0.0.0',
    port: 8080,
    disableHostCheck: true,
    proxy: {
      '/v1': {
        target: 'http://192.168.10.252:7001',
        changeOrigin: true
      }
    }
  }
}
