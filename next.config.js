const { resolve } = require('path');
const withPlugins = require('next-compose-plugins');
const optimizedImages = require('next-optimized-images');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  webpack: (config) => {
    config.resolve.alias['@public'] = resolve(__dirname, 'public');
    return config;
  },
  images: {
    disableStaticImages: true,
  },
}

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: []
  }
});

module.exports = withPlugins([
  [optimizedImages, {
    handleImages: ['jpeg', 'jpg', 'png', 'svg', 'webp', 'gif'],
    optimizeImagesInDev: true,
  }],
  [withMDX, {
    pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx']
  }],
], nextConfig);
