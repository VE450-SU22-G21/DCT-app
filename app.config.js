export default ({ config }) => ({
  ...config,
  extra: {
    baseURL: process.env.BACKEND_BASE_URL || 'http://nichujie.xyz:8000/',
  },
});
