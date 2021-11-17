# 这个是本地启动的时候用的，在 lambda 上直接配置环境变量即可
# --rm delete earlier container, should stop first
# -v /Users/haloxie/Documents/my-data/h5-jenkins-20211108-home:/var/jenkins_home \

docker run --rm --name h5-jenkins-20211108 \
-p 8080:8080 \
-e mcAlias='ycMinIO' \
-e mcHost='http://abc.com' \
-e mcUser='abc' \
-e mcPwd='pwd' \
-e gitUser='haloxie' \
-e gitPwd='abc' \
-e gitHost='github.com' \
-e npmRegistry='https://registry.npmjs.org/' \
-d \
h5-jenkins:20211108
