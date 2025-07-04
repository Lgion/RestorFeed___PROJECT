/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    silenceDeprecations: ['legacy-js-api', 'color-functions', 'import'],
    quietDeps: true,
    warnRuleAsWarning: false,
    logger: {
      warn: () => {},
      deprecation: () => {},
    },
  },
  // Alternative: désactiver complètement les warnings webpack pour SCSS
  webpack: (config, { isServer }) => {
    // Filtrer les warnings liés à Sass
    const originalEntry = config.entry;
    config.entry = async () => {
      const entries = await originalEntry();
      return entries;
    };
    
    config.stats = {
      ...config.stats,
      warnings: false,
      warningsFilter: [
        /sass/i,
        /scss/i,
        /deprecation/i,
      ],
    };
    
    return config;
  },
};

export default nextConfig;
