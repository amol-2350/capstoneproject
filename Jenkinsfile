pipeline {
    agent any

    options {
        timestamps()
    }

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

        stage('Validate Compose') {
            steps {
                bat 'docker compose config -q'
            }
        }

        stage('Build Application Images') {
            steps {
                bat 'docker compose build product-service order-service inventory-service frontend'
            }
        }
    }

    post {
        success {
            echo 'Capstone application images built successfully!'
        }
        failure {
            echo 'Pipeline failed. Check Console Output.'
        }
    }
}
