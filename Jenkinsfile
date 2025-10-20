// ==============================================
// Captain Echo CI/CD Pipeline
// ==============================================
// 프로젝트: S13P31D101
// 빌드 타겟: ARM64 (EC2 c6g.2xlarge)

pipeline {
    agent any

    environment {
        // Docker Registry (Docker Hub 또는 Private Registry)
        DOCKER_REGISTRY = 'your-dockerhub-username'

        // 프로젝트 정보
        PROJECT_NAME = 'captain-echo'
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/${PROJECT_NAME}-backend"
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/${PROJECT_NAME}-frontend"

        // Git 정보
        GIT_BRANCH = "${env.BRANCH_NAME ?: 'infra'}"

        // 빌드 번호
        BUILD_TAG = "${env.BUILD_NUMBER}"
    }

    options {
        // 빌드 히스토리 유지
        buildDiscarder(logRotator(numToKeepStr: '10'))

        // 타임아웃 설정
        timeout(time: 30, unit: 'MINUTES')

        // 동시 빌드 방지
        disableConcurrentBuilds()
    }

    stages {
        stage('환경 확인') {
            steps {
                script {
                    echo "======================================"
                    echo "Captain Echo CI/CD Pipeline"
                    echo "======================================"
                    echo "Branch: ${GIT_BRANCH}"
                    echo "Build: #${BUILD_TAG}"
                    echo "======================================"

                    sh '''
                        echo "Docker Version:"
                        docker --version
                        echo ""
                        echo "Docker Compose Version:"
                        docker compose version
                        echo ""
                        echo "Architecture:"
                        uname -m
                    '''
                }
            }
        }

        stage('코드 체크아웃') {
            steps {
                echo '📦 GitLab에서 코드 체크아웃 중...'
                checkout scm
            }
        }

        stage('Backend 빌드') {
            steps {
                echo '🏗️ Backend Docker 이미지 빌드 중...'
                script {
                    dir('backend') {
                        sh """
                            docker build \
                                -t ${BACKEND_IMAGE}:${BUILD_TAG} \
                                -t ${BACKEND_IMAGE}:latest \
                                --build-arg BUILD_DATE=\$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
                                --build-arg VCS_REF=\$(git rev-parse --short HEAD) \
                                .
                        """
                    }
                }
            }
        }

        stage('Frontend 빌드') {
            steps {
                echo '🎨 Frontend Docker 이미지 빌드 중...'
                script {
                    dir('frontend') {
                        sh """
                            docker build \
                                -t ${FRONTEND_IMAGE}:${BUILD_TAG} \
                                -t ${FRONTEND_IMAGE}:latest \
                                --build-arg BUILD_DATE=\$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
                                --build-arg VCS_REF=\$(git rev-parse --short HEAD) \
                                .
                        """
                    }
                }
            }
        }

        stage('이미지 푸시') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    branch 'infra'
                }
            }
            steps {
                echo '🚀 Docker Hub에 이미지 푸시 중...'
                script {
                    // Docker Hub 로그인 (Jenkins Credentials 사용)
                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh '''
                            echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin

                            # Backend 푸시
                            docker push ${BACKEND_IMAGE}:${BUILD_TAG}
                            docker push ${BACKEND_IMAGE}:latest

                            # Frontend 푸시
                            docker push ${FRONTEND_IMAGE}:${BUILD_TAG}
                            docker push ${FRONTEND_IMAGE}:latest

                            docker logout
                        '''
                    }
                }
            }
        }

        stage('EC2 배포') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                echo '🚢 EC2 서버에 배포 중...'
                script {
                    // EC2 SSH 접속 (Jenkins Credentials 사용)
                    withCredentials([sshUserPrivateKey(
                        credentialsId: 'ec2-ssh-key',
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    )]) {
                        sh '''
                            # EC2 서버 IP
                            EC2_HOST="13.209.41.60"

                            # SSH 접속 및 배포
                            ssh -o StrictHostKeyChecking=no \
                                -i $SSH_KEY \
                                $SSH_USER@$EC2_HOST << 'ENDSSH'

                            cd /home/ubuntu/projects/S13P31D101

                            # Git Pull
                            git pull origin ${GIT_BRANCH}

                            # Docker Compose로 재배포
                            docker compose -f infrastructure/docker/docker-compose.prod.yml pull
                            docker compose -f infrastructure/docker/docker-compose.prod.yml up -d --remove-orphans

                            # 헬스체크
                            echo "Waiting for services to start..."
                            sleep 10

                            echo "Backend Health Check:"
                            curl -f http://localhost:8080/api/health || exit 1

                            echo "Deployment successful!"
ENDSSH
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo '✅ 빌드 및 배포 성공!'
            // Slack 알림 (선택사항)
            // slackSend(color: 'good', message: "✅ Captain Echo 배포 성공! Build #${BUILD_TAG}")
        }

        failure {
            echo '❌ 빌드 또는 배포 실패!'
            // Slack 알림 (선택사항)
            // slackSend(color: 'danger', message: "❌ Captain Echo 배포 실패! Build #${BUILD_TAG}")
        }

        always {
            echo '🧹 Docker 이미지 정리 중...'
            sh '''
                # 댕글링 이미지 삭제
                docker image prune -f
            '''
        }
    }
}
