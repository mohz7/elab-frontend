module.exports = {
  devServer: (devServerConfig) => {
    devServerConfig.client = {
      overlay: false,
    };
    return devServerConfig;
  },
};