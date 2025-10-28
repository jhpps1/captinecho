// ==============================================
// Captain Echo CI/CD Pipeline
// ==============================================
// 프로젝트: S13P31D101
// 브랜치 전략:
//   - develop: 개발 서버 자동 배포
//   - master: 프로덕션 서버 자동 배포

pipeline {
    agent any

    environment {
        // 프로젝트 정보
        PROJECT_NAME = 'captain-echo'

        // Git 정보
        GIT_BRANCH = "${env.BRANCH_NAME ?: 'develop'}"

        // 배포 환경 결정
        DEPLOY_ENV = "${env.BRANCH_NAME == 'master' ? 'prod' : 'dev'}"
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
                echo "🚀 Captain Echo CI/CD Pipeline"
                echo "📌 Branch: ${GIT_BRANCH} | Environment: ${DEPLOY_ENV}"
                sh 'docker --version && docker compose version'
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
                        sh '''
                            docker build \
                                -t captain-echo-backend:latest \
                                --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
                                --build-arg VCS_REF=$(git rev-parse --short HEAD) \
                                .
                        '''
                    }
                }
            }
        }

        stage('Frontend 빌드') {
            steps {
                echo '🎨 Frontend Docker 이미지 빌드 중...'
                script {
                    dir('frontend') {
                        sh '''
                            docker build \
                                -t captain-echo-frontend:latest \
                                --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
                                --build-arg VCS_REF=$(git rev-parse --short HEAD) \
                                .
                        '''
                    }
                }
            }
        }

        stage('개발 서버 배포') {
            steps {
                script {
                    // develop 브랜치 체크
                    if (GIT_BRANCH != 'develop' && !GIT_BRANCH.endsWith('/develop')) {
                        echo "⏭️  develop 브랜치가 아님 - 배포 건너뜀 (현재: ${GIT_BRANCH})"
                        return
                    }

                    // MR이 merge된 경우에만 배포 (merge commit 감지)
                    def commitMsg = sh(returnStdout: true, script: 'git log -1 --pretty=%B').trim()
                    def isMerge = commitMsg.contains('Merge branch') ||
                                  commitMsg.contains('Merge request') ||
                                  commitMsg.startsWith('Merge')

                    if (!isMerge) {
                        echo "⏭️  일반 commit - 배포 건너뜀: ${commitMsg}"
                        return
                    }

                    echo "✅ Merge commit 감지: ${commitMsg}"
                    echo '🚢 개발 서버(EC2)에 배포 중...'
                    sh '''
                        # Docker Compose로 개발 서버 재배포 (prod.yml 사용)
                        docker compose -f infrastructure/docker/docker-compose.prod.yml down
                        docker compose -f infrastructure/docker/docker-compose.prod.yml up -d --remove-orphans

                        # 헬스체크
                        echo "Waiting for services to start..."
                        sleep 20

                        echo "Backend Health Check:"
                        curl -f http://localhost:8080/api/health || echo "Backend not ready yet"

                        echo "Frontend Health Check:"
                        curl -f http://localhost/health || echo "Frontend not ready yet"

                        echo "✅ Development deployment successful!"
                    '''
                }
            }
        }

        stage('프로덕션 서버 배포') {
            steps {
                script {
                    // master 브랜치 체크
                    if (GIT_BRANCH != 'master' && !GIT_BRANCH.endsWith('/master')) {
                        echo "⏭️  master 브랜치가 아님 - 배포 건너뜀 (현재: ${GIT_BRANCH})"
                        return
                    }

                    echo '🚀 프로덕션 서버에 배포 중...'
                    sh '''
                        # Docker Compose로 프로덕션 재배포
                        docker compose -f infrastructure/docker/docker-compose.prod.yml down
                        docker compose -f infrastructure/docker/docker-compose.prod.yml up -d --remove-orphans

                        # 헬스체크
                        echo "Waiting for services to start..."
                        sleep 20

                        echo "Backend Health Check:"
                        curl -f http://localhost:8080/api/health || exit 1

                        echo "Frontend Health Check:"
                        curl -f http://localhost/health || exit 1

                        echo "✅ Production deployment successful!"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ 빌드 및 배포 성공!"
        }

        failure {
            echo "❌ 빌드 또는 배포 실패!"
        }

        always {
            echo '🧹 Docker 이미지 정리 중...'
            sh 'docker image prune -f'
        }
    }
}
