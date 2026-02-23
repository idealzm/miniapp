# Telegram Web App — VPN для обхода блокировок

Веб-приложение для Telegram канала с VPN-сервисами.

## 📁 Структура проекта

```
miniapp/
├── index.html          # Основная разметка
├── styles.css          # Стили (тёмная тема, адаптив)
├── script.js           # Логика и интеграция с Telegram
├── data.json           # Данные карточек VPN
├── README.md           # Этот файл
├── nginx.conf          # Конфигурация nginx для VPS
├── .htaccess           # Конфигурация Apache для VPS
├── INSTRUCTION_GUIDE.md# Руководство по настройке
├── images/             # Скриншоты (опционально)
└── videos/             # Видеофайлы (опционально)
```

## 🔧 Исправления и улучшения

### Безопасность
- ✅ Добавлено экранирование HTML для защиты от XSS-атак
- ✅ Добавлен атрибут `rel="noopener noreferrer"` для внешних ссылок
- ✅ Заменены inline-обработчики (`onclick`) на `addEventListener`

### Стабильность
- ✅ Обработка ошибок при загрузке `data.json`
- ✅ Проверка на существование DOM-элементов
- ✅ Обработка случая, когда `instruction.steps` не определён
- ✅ Защита от отсутствия `countryCode`

### Работа вне Telegram
- ✅ Добавлен фоллбэк для `window.Telegram.WebApp`
- ✅ Обработка недоступности `localStorage`

### Производительность
- ✅ Исправлена утечка памяти в confetti-анимации
- ✅ Добавлено кэширование статических файлов

## 🚀 Быстрый старт

### 1. Создайте Telegram бота

1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте `/newbot`
3. Введите имя и username бота
4. Сохраните полученный **токен**

### 2. Настройте Web App

1. В BotFather отправьте `/mybots`
2. Выберите вашего бота
3. **Bot Settings** → **Menu Button** → **Configure Menu Button**
4. Отправьте ссылку на веб-приложение (см. деплой ниже)
5. Введите название кнопки (например, "VPN")

### 3. Добавьте Web App в канал

**Вариант 1: Кнопка в боте**
```
https://t.me/your_bot/appname
```

**Вариант 2: Прямая ссылка**
```
https://t.me/your_bot/webapp
```

## 🌐 Деплой (хостинг)

### Деплой на VPS (nginx)

**1. Подготовка сервера:**
```bash
# Обновите пакеты
sudo apt update && sudo apt upgrade -y

# Установите nginx
sudo apt install nginx -y

# Создайте директорию для приложения
sudo mkdir -p /var/www/miniapp
sudo chown -R $USER:$USER /var/www/miniapp
```

**2. Загрузите файлы:**
```bash
# Скопируйте файлы на сервер
scp -r * user@your-server-ip:/var/www/miniapp/
```

**3. Настройте nginx:**
```bash
# Скопируйте конфигурацию
sudo cp nginx.conf /etc/nginx/sites-available/miniapp

# Отредактируйте домен в конфиге
sudo nano /etc/nginx/sites-available/miniapp
# Замените your-domain.com на ваш домен

# Включите сайт
sudo ln -s /etc/nginx/sites-available/miniapp /etc/nginx/sites-enabled/

# Проверьте конфигурацию
sudo nginx -t

# Перезапустите nginx
sudo systemctl restart nginx
```

