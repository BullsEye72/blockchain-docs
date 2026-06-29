/** @type {import('next').NextConfig} */

module.exports = {
  images: {
    domains: ["dummyimage.com", "localhost"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
  },
};
