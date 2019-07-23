node {

  stage('Checkout') {
    git url: 'git@github.com:eclipsesource/tabris-js.git', credentialsId: 'tabris-js_id_rsa', branch: '2.x'
  }

  /* Requires the Docker Pipeline plugin to be installed */
  docker.image('node:10-alpine').inside {

    def scmInfo

    stage('Checkout') {
      scmInfo = checkout scm
    }

    stage('Build') {
      ansiColor('xterm') {
        sh 'npm i grunt-cli -g'
        sh 'npm i'
        if (env.TARGET == 'release') {
          sh 'grunt -v --release'
        } else {
          sh 'grunt -v'
        }
      }
    }

    stage('Archive') {
      archiveArtifacts 'build/**'
    }

    stage('Publish') {
      if(env.TARGET == 'nightly') {
        withCredentials([
          string(credentialsId: 'TABRIS_NPM_REGISTRY_AUTH_TOKEN', variable: 'NPM_TOKEN'),
        ]) {
          sh 'echo $NPM_TOKEN > $HOME/.npmrc'
          sh 'cd build/tabris && npm publish --tag nightly-2.x'
        }
      }
    }

  }

}
