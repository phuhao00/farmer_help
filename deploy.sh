#!/bin/bash

# 一键部署脚本
echo "开始部署 Farmer Help 系统..."

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "错误: Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "错误: Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 停止并删除现有容器
echo "停止现有容器..."
docker-compose down

# 构建并启动服务
echo "构建并启动服务..."
docker-compose up --build -d

# 等待服务启动
echo "等待服务启动..."
sleep 10

# 检查服务状态
echo "检查服务状态..."
docker-compose ps

# 显示访问信息
echo ""
echo "部署完成！"
echo "================================"
echo "服务访问地址："
echo "前端: http://localhost:3000"
echo "后端API: http://localhost:8080"
echo "MongoDB: localhost:27018"
echo "Nginx: http://localhost:80 (生产环境)"
echo "================================"
echo ""
echo "查看日志命令："
echo "docker-compose logs -f"
echo ""
echo "停止服务命令："
echo "docker-compose down"