/** @type {import('next').NextConfig} */

module.exports = {
  images: {
    domains: ["dummyimage.com", "localhost"],
  },
  experimental: {
    instrumentationHook: true,
    serverActions: {
      bodySizeLimit: "500mb",
    },
  },
};
