import { IApi, utils } from 'umi';
import { join } from 'path';
import { readdirSync, statSync, writeFileSync } from 'fs';
import getLayoutContent from './utils/getLayoutContent';
import getIndexContent from './utils/getIndexContent';

const { chalk } = utils;

// if (!process.env.PAGES_PATH) {
//   process.env.PAGES_PATH = 'src';
// }

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
  tplType?: string;
  tplSubType?: string;
}

const DIR_NAME = 'template-devtool';

const getPackages = (cwd) => {
  return readdirSync(cwd).filter(
    (pkg) => {
      const state = statSync(pkg);
      const exp = ['node_modules', 'scripts', 'tests', 'src', 'test', 'dist', 'templates'];
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

const renderTpl = (tpl = '', data = {}) => {
  let result = tpl;
  let matches;
  do {
    const re = /{{(.*?)}}/g;
    matches = re.exec(result);
    if (matches) {
      result = result.replace(matches[0], data[matches[1]] || '');
    }
  } while (matches);
  return result
}

export default (api: IApi) => {
  const { paths } = api;
  const cwd = paths.cwd || process.cwd();
  // @ant-design/pro-cli 里面的目录是 `${path}/src` 这里手动去掉 `/src`
  if (process.env.PAGES_PATH) {
    process.env.PAGES_PATH = process.env.PAGES_PATH.split('/')[0];
  }
  const blockPath = process.env.PAGES_PATH || process.argv.slice(2)[1];
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
      const pkg = require(join(cwd, block, 'package.json')) as { template: TemplateConfig, description: string, tplType: string, tplSubType: string, name: string };
      templatesConfig[`/${block.toLowerCase()}`] = { ...pkg.template, name: pkg.name, description: pkg.description, tplType: pkg.tplType, tplSubType: pkg.tplSubType }
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
    // 忽略原有的路由，全部重新自定义
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
  api.onBuildComplete(({ err }) => {
    if (err) {
      console.error(err)
      return;
    }
    // 声明了，才会生成，自动化构建部署的时候，不需要更新这个 json 文件
    if (!process.env.CREATE_TEMPLATES_JSON) {
      return;
    }
    // 编译完成，在根目录生成 templates.json
    const getTemplateJson = (pathName) => {
      const templateConfig = templatesConfig[`/${pathName.toLowerCase()}`];
      const config = {
        "key": pathName,
        "name": templateConfig.name,
        "description": templateConfig.description,
        "url": `https://github.com/alitajs/templates/tree/master/${pathName}`,
        "path": pathName,
        "img": `https://raw.githubusercontent.com/alitajs/templates/master/${pathName}/snapshot.png?raw=true`,
        "tplType": templateConfig.tplType,
        "tplSubType": templateConfig.tplSubType,
        "previewUrl": `https://templates.alitajs.com/#/${pathName}`
      };
      const tplLookup = require(join(cwd, 'package.json')).templateTpl;
      if (typeof tplLookup === 'object' && !!tplLookup) {
        Object.keys(tplLookup).forEach(key => {
          config[key] = renderTpl(tplLookup[key], { pathName });
        });
      }
      return config;
    }
    // 按分类整理数据
    const sortListByType = (data)=>{
      const hashData = { };
      data.forEach(item => {
        if(!hashData[item.tplType]){
          hashData[item.tplType] = {}
        }
        if(!hashData[item.tplType][item.tplSubType]){
          hashData[item.tplType][item.tplSubType] = []
        }
        hashData[item.tplType][item.tplSubType].push(item);
      });
      return hashData;
    }
    const content = JSON.stringify({
      data: sortListByType(blcoks.map(block => {
        return getTemplateJson(block)
      }))
    });
    const target = join(
      api?.paths?.cwd!,
      'templates.json',
    );
    console.log(`${chalk.green('Write:')} ${target}`);
    writeFileSync(target, content, 'utf-8');
  })
};
