// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

import simplePlantUML from '@akebifiky/remark-simple-plantuml'; 

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Система расписания', // Поменяла название
  tagline: 'Автоматизированное составление расписания',
  favicon: 'img/favicon.ico',

  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  url: 'https://kanastasia-k.github.io',
  baseUrl: '/Schedule/',

  organizationName: 'kanastasia-k', 
  projectName: 'Schedule', 

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  trailingSlash: false,
  deploymentBranch: 'gh-pages',

  i18n: {
    defaultLocale: 'ru', // Поменяла на русский
    locales: ['ru'],
  },

  presets: [
    ['classic', {
      blog: false,   // <-- отключить блог
      docs: {
        sidebarPath: './sidebars.js',
        // 2. АКТИВИРУЕМ PLANTUML В DOCS
        remarkPlugins: [simplePlantUML], 
        editUrl:
          'https://github.com/kanastasia-k/Schedule/tree/main/',
      },
      theme: {
        customCss: './src/css/custom.css',
      },
    }],

    [
      'redocusaurus',
      {
        specs: [
          {
            spec: 'docs/api-reference/openapi.yaml', // Путь, куда мы положим твой файл API
            route: '/api/', // По этому адресу будет открываться Swagger/Redoc
          },
        ],
      },
    ],
  ],


  plugins: [
	['docusaurus-plugin-drawio', {
		drawioOptions: {
			dark: false, // Принудительно светлая тема для диаграммы
		}
	}], // Уберите все параметры и убедитесь, что внутри пустой объект
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Система расписания',
        logo: {
          alt: 'Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Документация',
          },
          // Добавила кнопку для API в верхнее меню
          {
            to: '/api/',
            label: 'API',
            position: 'left',
          },
          {
            href: 'https://github.com/kanastasia-k/Schedule',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Разделы',
            items: [
              {
                label: 'Документация',
                to: '/docs/intro',
              },
              {
                label: 'API',
                to: '/api/',
              },
            ],
          },
          {
            title: 'Репозиторий',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/kanastasia-k/Schedule',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Anastasia K. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;