const fs = require('fs');
const simpleGit = require('simple-git');

// 现在是常量
const CONFIG_FILE_NAME = '.git-helper.json';
const GIT_ACTION_ENUM = {
  clone: 'clone',
  mirror: 'mirror',
  bare: 'bare',
};

// 验证文件是否存在且文件内容正确
const getConfig = () => {
  const filePath = `${process.cwd()}/${CONFIG_FILE_NAME}`;
  if (!fs.existsSync(filePath)) {
    console.log('配置文件不存在，请检查配置文件是否存在');
    process.exit(1);
  }

  // 验证文件内容
  const config = fs.readFileSync(filePath, 'utf8');
  const { autoInstall, branches, gitCertificate, repositories, workspace } = JSON.parse(config);
  if (!autoInstall || !branches || !gitCertificate || !repositories || !workspace) {
    console.log('配置文件内容不正确，请检查配置文件内容');
    process.exit(1);
  }
  return { autoInstall, branches, gitCertificate, repositories, workspace };
};

const getFolderName = (url) => {
  const arr = url.split('/');
  const name = arr[arr.length - 1];
  if (name.endsWith('.git')) {
    return name.replace('.git', '');
  }
  return name;
};

// 主方法
const main = async (gitAction = GIT_ACTION_ENUM.clone) => {
  const { autoInstall, commonBranches,  repositories, workspace } = getConfig();

  //
  await Promise.all[
    repositories.map(async (repository) => {
      const { name, url, branches } = repository;
      // 分支
      const finalBranches = new Set([...(commonBranches || []), ...(branches || [])]);

      // 判断文件夹是否存在
      const dirPath = `${workspace}/${name || getFolderName(url)}`;
      // git 对象, 因为需要考虑到当前 git 是否在文件内
      const git = simpleGit(fs.existsSync(dirPath) ? dirPath : workspace);

      //
      if (!fs.existsSync(dirPath)) {
        if (gitAction === GIT_ACTION_ENUM.clone) {
          await git.clone(url, name || getFolderName(url));
        } else if (gitAction === GIT_ACTION_ENUM.mirror) {
          await git.mirror(url, name || getFolderName(url));
        }
      }

      // 分支管理
      for (const branch of finalBranches) {
        await git.checkout(branch);
        if(autoInstall.)
      }
    })
  ];
};

main();
