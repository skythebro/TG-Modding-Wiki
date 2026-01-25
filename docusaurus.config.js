const lightCodeTheme = require('prism-react-renderer').themes.github;
const darkCodeTheme = require('prism-react-renderer').themes.dracula;

const config = {
  future: {
    experimental_faster: {
      swcJsLoader: true,
      swcJsMinimizer: true,
      swcHtmlMinimizer: true,
      lightningCssMinimizer: true,
      rspackBundler: true,
      rspackPersistentCache: true,
      mdxCrossCompilerCache: true,
    },
  },

  title: 'Avalon Modding',
  tagline: 'Unofficial guides & C# code reference for Tainted Grail: Fall of Avalon',
  favicon: 'img/favicon.ico',

  url: 'https://tg-modding.github.io',
  baseUrl: '/Wiki/',

  organizationName: 'TG-Modding', 
  projectName: 'Wiki', 

  onBrokenLinks: 'warn',

  themes: ['@docusaurus/theme-mermaid'],

  markdown: {
    format: 'mdx',
    mermaid: true,
    mdx1Compat: {
      comments: true,
      admonitions: true,
      headingIds: true,
    },
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    }
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  scripts: [
    {
      src: 'https://unpkg.com/@mendable/search@0.0.203/dist/umd/mendable-bundle.min.js',
      defer: true,
      'data-style': 'darkMode',
      'data-type': 'search',
    },
  ],

  presets: [
    [
      'classic',
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/TG-Modding/Wiki/edit/main/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  plugins: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      ({
        hashed: true,
        indexDocs: true,
        indexBlog: false,
        docsRouteBasePath: '/docs',
        docsDir: 'docs',
        ignoreFiles: [/^api\//],
      }),
    ],
  ],

  themeConfig:
    ({
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'TG Modding',
        logo: {
          alt: 'My Site Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Code Reference',
          },
          {
            href: 'https://github.com/TG-Modding/Wiki',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Code Reference',
                to: '/docs/guides/Awaken/ECS/AwakenEcsBootstrap',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} TG-FoA modding wiki.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['csharp'],
      },
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: false,
      },
      mermaid: {
        theme: { light: 'neutral', dark: 'dark' },
      },
    }),
};

module.exports = config;
