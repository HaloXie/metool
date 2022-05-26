这个项目主要是能快速进行 git 仓库的下载和更新

1. 现在支持，多个仓库的 clone、pull、checkout、install
   1. 现在支持可以 node 直接运行单文件就行
2. 目前支持 http 的模式 clone

### 配置文件说明

1. (未使用) gitCertificate 用于存放 git 认证，暂时不之后跨平台、多账户等
2. repositories
   1. branches，内置需要 checkout 的分支，如果没有则使用最顶层的 commonBranches 字段
   2. name，clone 的时候文件夹名字，可以不写
   3. url，仓库地址，目前只支持 http 模式
3. commonBranches, 需要 checkout 的分支, 如果 repository 中配置了 branches 字段则会和内部的进行合并
4. autoInstall, 是否需要在 checkout 之后运行 npm/yarn install

### 未来的 feature

1. 可以支持事件钩子
2. 可以运行自定以脚本
3. 可以指定 config 文件，可以是 yaml、js、json
   1. 支持 js 返回动态的 json 结构
4. 支持 ssh 等模式
5. 需要添加支持在 meTool 的集成
   1. 通过 metool git xxx 的方式
