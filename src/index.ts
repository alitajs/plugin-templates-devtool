import { IApi, utils } from 'umi';
import { join } from 'path';
import { readdirSync, statSync } from 'fs';
import getLayoutContent from './utils/getLayoutContent';
import getIndexContent from './utils/getIndexContent';

if (!process.env.PAGES_PATH) {
  process.env.PAGES_PATH = 'src';
}

interface TemplateConfig {
  name?: string;
  description?: string;
  navbar?: {
    title?: string;
    backgroundColor?: string;
    color?: string;
    display?: string;
  };
  backgroundColor?: string;
}

const DIR_NAME = 'template-devtool';

const getPackages = (cwd) => {
  return readdirSync(cwd).filter(
    (pkg) => {
      const state = statSync(pkg);
      const exp = ['node_modules', 'scripts', 'tests', 'src', 'test'];
      return pkg.charAt(0) !== '.' && state.isDirectory() && !exp.includes(pkg)
    },
  );
};

const getRoutes = (api, cwd, blocks, blockPath) => {
  if (blockPath) {
    return [{
      path: '/',
      component: join(cwd, blockPath, 'src', 'pages', 'index'),
      exact: false,
    }]
  }
  return [{
    path: '/',
    component: utils.winPath(
      join(api.paths.absTmpPath || '', DIR_NAME, 'home.tsx'),
    ),
    exact: true,
  },
  ...blocks.map(block => ({
    path: `/${block.toLowerCase()}`,
    component: join(cwd, block, 'src', 'pages', 'index'),
    exact: true,
  }))]
}

export default (api: IApi) => {
  const { paths } = api;
  const cwd = paths.cwd || process.cwd();
  const blockPath = process.argv.slice(2)[1];
  let templatesConfig = {} as { [key: string]: TemplateConfig };
  let blcoks = [];
  if (blockPath) {
    const pkg = require(join(cwd, blockPath, 'package.json')) as { template: TemplateConfig, name: string };
    templatesConfig = {
      "/": { ...pkg.template, name: pkg.name }
    }
  } else {
    blcoks = getPackages(cwd);
    blcoks.forEach(block => {
      const pkg = require(join(cwd, block, 'package.json')) as { template: TemplateConfig, name: string };
      templatesConfig[`/${block.toLowerCase()}`] = { ...pkg.template, name: pkg.name, description: pkg.description }
    })
  }
  // const pkg = require(join(blockPath, 'package.json'));
  // const { template = {}, name } = pkg as { template: TemplateConfig, name: string };
  // const { navbar = {}, backgroundColor: pageBackgroundColor = "" } = template;
  // const { title = name, backgroundColor = "", color = "", display = "flex" } = navbar;
  // const templatesConfig = {
  //   "/": {
  //     "name": "abc",
  //     "navbar": {
  //       "title": "12",
  //       "backgroundColor": "red",
  //       "display": "flex",
  //       "color": "#FFF"
  //     },
  //     "backgroundColor": "#108ee9"
  //   }
  // }
  console.log(123123)
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: join(DIR_NAME, 'layout.tsx'),
      content: getLayoutContent(templatesConfig),
    });
    api.writeTmpFile({
      path: join(DIR_NAME, 'home.tsx'),
      content: getIndexContent(templatesConfig),
    });
  });
  api.modifyRoutes(routes => {
    return [
      {
        path: '/',
        component: utils.winPath(
          join(api.paths.absTmpPath || '', DIR_NAME, 'layout.tsx'),
        ),
        routes: getRoutes(api, cwd, blcoks, blockPath),
      },
    ];
  });
  // const blockPath = join(cwd, `${process.argv.slice(2)[1] || '.'}`);
};
