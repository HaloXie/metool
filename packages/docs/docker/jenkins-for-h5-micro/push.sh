# login 
docker login hub.docker.com/

# 拷贝本地镜像并重命名
docker tag h5-jenkins:20211108 hub.docker.com/custom/h5-jenkins:2021_11_08

# 直接删除 tag 产生的镜像，不会删除源镜像

docker push hub.docker.com/custom/h5-jenkins:2021_11_08
