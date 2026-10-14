pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Tools') {
            steps {
                bat 'git --version'
                bat 'docker --version'
                bat 'docker compose version'
            }
        }
    }

    post {
        success {
            echo 'Capstone pipeline successful!'
        }
        failure {
            echo 'Pipeline failed. Check Console Output.'
        }
    }
}
