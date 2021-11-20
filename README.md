# Git Commitlint + CZ

## package.json

> 注意里面的版本号，高版本的写法不一样

```
  "husky": {
    "hooks": {
      "commit-msg": "commitlint -e $HUSKY_GIT_PARAMS"
    }
  },
  "config": {
    "commitizen": {
      "path": "node_modules/cz-customizable"
    },
    "cz-customizable": {
      "config": "./.cz-config.js"
    }
  },
  "dependencies": {
    "lerna": "^4.0.0"
  },
  "devDependencies": {
    "@commitlint/cli": "^12.1.1",
    "@commitlint/config-conventional": "^12.1.1",
    "cz-customizable": "^6.3.0",
    "husky": "^4.3.8"
  }
```

### git cz

```bash
npm install -g commitizen
npm install -g cz-customizable. # Make sure you have version >v5.6.x
# create global commitizen config file .czrc:
touch ~/.czrc
echo '{ "path": "cz-customizable" }' > ~/.czrc
git cz # or npx git-cz
```
