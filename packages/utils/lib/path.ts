/**
 * 返回目标路径相对于锚点路径的相对路径
 * @param anchorPath 锚点路径，以它作为比较基础
 * @param targetPath 目标路径
 * @returns
 */
export const getRelativePath = (anchorPath: string, targetPath: string): string => {
  // output: ../../cli-plugin-storybook/lib/serve.js
  // console.log(
  //   getRelativePath(
  //     '@jdd/cli-service/bin/jddcli-service.js',
  //     '@jdd/cli-plugin-storybook/lib/serve.js'
  //   )
  // );
  // output: ../../index.js
  // console.log(
  //   getRelativePath('@jdd/cli-service/bin/jddcli-service.js', '@jdd/index.js')
  // );
  // output: ./a/jddcli-service.js
  // console.log(
  //   getRelativePath(
  //     '@jdd/cli-service/bin/jddcli-service.js',
  //     '@jdd/cli-service/bin/a/jddcli-service.js'
  //   )
  // );
  const anchorPathArray = anchorPath.split('/');
  const targetPathArray = targetPath.split('/');

  let i = 0;
  for (; i < anchorPathArray.length; i++) {
    if (targetPathArray[i] === undefined || targetPathArray[i] !== anchorPathArray[i]) {
      break;
    }
  }
  let leftAnchor = anchorPathArray.length - i - 1;
  const result = [];
  if (leftAnchor > 0) {
    while (leftAnchor > 0) {
      result.push('../');
      leftAnchor--;
    }
  } else {
    result.push('./');
  }

  if (targetPathArray.length > i) {
    result.push(targetPathArray.slice(i).join('/'));
  }

  return result.join('');
};
