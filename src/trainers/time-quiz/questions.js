// Банк вопросов для режима «a.m./p.m. и ошибки».
// Первый вариант в options — правильный (порядок перемешивается при показе).

export const QUESTIONS = [
  {
    task: 'Which is correct?',
    options: ['thirteen minutes past nine', 'thirteen past nine'],
    explain: 'Если минут не кратно пяти, слово minutes обязательно: thirteen minutes past nine.',
  },
  {
    task: 'Which is correct?',
    options: ['five past seven', 'five past seven o\'clock'],
    explain: 'O\'clock говорят только про ровный час: seven o\'clock. С минутами — без него.',
  },
  {
    task: 'Как сказать 14:30?',
    options: ['half past two p.m.', 'half past two a.m.', 'half past fourteen'],
    explain: 'После полудня — p.m. В британской речи часы называют от 1 до 12: half past two.',
  },
  {
    task: '5 a.m. — это…',
    options: ['5 утра', '5 вечера'],
    explain: 'a.m. (ante meridiem) — до полудня, p.m. (post meridiem) — после полудня.',
  },
  {
    task: '12:00 дня — это…',
    options: ['midday / noon', 'midnight'],
    explain: 'Полдень — midday (или noon), полночь — midnight. Так проще, чем гадать с 12 a.m./p.m.',
  },
  {
    task: '00:00 — это…',
    options: ['midnight', 'midday'],
    explain: 'Полночь — midnight.',
  },
  {
    task: 'Британец говорит: «See you at half three». Это…',
    options: ['3:30', '2:30'],
    explain: 'Разговорное half three = half past three = 3:30. Не путайте с русским «пол третьего» (2:30)!',
  },
  {
    task: 'It\'s ten to six. Это…',
    options: ['5:50', '6:10', '6:50'],
    explain: 'To — «до»: до шести осталось десять минут → 5:50.',
  },
  {
    task: 'It\'s twenty past one. Это…',
    options: ['1:20', '12:40', '1:40'],
    explain: 'Past — «после»: после часа прошло двадцать минут → 1:20.',
  },
  {
    task: 'Как сказать 7:45?',
    options: ['quarter to eight', 'quarter to seven', 'quarter past eight'],
    explain: 'Минутная стрелка слева — называем следующий час: quarter to eight.',
  },
  {
    task: 'Встреча в пять часов. The meeting is ___ five o\'clock.',
    options: ['at', 'in', 'on'],
    explain: 'С точным временем — предлог at: at five o\'clock, at half past six.',
  },
  {
    task: 'I usually get up early ___ the morning.',
    options: ['in', 'at', 'on'],
    explain: 'In the morning / in the afternoon / in the evening.',
  },
  {
    task: 'I can\'t sleep ___ night.',
    options: ['at', 'in', 'on'],
    explain: 'Исключение: at night (а не in the night).',
  },
  {
    task: 'Как сказать 23:00?',
    options: ['eleven o\'clock at night', 'eleven o\'clock in the night', 'twenty-three o\'clock'],
    explain: 'Поздний вечер и ночь — at night. Часы — от 1 до 12.',
  },
  {
    task: 'Как сказать 18:30?',
    options: ['half past six in the evening', 'half past six in the morning', 'half past eighteen'],
    explain: 'С 17 до 21 — in the evening. Часы называем по 12-часовой шкале.',
  },
  {
    task: 'Как правильно спросить, который час?',
    options: ['What time is it?', 'What time it is?', 'How much time is it?'],
    explain: 'What time is it? — прямой вопрос. Ещё можно: What\'s the time?',
  },
  {
    task: '«Do you have the time?» значит…',
    options: ['Не подскажете, который час?', 'У вас есть свободное время?'],
    explain: 'The time — «точное время». Про свободное время: Do you have time?',
  },
  {
    task: 'Как сказать 13:05 по-британски?',
    options: ['five past one in the afternoon', 'five past thirteen', 'thirteen five'],
    explain: 'В речи — 12-часовая шкала: five past one (in the afternoon).',
  },
  {
    task: '6:30 утра — это…',
    options: ['half past six in the morning', 'half past six in the evening', 'half to seven'],
    explain: 'Утро — in the morning. «Half to» в английском не бывает — только half past.',
  },
  {
    task: 'Как сказать 9:15?',
    options: ['quarter past nine', 'fifteen to nine', 'quarter to nine'],
    explain: '15 минут после — quarter past. Можно и a quarter past nine.',
  },
];
