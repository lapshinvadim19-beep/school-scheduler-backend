@echo off
REM fill_schedule.bat
set baseUrl=http://localhost:5000/api

echo Добавление тестового расписания...

curl -X POST %baseUrl%/schedule ^
  -H "Content-Type: application/json" ^
  -d "{\"day\":\"Понедельник\",\"time\":\"09:00-10:30\",\"subject\":\"Математика\",\"teacher\":\"Иванов И.И.\",\"classroom\":\"101\",\"group\":\"10А\"}"

curl -X POST %baseUrl%/schedule ^
  -H "Content-Type: application/json" ^
  -d "{\"day\":\"Понедельник\",\"time\":\"10:45-12:15\",\"subject\":\"Физика\",\"teacher\":\"Петрова А.С.\",\"classroom\":\"201\",\"group\":\"10А\"}"

curl -X POST %baseUrl%/schedule ^
  -H "Content-Type: application/json" ^
  -d "{\"day\":\"Вторник\",\"time\":\"09:00-10:30\",\"subject\":\"Химия\",\"teacher\":\"Сидорова М.В.\",\"classroom\":\"202\",\"group\":\"10Б\"}"

curl -X POST %baseUrl%/schedule ^
  -H "Content-Type: application/json" ^
  -d "{\"day\":\"Среда\",\"time\":\"13:00-14:30\",\"subject\":\"Информатика\",\"teacher\":\"Кузнецов А.П.\",\"classroom\":\"305\",\"group\":\"10В\"}"

echo.
echo Расписание успешно добавлено!
pause