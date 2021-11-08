# 这个是本地启动的时候用的，在 lambda 上直接配置环境变量即可
docker run --name h5-jenkins-20211108 \
-p 8070:8080 \
-v /Users/haloxie/Documents/my-data/h5-jenkins-20211108-home:/var/jenkins_home \
-e mcAlias='ycMinIO' \
-e mcHost='http://abc.com' \
-e mcUser='abc' \
-e mcPwd='pwd' \
-e gitUser='haloxie' \
-e gitPwd='abc' \
-e gitHost='github.com' \
-d \
h5-jenkins:20211108
