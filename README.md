# Farmer Help 系统一键部署

## 部署说明

本项目提供了一键部署脚本，支持 Linux/macOS 和 Windows 系统。

### 前置要求

- Docker
- Docker Compose

### 部署方式

#### Linux/macOS 系统
```bash
# 给脚本执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

#### Windows 系统
```cmd
# 直接运行批处理文件
deploy.bat
```

### 服务访问地址

部署完成后，可以通过以下地址访问各个服务：

- **前端**: http://localhost:3000
- **后端API**: http://localhost:8080
- **MongoDB**: localhost:27018
- **Nginx**: http://localhost:80 (生产环境)

### 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重新构建并启动
docker-compose up --build -d
```

### 服务说明

- **MongoDB**: 数据库服务，使用 mongo:7.0 镜像
- **Backend**: 后端服务，基于 Go 构建
- **Frontend**: 前端服务，基于 React 构建
- **Nginx**: 反向代理服务 (生产环境)
