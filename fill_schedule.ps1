# fill_schedule.ps1
$baseUrl = "http://localhost:5000/api"

# Массив уроков на неделю
$lessons = @(
    @{day="Понедельник"; time="09:00-10:30"; subject="Математика"; teacher="Иванов И.И."; classroom="101"; group="10А"},
    @{day="Понедельник"; time="10:45-12:15"; subject="Физика"; teacher="Петрова А.С."; classroom="201"; group="10А"},
    @{day="Вторник"; time="09:00-10:30"; subject="Химия"; teacher="Сидорова М.В."; classroom="202"; group="10Б"},
    @{day="Среда"; time="13:00-14:30"; subject="Информатика"; teacher="Кузнецов А.П."; classroom="305"; group="10В"},
    @{day="Четверг"; time="10:45-12:15"; subject="Литература"; teacher="Смирнова О.Л."; classroom="102"; group="10А"},
    @{day="Пятница"; time="14:00-15:30"; subject="История"; teacher="Васильев П.Д."; classroom="103"; group="10Б"}
)

foreach ($lesson in $lessons) {
    $json = $lesson | ConvertTo-Json
    curl -X POST "${baseUrl}/schedule" `
        -H "Content-Type: application/json" `
        -d $json
    Write-Host "Добавлен урок: $($lesson.subject) в $($lesson.day) $($lesson.time)"
}