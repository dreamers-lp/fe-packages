import { defaultPageSizeOptions } from './config';

export const getPaginationOptions = (onShowSizeChange?: (size: number) => void) => {
  const _defaultPageSize = window.localStorage.getItem('ecmc-global-pagesize');
  const defaultPageSize = _defaultPageSize ? Number(_defaultPageSize) : undefined;
  return {
    pageSize: defaultPageSize,
    showSizeChanger: true,
    pageSizeOptions: defaultPageSizeOptions,
    onShowSizeChange: (_current: any, size: number) => {
      window.localStorage.setItem('ecmc-global-pagesize', String(size));
      if (onShowSizeChange) onShowSizeChange(size);
    },
  };
};

export function fetchManifest(url: string, publicPath: string) {
  return fetch(url).then((res) => {
    return res.text();
  }).then((data) => {
    if (data) {
      const manifest = data.match(/<meta name="manifest" content="([\w|\d|-]+.json)">/);
      let result = '';
      if (publicPath && manifest) {
        result = `${publicPath}${manifest[1]}`;
      }
      return result;
    }
  });
}

export async function getPathBySuffix(systemConf: any, jsonData: any, suffix: string) {
  let targetPath = '';
  Object.values(jsonData.assetsByChunkName).forEach((assetsArr) => {
    if(typeof assetsArr === 'string') {
      targetPath = assetsArr
    }
    if(Array.isArray(assetsArr)) {
      targetPath = assetsArr.find((assetStr) => {
        const assetsSuffix = assetStr.match(/\.[^\.]+$/) ? assetStr.match(/\.[^\.]+$/)[0] : '';
        return assetsSuffix === suffix;
      });
    }
  });
  if (process.env.NODE_ENV === 'development') {
    return `${systemConf[process.env.NODE_ENV].publicPath}${targetPath}`;
  }
  return `${systemConf[process.env.NODE_ENV as any].publicPath}${targetPath}`;
}

export function createStylesheetLink(ident: string, path: string) {
  const headEle = document.getElementsByTagName('head')[0];
  const linkEle = document.createElement('link');
  linkEle.id = `${ident}-stylesheet`;
  linkEle.rel = 'stylesheet';
  linkEle.href = path;
  headEle.append(linkEle);
}


export function parseJSON(json: string) {
	if (typeof json === 'string') {
    let paresed;
    try {
      paresed = JSON.parse(json);
    } catch (e) {
      console.log(e);
    }
    return paresed;
  }
  return undefined;
}

