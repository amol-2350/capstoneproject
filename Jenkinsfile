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

        stage('Tag Images') {
            steps {
                bat 'docker tag capstone-ci-cd-frontend:latest amol2350/capstone-frontend:latest'
                bat 'docker tag capstone-ci-cd-product-service:latest amol2350/capstone-product-service:latest'
                bat 'docker tag capstone-ci-cd-order-service:latest amol2350/capstone-order-service:latest'
                bat 'docker tag capstone-ci-cd-inventory-service:latest amol2350/capstone-inventory-service:latest'
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-creds') {
                        docker.image('amol2350/capstone-frontend:latest').push()
                        docker.image('amol2350/capstone-product-service:latest').push()
                        docker.image('amol2350/capstone-order-service:latest').push()
                        docker.image('amol2350/capstone-inventory-service:latest').push()
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Build and Docker Hub push completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check Console Output.'
        }
    }
}
