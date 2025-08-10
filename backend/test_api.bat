@echo off
chcp 65001 >nul
echo 🧪 开始API测试...

set BASE_URL=http://127.0.0.1:7776

echo.
echo 📋 测试获取匹配池列表...
curl -X GET "%BASE_URL%/api/pools" ^
  -H "Content-Type: application/json" ^
  -w "^n状态码: %%{http_code}^n" ^
  -s

echo.
echo.
echo 📝 测试创建匹配池...
curl -X POST "%BASE_URL%/api/pools" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"测试匹配池\", \"description\": \"这是一个测试匹配池\", \"validUntil\": \"2024-12-31T23:59:59Z\", \"fields\": [{\"name\": \"name\", \"label\": \"姓名\", \"type\": \"text\", \"required\": true}, {\"name\": \"email\", \"label\": \"邮箱\", \"type\": \"email\", \"required\": true}]}" ^
  -w "^n状态码: %%{http_code}^n" ^
  -s

echo.
echo.
echo 👥 测试加入匹配池...
curl -X POST "%BASE_URL%/api/pools/join" ^
  -H "Content-Type: application/json" ^
  -d "{\"poolId\": 1, \"userData\": {\"name\": \"张三\", \"email\": \"zhangsan@example.com\"}, \"contactInfo\": \"zhangsan@example.com\"}" ^
  -w "^n状态码: %%{http_code}^n" ^
  -s

echo.
echo.
echo 📚 测试获取历史记录...
curl -X GET "%BASE_URL%/api/history" ^
  -H "Content-Type: application/json" ^
  -w "^n状态码: %%{http_code}^n" ^
  -s

echo.
echo.
echo 🔍 测试搜索用户...
curl -X POST "%BASE_URL%/api/users/search" ^
  -H "Content-Type: application/json" ^
  -d "{\"contactInfo\": \"zhangsan@example.com\"}" ^
  -w "^n状态码: %%{http_code}^n" ^
  -s

echo.
echo.
echo ✅ API测试完成！
pause
