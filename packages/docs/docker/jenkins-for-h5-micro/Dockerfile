# Jenkins: https://github.com/jenkinsci/docker/blob/master/README.md
FROM jenkins/jenkins

# ================================================================= confd
# USER jenkins
# confd configuration
USER root 
COPY ./paramcenter_tools /usr/bin
COPY ./render /etc/confd
COPY ./scripts /

# ================================================================= Jenkins configuartion | install
ENV JENKINS_HOME='/var/jenkins_home'
# prevent plugins installtions
ENV JAVA_OPTS='-Djenkins.install.runSetupWizard=false'
# CASC_JENKINS_CONFIG configuration-as-code configuration
# or set user & password via groovy
# ENV CASC_JENKINS_CONFIG='$JENKINS_HOME/casc.yaml'
# ENV JENKINS_ADMIN_ID='admin'
# ENV JENKINS_ADMIN_PASSWORD='admin'
# COPY ./jenkins.init/casc.yaml $JENKINS_HOME/casc.yaml

RUN rm -rf $JENKINS_HOME/users $JENKINS_HOME/config.xml
# ADD could copy and folder and unzip file
ADD ./jenkins.init/users $JENKINS_HOME/users
# COPY only for file and could not unzip file
COPY ./jenkins.init/config.xml $JENKINS_HOME/
COPY ./jenkins.init/*plugins.txt $JENKINS_HOME/

# https://stackoverflow.com/questions/68662364/jenkins-install-recommended-plugins-via-ansible-or-cli
RUN /usr/local/bin/install-plugins.sh < $JENKINS_HOME/recommended-plugins.txt \
  && /usr/local/bin/install-plugins.sh < $JENKINS_HOME/custom-plugins.txt

# ================================================================= apt update
RUN apt autoremove && dpkg --configure -a && apt-get update \
  && apt-get install -f git nodejs npm vim zip wget -y \
  # looks like apt not includes the mc, all supports softwares in https://packages.ubuntu.com/
  && cd /usr/share \ 
  && wget https://dl.min.io/client/mc/release/linux-amd64/mc \
  && chmod +x mc \
  && ln -s /usr/share/mc /usr/bin/mc \
  && ln -s /usr/share/mc /usr/local/bin/mc

# ================================================================= Env variables
ENV mcAlias=''
ENV mcHost=''
ENV mcUser=''
ENV mcPwd=''

ENV gitUser=''
ENV gitPwd=''
ENV gitHost=''

ENV npmRegistry='https://registry.npmjs.org/'

# ================================================================= docker script
EXPOSE 8080
VOLUME $JENKINS_HOME

ENTRYPOINT [ "/docker-entrypoint.sh" ]
# CMD [ "/init.sh" ]
# CMD [ "/usr/bin/stationary" ]
CMD ["/sbin/tini", "--", "/usr/local/bin/jenkins.sh"]
