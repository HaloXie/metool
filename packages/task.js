const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const { promisify } = require('util');
const readline = require('readline');

//
const CONFIG = {
  build: {
    /**
     * true 是本地打包, false(default) 是提交到 originPath 仓库
     * true 的时候才会触发 zip 压缩
     */
    localMode: false,
    localPath: '_build',
    originPath: 'fe-marketing-build',
    originRepoPath: 'https://coding.jd.com/freeFe/fe-marketing-build/', // build 远程仓库地址
  },
  projects: {
    excludes: [], // 支持 string[], 后续支持正则、方法
    output: 'dist', // build 结果文件夹, 作用于每个项目
    // 用于保存到 build 路径的名字，这个和 nginx 的配置有关
    nameMap: [
      { project: 'fe-marketing-auth-pc', name: 'auth' },
      { project: 'fe-marketing-common-pc', name: 'market-common' },
      { project: 'fe-marketing-crowd-pc', name: 'crowd' },
      { project: 'fe-marketing-portal-pc', name: 'portal' },
      { project: 'fe-marketing-sub-pc', name: 'marketing' },
      { project: 'fe-marketing-workbench-pc', name: 'workbench' },
    ],
  },
  /**
   * 环境配置
   * branch：环境对应的分支会将当前分【开发】支合并到【环境】分支，环境分支之间，
   * 流程，开发 => test, 开发 => pre => master
   */
  envs: {
    test: {
      branch: 'jd-fe/test',
    },
    pre: {
      branch: 'jd-fe/pre',
    },
    production: {
      branch: 'master',
    },
  },
};

// 常量和公共方法
const [env, localMode] = process.argv.splice(2); // 第一个参数用于设置环境, 第二个参数构建类型（boolean）
const basePath = process.cwd(); // 当前目录
const rootFolders = fs
  .readdirSync(basePath, { withFileTypes: true })
  .filter(
    (item) =>
      item.isDirectory() &&
      ![...CONFIG.projects.excludes, CONFIG.build.localPath, CONFIG.build.originPath].includes(
        item.name,
      ),
  )
  .map((item) => item.name);
let buildPath = '';
const baseBranches = Object.keys(CONFIG.envs).map((item) => CONFIG.envs[item].branch);
const isProduction = env === 'production';

const exec = promisify(child_process.exec);
const readlineInstance = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const dateWithFormat = () => {
  const date = new Date(new Date().getTime());
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hours = date.getHours();
  const mins = date.getMinutes();

  const toLength2 = (num) => num.toString().padStart(2, '0');
  return `${year}${toLength2(month)}${toLength2(day)}-${toLength2(hours)}${toLength2(mins)}`;
};

const executeHelper = async (command, workDir) => {
  if (!command || !workDir) {
    return { success: false, code: -1, msg: '输入非法' };
  }
  console.log(`当前工作目录: ${workDir}`);
  console.log(`command: ${command}`);

  try {
    const { stdout } = await exec(command, { cwd: workDir });

    if (stdout) {
      // 因为有些 stdout 就是返回信息，比如 zip
      console.log(`command result: ${stdout.trim()}`);
    }
    return { success: true, data: stdout.trim() };
  } catch (error) {
    console.log(`command result: ${error}`);
    return { success: false, data: error };
  }
};
const execute = async (command, workDir = basePath) => {
  const { success, data } = await executeHelper(command, workDir);

  if (!success) {
    throw new Error(data);
  }

  return data;
};
const throwError = (errMsg) => {
  console.error('任务自动退出，原因是: ' + errMsg);
  process.exit(1);
};

