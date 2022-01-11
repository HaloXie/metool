const diff = require('json-diff');

/**
 * https://www.npmjs.com/package/jsondiffpatch
 * tutorial => https://blog.csdn.net/liuxiao723846/article/details/108550910
 * live demo => https://benjamine.github.io/jsondiffpatch/demo/index.html?benjamine/9188826
 */

interface ITemplate {
  /**
   * 基础模板，会替换 {{compareResult}}
   */
  body: string;
  /**
   * 如果遇到差异是新增的时候，调用该方法
   */
  addHandler?: (diff: string) => string;
  /**
   * 如果遇到差异是移除的时候，调用该方法
   */
  minusHandler?: (diff: string) => string;
}

interface IOptions {
  /**
   * 是否返回全部，true 返回全部，false 只返回差异部分
   */
  full?: boolean;
  /**
   * 使用返回模板返回差异
   * string 模式会替换 {{compareResult}}
   */
  template?: string | ITemplate;
}

const defaultTemplate: ITemplate = {
  body: '',
  addHandler: (diff) => {
    return diff;
  },
  minusHandler: (diff) => {
    return diff;
  },
};

/**
 * 返回两个 Json 之间的差异
 * @param {*} anchorJson 锚点 JSON，以它作为比较基础
 * @param {*} targetJson 目标 JSON
 * @param {*} options
 * @returns
 */
export const diffJson = (anchorJson: Object, targetJson: Object, options: IOptions) => {};
