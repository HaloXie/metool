# 注意直接 -d 运行会失败，需要 -itd
docker run --name build-server-centos7 \
-v /Users/haloxie/Documents/my-data/build-server-centos7:/usr/lib/node_modules/others/lib/node_modules \
-itd \
build-server:centos7
