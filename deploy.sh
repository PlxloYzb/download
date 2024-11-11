#!/bin/bash
# 部署代码
vercel deploy --prod

# 创建图片目录
ssh your-server "mkdir -p /path/to/images"

# 上传图片
scp -r ./images/* your-server:/path/to/images/ 