const gitHelper = {
  async checkGitCommand(projectPath) {
    const command = 'git --version';
    try {
      await execute(command, projectPath);
      return fs.existsSync(path.join(projectPath, '.git'));
    } catch {
      return false; // 说明电脑没有安装 git
    }
  },
  clone(repoUrl, folderName, branch, projectPath) {
    const command = `git clone -b ${branch} ${repoUrl} ${folderName}`;
    return execute(command, projectPath);
  },
  checkStatus(projectPath) {
    const command = 'git status --porcelain';
    return execute(command, projectPath);
  },
  async pushLocal(projectPath, autoCommit = false) {
    const checkResult = await gitHelper.checkStatus(projectPath);
    if (!checkResult) {
      // 如果没有记录，则表示不需要进行推送
      return;
    }

    let commitMsg = '';
    if (autoCommit) {
      commitMsg = dateWithFormat();
    } else {
      commitMsg = await new Promise((resolve, reject) => {
        readlineInstance.question(
          '检测到本地存在未提交记录，将会自动提交，commit msg 为: ',
          (answer) => {
            if (!answer) {
              throwError('empty commit message');
            }
            resolve(answer);
          },
        );
      });
      readlineInstance.close(); // 需要手动结束
    }
    const command = `git add . && git commit -m '${commitMsg}' && git push`;
    return execute(command, projectPath);
  },
  getCurrBranch(projectPath) {
    const command = 'git symbolic-ref --short -q HEAD';
    return execute(command, projectPath);
  },
  getCurrCommit(projectPath) {
    // --short, 短的 commit id（如：bb4f92a）
    const command = 'git rev-parse --short HEAD';
    return execute(command, projectPath);
  },
  checkout(branch, projectPath) {
    const command = `git checkout ${branch}`;
    return execute(command, projectPath);
  },
  pull(branch, projectPath) {
    const command = `git pull origin ${branch}`;
    return execute(command, projectPath);
  },
  // 判断是否需要进行 merge
  async checkIfMerged(branch, commitId, projectPath) {
    const command = `git log ${branch} | grep ${commitId} `;
    const result = await execute(command, projectPath);
    return !result; // 如果存在说明已经合并过了，不需要再次合并
  },
  async merge(branch, projectPath) {
    const command = `git merge ${branch} --no-ff -m 'merge commit ${branch}'`;
    try {
      await execute(command, projectPath);
    } catch (error) {
      // 执行 merge abort
      // await execute('git merge --abort', projectPath);

      throwError(error.message);
    }
  },
  push(projectPath) {
    const command = 'git push';
    return execute(command, projectPath);
  },
};
const projectHelper = {
  async nodeVersionCheck() {
    const command = `node -v`;
    const result = await execute(command);
    return result > 'v14.0.0';
  },
  async initBuildFolder() {
    const buildFolder = path.join(basePath, buildPath);
    if (!fs.existsSync(buildFolder)) {
      fs.mkdirSync(buildFolder, { recursive: true });
    }

    if (CONFIG.build.localMode) {
      this.emptyFolder('', buildFolder);
      return;
    }

    // 需要提交到 repo 的
    const hasCloned = await gitHelper.checkGitCommand(buildFolder);
    const targetBranch = CONFIG.envs[env || 'test'].branch;
    if (hasCloned) {
      await gitHelper.checkout(targetBranch, buildFolder);
      await gitHelper.pull(targetBranch, buildFolder);
    } else {
      // clone 之前需要保证内部无其他的文件
      await gitHelper.clone(CONFIG.build.originRepoPath, buildPath, targetBranch, basePath);
    }
  },
  emptyFolder(_exclude, projectPath) {
    // 注意 ｜ 前后不能添加空格， rm -rf !(.git|a|README.md) , a 是文件夹
    const excludeItems = []; // 不清除的文件或者是文件夹
    if (Array.isArray(_exclude)) {
      excludeItems.push(..._exclude);
    } else if (typeof _exclude === 'string' && _exclude) {
      excludeItems.push(_exclude);
    }

    const target = excludeItems.length ? `!(${excludeItems.join('|')})` : './*';
    const command = `rm -rf ${target} `;
    return execute(command, projectPath);
  },
  build(projectPath) {
    const command = 'npm run build';
    return execute(command, projectPath);
  },
  async copyDist(projectPath, projectName) {
    const srcPath = CONFIG.projects.output;
    const mapName = CONFIG.projects.nameMap.find((item) => item.project === projectName).name;
    const target = path.join(basePath, `${buildPath}/${mapName}`);
    // 如果存在则先删除
    if (fs.existsSync(target)) {
      await this.emptyFolder('', target);
    } else {
      fs.mkdirSync(target);
    }

    const command = `cp -r ${srcPath}/* ${target}`;
    execute(command, projectPath);
  },
  // 目前只需要修改 portal 的
  removeIndexCors() {
    const filePath = path.join(buildPath, 'portal', 'index.html');
    if (!fs.existsSync(filePath)) {
      throw new Error('removeIndexCors, could not find index.html');
    }
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) throw err;
      const newData = data
        .replace(
          '<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">',
          '',
        )
        .replace(
          '<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests" />',
          '',
        );
      fs.rename(filePath, filePath + '.bak', (err) => {
        console.log('重命名成功');
      });
      fs.writeFileSync(filePath, newData);
    });
  },
  async zip() {
    const workDir = path.join(basePath, buildPath);
    const fileName = Date.now().toString();
    const command = `zip -rq ../${fileName}.zip ./*`;
    await execute(command, workDir);
  },
};

