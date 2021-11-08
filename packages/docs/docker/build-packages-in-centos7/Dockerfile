FROM centos:centos7.9.2009

USER root
RUN yum -y update \

    # upgrade curl
    && yum install -y http://www.city-fan.org/ftp/contrib/yum-repo/city-fan.org-release-2-1.rhel7.noarch.rpm \
    && yum update -y curl \

    # nodejs
    && curl --silent --location https://rpm.nodesource.com/setup_14.x | bash - \
    && yum install -y nodejs \
    && node -v \
    && npm -v \

    # 
    && npm install -g yarn \
    && npm install -g yrm \

    # other
    && npm config set prefix '/usr/lib/node_modules/others'