**4. Настройте SSL (Let's Encrypt):**
```bash
# Установите Certbot
sudo apt install certbot python3-certbot-nginx -y

# Получите сертификат
sudo certbot --nginx -d your-domain.com

# Автоматическое обновление сертификатов
sudo certbot renew --dry-run
```

### Деплой на VPS (Apache)

**1. Подготовка сервера:**
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install apache2 -y
```

**2. Загрузите файлы:**
```bash
sudo mkdir -p /var/www/miniapp
sudo chown -R $USER:$USER /var/www/miniapp
scp -r * user@your-server-ip:/var/www/miniapp/
```

**3. Настройте виртуальный хост:**
```bash
sudo nano /etc/apache2/sites-available/miniapp.conf
```

Добавьте конфигурацию:
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/miniapp
    
    <Directory /var/www/miniapp>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

**4. Включите сайт и SSL:**
```bash
sudo a2ensite miniapp
sudo a2enmod ssl rewrite headers
sudo systemctl restart apache2
```

**5. Настройте SSL:**
```bash
sudo apt install certbot python3-certbot-apache -y
sudo certbot --apache -d your-domain.com
```

### GitHub Pages (рекомендуется для бесплатного хостинга)

1. Создайте репозиторий на GitHub
2. Загрузите файлы проекта
3. Settings → Pages → Branch: `main`, Folder: `/ (root)`
4. Получите ссылку: `https://username.github.io/repo-name/`

### Vercel

1. Зарегистрируйтесь на [vercel.com](https://vercel.com)
2. `Add New Project` → импортируйте репозиторий
3. Деплой автоматически
4. Получите ссылку: `https://project-name.vercel.app`

### Netlify

1. Зарегистрируйтесь на [netlify.com](https://netlify.com)
2. Перетащите папку с файлами в браузер
3. Получите ссылку: `https://project-name.netlify.app`

## 📝 Настройка контента

### Добавление/удаление карточек VPN

Откройте `data.json` и редактируйте массив `cards`:

```json
{
  "cards": [
    {
      "id": "unique_id",
      "title": "Название VPN",
      "description": "Описание сервиса",
      "buttonText": "📖 Инструкция",
      "buttonAction": "openInstruction",
      "websiteUrl": "https://vpn-website.com",
      "websiteText": "Сайт",
      "instruction": {
        "title": "📖 Инструкция по настройке",
        "steps": [
          {
            "title": "Шаг 1: Скачивание",
            "items": [
              "Перейдите на сайт",
              "Скачайте приложение",
              "Установите"
            ]
          }
        ],
        "footer": "✅ Готово!"
      }
    }
  ]
}
```

### Поля карточки:

| Поле | Описание |
|------|----------|
| `id` | Уникальный идентификатор (латиница) |
| `title` | Заголовок карточки |
| `description` | Описание VPN-сервиса |
| `buttonText` | Текст кнопки действия |
| `buttonAction` | Функция при клике (например, `openInstruction`) |
| `websiteUrl` | Ссылка на сайт VPN |
| `websiteText` | Текст кнопки сайта |
| `instruction` | Объект с инструкцией (опционально) |

### Чтобы добавить бейдж "NEW!":
Просто добавьте `NEW!` в начало `title` — бейдж добавится автоматически.

### Пример добавления второго VPN:

```json
{
  "cards": [
    {
      "id": "amnezia_wg",
      "title": "NEW! AmneziaWG",
      "description": "Современный VPN на базе WireGuard",
      "buttonText": "📖 Инструкция",
      "buttonAction": "openInstruction",
      "websiteUrl": "https://amnezia.org",
      "websiteText": "Сайт",
      "instruction": { ... }
    },
    {
      "id": "outline",
      "title": "Outline VPN",
      "description": "Простой и надёжный VPN от Jigsaw",
      "buttonText": "📖 Инструкция",
      "buttonAction": "openInstruction",
      "websiteUrl": "https://getoutline.org",
      "websiteText": "Сайт",
      "instruction": { ... }
    }
  ]
}
```

## 🔧 Интеграция с ботом (Python)

```python
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "Нажмите кнопку ниже, чтобы открыть VPN:",
        reply_markup={
            "keyboard": [[{
                "text": "🛡️ VPN Сервисы",
                "web_app": {"url": "https://your-webapp-url.com"}
            }]],
            "resize_keyboard": True
        }
    )

app = Application.builder().token("YOUR_BOT_TOKEN").build()
app.add_handler(CommandHandler("start", start))
app.run_polling()
```

## 🎨 Кастомизация

### Изменить цвета

В `styles.css` найдите `:root`:

```css
:root {
    --accent: #2481cc;        /* Основной цвет */
    --bg-primary: #0f0f0f;    /* Фон */
}
```

### Добавить новые VPN-карточки

В `index.html` добавьте в секцию `.cards-grid`:

```html
<div class="card">
    <div class="card-icon">🔐</div>
    <h3>Название VPN</h3>
    <p>Описание сервиса</p>
    <div class="card-actions">
        <a href="#" class="btn btn-primary">Скачать</a>
        <a href="#" class="btn btn-secondary">Сайт</a>
    </div>
</div>
```

## 📱 Тестирование

1. Откройте `index.html` в браузере
2. Или отправьте ссылку себе в Telegram
3. Проверьте все кнопки

## ⚠️ Важно

- **HTTPS обязателен** для продакшена (Telegram WebApp требует безопасное соединение)
- Web App работает только внутри Telegram
- Для кастомного домена используйте `/setdomain` в BotFather
- **Проверьте права доступа** к файлам на VPS:
  ```bash
  sudo chown -R www-data:www-data /var/www/miniapp
  sudo chmod -R 755 /var/www/miniapp
  ```
- **Откройте порты** в фаерволе:
  ```bash
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw enable
  ```

---

**Готово!** Ваше VPN Web App готово к использованию 🎉