class TaskController {
  projectName = ''; // 项目名称
  fullProjectPath = ''; // 项目全路径
  targetBranch = ''; // 环境目标分支
  currBranch = ''; // 用于 merge，以及 build 之后 checkout 回来
  currCommitId = ''; // 当前的 commitId

  constructor(projectName) {
    this.projectName = projectName;
    this.fullProjectPath = path.join(basePath, projectName);
    this.targetBranch = CONFIG.envs[env || 'test']?.branch;
    if (!this.targetBranch) {
      throw new Error('No target branch');
    }
  }
  async pushLocal() {
    if (!baseBranches.includes(this.currBranch)) {
      await gitHelper.pushLocal(this.fullProjectPath);
    }
  }
  // 切换环境对应分支, 并进行合并
  async checkout() {
    if (!this.currBranch) {
      this.currBranch = await gitHelper.getCurrBranch(this.fullProjectPath);
    }
    await gitHelper.pull(this.currBranch, this.fullProjectPath); // 保证自身的也是最新的
    if (!this.currCommitId) {
      this.currCommitId = await gitHelper.getCurrCommit(this.fullProjectPath);
    }

    // 本地的需要先提交

    // 切换分支, 不同分支需要 merge
    if (this.currBranch !== this.targetBranch) {
      await gitHelper.checkout(this.targetBranch, this.fullProjectPath);
      await gitHelper.pull(this.targetBranch, this.fullProjectPath);

      if (baseBranches.includes(this.currBranch)) {
        // 如果是基础版本，即非开发版本，除了 pre => master 其他不能相互合并
        if (isProduction) {
          await gitHelper.merge(CONFIG.envs.pre.branch, this.fullProjectPath);
        }
      } else {
        // 开发版本
        await gitHelper.merge(this.currBranch, this.fullProjectPath);
      }
    }
  }
  // 执行 build，并将 dist 文件夹拷贝到 buildPath 文件夹
  async build() {
    await projectHelper.build(this.fullProjectPath);
    await projectHelper.copyDist(this.fullProjectPath, this.projectName);
  }
  async push() {
    await gitHelper.push(this.fullProjectPath);
  }
  backGitBranch() {
    return gitHelper.checkout(this.currBranch, this.fullProjectPath);
  }
}

const sleep = (name, ms = 1000) =>
  new Promise((resolve) => {
    console.log(`============= ${name} =============`);
    setTimeout(resolve, ms);
  });

// 执行
const main = async () => {
  const nodeCheck = await projectHelper.nodeVersionCheck();
  if (!nodeCheck) {
    console.log(`请使用 14 以上的 node 版本`);
    process.exit(1);
  }

  // check params
  try {
    const supportedEnv = Object.keys(CONFIG.envs);
    if (env && !supportedEnv.includes(env)) {
      throwError(`错误的环境类型, 只支持 ${supportedEnv.join(',')}, 默认不写为 test 环境`);
    }
    CONFIG.build.localMode = JSON.parse(localMode);
    buildPath = CONFIG.build.localMode ? CONFIG.build.localPath : CONFIG.build.originPath;
  } catch (error) {
    console.log(error);
    throwError('错误的环境类型');
  }

  // init build folder
  await projectHelper.initBuildFolder();

  const taskProcess = async (currProject) => {
    const task = new TaskController(currProject);
    await task.pushLocal();
    await task.checkout();
    await task.build();
    if (!env || env === 'test') {
      await task.push();
    }
    await task.backGitBranch();
  };

  // await Promise.all(rootFolders.map(process));
  for (let i = 0; i < rootFolders.length; i++) {
    const item = rootFolders[i];
    await sleep(item);
    await taskProcess(item);
  }

  if (!isProduction) {
    projectHelper.removeIndexCors();
  }
  if (CONFIG.build.localMode) {
    await projectHelper.zip();
  } else {
    await gitHelper.pushLocal(path.join(basePath, buildPath), true);
  }
  console.log('============= completed =================');
  process.exit(0);
};
main();

// todo 已经编译的不需要在编译
