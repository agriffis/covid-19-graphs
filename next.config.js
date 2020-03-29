module.exports = {
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.csv$/,
      loader: 'csv-loader',
      options: {
        delimiter: ',',
        dynamicTyping: true,
        header: true,
        skipEmptyLines: true,
      },
    })

    return config
  },
}
