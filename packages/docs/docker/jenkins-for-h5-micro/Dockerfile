# Jenkins: https://github.com/jenkinsci/docker/blob/master/README.md
FROM jenkins/jenkins

# install recommended plugins
#   https://stackoverflow.com/questions/68662364/jenkins-install-recommended-plugins-via-ansible-or-cli
RUN jenkins-plugin-cli --plugins ace-editor ant antisamy-markup-formatter apache-httpcomponents-client-4-api bootstrap4-api \ 
		bootstrap5-api bouncycastle-api branch-api build-timeout caffeine-api checks-api cloudbees-folder command-launcher \ 
		credentials credentials-binding display-url-api durable-task echarts-api email-ext font-awesome-api git git-client \ 
		git-server github github-api github-branch-source gradle handlebars jackson2-api jaxb jdk-tool jjwt-api jquery3-api \ 
		jsch junit ldap lockable-resources mailer matrix-auth matrix-project momentjs okhttp-api pam-auth pipeline-build-step \ 
		pipeline-github-lib pipeline-graph-analysis pipeline-input-step pipeline-milestone-step pipeline-model-api \ 
		pipeline-model-definition pipeline-model-extensions pipeline-rest-api pipeline-stage-step pipeline-stage-tags-metadata \ 
		pipeline-stage-view plain-credentials plugin-util-api popper-api popper2-api resource-disposer scm-api script-security \ 
		snakeyaml-api ssh-credentials ssh-slaves sshd structs timestamper token-macro trilead-api workflow-aggregator workflow-api \ 
		workflow-basic-steps workflow-cps workflow-cps-global-lib workflow-durable-task-step workflow-job workflow-multibranch \ 
		workflow-scm-step workflow-step-api workflow-support ws-cleanup \
    # install plugins via cli
    configuration-as-code groovy-postbuild

# use user:root to install some necessary tools via apt
USER root 
# https://www.cnblogs.com/yuanyiming/p/12073509.html
RUN apt-get update 
RUN apt-get install nodejs npm git-all vim zip wget -y

# looks like apt not includes the mc, all supports softwares in https://packages.ubuntu.com/
RUN cd /usr/share \ 
    && wget https://dl.min.io/client/mc/release/linux-amd64/mc \
    && chmod +x mc \
    && ln -s /usr/share/mc /usr/bin/mc \
    && ln -s /usr/share/mc /usr/local/bin/mc

COPY ./paramcenter_tools /usr/bin
COPY ./render /etc/confd
COPY ./scripts /

# drop back to the regular jenkins user to config workspace
# USER jenkins

# ENV JENKINS_HOME /var/jenkins_home
ENV mcAlias=''
ENV mcHost=''
ENV mcUser=''
ENV mcPwd=''

ENV gitUser=''
ENV gitPwd=''
ENV gitHost=''

# add host
ADD ./hosts /etc/hosts

# default jenkins port
EXPOSE 8080
ENTRYPOINT [ "/docker-entrypoint.sh" ]
# CMD [ "/init.sh" ]
# CMD [ "/usr/bin/stationary" ]
CMD ["/sbin/tini", "--", "/usr/local/bin/jenkins.sh"]
