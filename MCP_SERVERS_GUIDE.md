# MCP Servers для Zenith Trainer (Cursor 2.0)

## Что такое MCP?

**Model Context Protocol (MCP)** — это стандартизированный протокол, который соединяет AI-ассистентов (Cursor) с внешними инструментами и источниками данных. Это как USB-C для AI — универсальное подключение.

---

## 🎯 Рекомендованные MCP серверы для вашего проекта

### 📦 Обязательные (Must-Have)

#### 1. **Firebase MCP**
**Для чего:** Прямой доступ к Firebase из Cursor AI

```json
{
  "mcpServers": {
    "firebase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-firebase"]
    }
  }
}
```

**Возможности:**
- Чтение/запись в Firestore
- Управление Authentication
- Доступ к Storage
- Просмотр структуры БД

**Альтернатива:** Firestore MCP Server
```bash
npm install -g @firestore/mcp-server
```

---

#### 2. **GitHub MCP**
**Для чего:** Работа с репозиторием, issues, pull requests

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

**Возможности:**
- Создание/управление issues
- Создание PR прямо из Cursor
- Просмотр коммитов и истории
- Поиск по коду

**Получить токен:** https://github.com/settings/tokens

---

#### 3. **Filesystem MCP**
**Для чего:** Умный поиск и анализ файлов проекта

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/studio"]
    }
  }
}
```

**Возможности:**
- Быстрый поиск файлов
- Анализ структуры проекта
- Чтение больших файлов
- Навигация по директориям

---

### 🔥 Очень полезные (Highly Recommended)

#### 4. **Google Docs/Drive MCP**
**Для чего:** Документация проекта, дизайн-доки, технические спецификации

```json
{
  "mcpServers": {
    "gdrive": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-gdrive"],
      "env": {
        "GOOGLE_CLIENT_ID": "your_client_id",
        "GOOGLE_CLIENT_SECRET": "your_client_secret"
      }
    }
  }
}
```

**Возможности:**
- Чтение Google Docs
- Синхронизация документации
- Доступ к техническим спецификациям
- Автоматическое обновление README

**Настройка:** https://console.cloud.google.com/apis/credentials

---

#### 5. **PostgreSQL/Database MCP** (если планируете миграцию с Firestore)
**Для чего:** Работа с SQL базами данных

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://user:pass@localhost:5432/db"
      }
    }
  }
}
```

**Возможности:**
- Генерация SQL запросов
- Просмотр схемы БД
- Миграции и seed данных
- Оптимизация запросов

---

#### 6. **Slack MCP**
**Для чего:** Интеграция с командой, уведомления

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-token",
        "SLACK_TEAM_ID": "T1234567"
      }
    }
  }
}
```

**Возможности:**
- Отправка сообщений в Slack
- Чтение истории каналов
- Поиск по сообщениям
- Интеграция с командой

**Получить токен:** https://api.slack.com/apps

---

### 💡 Дополнительные (Nice to Have)

#### 7. **Figma MCP**
**Для чего:** Доступ к дизайну UI/UX

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-figma"],
      "env": {
        "FIGMA_PERSONAL_ACCESS_TOKEN": "your_token"
      }
    }
  }
}
```

**Возможности:**
- Экспорт компонентов из Figma
- Генерация кода по дизайну
- Синхронизация UI компонентов
- Проверка дизайн-токенов

---

#### 8. **Notion MCP**
**Для чего:** База знаний, документация, заметки

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-notion"],
      "env": {
        "NOTION_API_KEY": "secret_your_key"
      }
    }
  }
}
```

**Возможности:**
- Чтение страниц Notion
- Создание/обновление документов
- Поиск по базе знаний
- Синхронизация TODO

**Получить API ключ:** https://www.notion.so/my-integrations

---

#### 9. **Linear MCP**
**Для чего:** Управление задачами и багами

```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-linear"],
      "env": {
        "LINEAR_API_KEY": "lin_api_your_key"
      }
    }
  }
}
```

**Возможности:**
- Создание/обновление issues
- Отслеживание прогресса задач
- Автоматическое закрытие issues
- Интеграция с git коммитами

**Получить API ключ:** https://linear.app/settings/api

---

#### 10. **Playwright MCP**
**Для чего:** Тестирование и отладка E2E тестов

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-playwright"]
    }
  }
}
```

**Возможности:**
- Генерация тестов из описаний
- Запуск и отладка тестов
- Анализ отчетов о тестировании
- Исправление падающих тестов

---

#### 11. **Web Search MCP (Brave/Google)**
**Для чего:** Поиск документации и примеров кода

```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your_api_key"
      }
    }
  }
}
```

**Возможности:**
- Поиск актуальной документации
- Поиск решений проблем
- Примеры кода из интернета
- Новости о технологиях

**Получить API ключ:** https://brave.com/search/api/

---

#### 12. **Sentry MCP**
**Для чего:** Мониторинг ошибок в продакшене

```json
{
  "mcpServers": {
    "sentry": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sentry"],
      "env": {
        "SENTRY_AUTH_TOKEN": "your_token",
        "SENTRY_ORG": "your_org",
        "SENTRY_PROJECT": "zenith-trainer"
      }
    }
  }
}
```

**Возможности:**
- Анализ ошибок
- Автоматическое исправление багов
- Создание issues из ошибок
- Мониторинг производительности

---

## 📁 Установка MCP серверов

### Способ 1: Глобальная конфигурация (для всех проектов)

Создайте файл `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "~"]
    }
  }
}
```

### Способ 2: Локальная конфигурация (только для этого проекта)

Создайте файл `.cursor/mcp.json` в корне проекта:

```json
{
  "mcpServers": {
    "firebase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-firebase"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "${workspaceFolder}"]
    }
  }
}
```

**Примечание:** `${workspaceFolder}` будет заменен на путь к проекту автоматически.

---

## 🚀 Быстрый старт (Top 3 для начала)

Для начала рекомендую установить только эти 3 сервера:

1. **GitHub** - для работы с репозиторием
2. **Filesystem** - для навигации по коду
3. **Firebase** - для работы с базой данных

Создайте `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/studio"]
    },
    "firebase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-firebase"]
    }
  }
}
```

Затем перезапустите Cursor.

---

## 🔧 Использование MCP в Cursor

После настройки MCP серверы доступны через:

1. **Команда:** `Cmd/Ctrl + K` → начните печатать команду
2. **Chat:** AI автоматически использует MCP когда нужно
3. **Inline:** AI предложит использовать MCP если это уместно

### Примеры команд:

```
"Search GitHub for similar implementations of workout tracking"
"Find all files that use Firebase useCollection hook"
"Create a GitHub issue for the TODO in habit-tracker.tsx"
"Show me the structure of workouts collection in Firestore"
```

---

## 📊 Приоритеты установки

### Фаза 1: Основа (сразу)
✅ GitHub MCP
✅ Filesystem MCP
✅ Firebase MCP

### Фаза 2: Расширение (через неделю)
✅ Notion/Google Docs MCP (документация)
✅ Slack MCP (если работаете в команде)
✅ Web Search MCP (для поиска решений)

### Фаза 3: Продвинутое (через месяц)
✅ Figma MCP (если используете дизайн)
✅ Linear MCP (если используете для задач)
✅ Sentry MCP (для продакшена)
✅ Playwright MCP (для улучшения тестов)

---

## 🔐 Безопасность

**ВАЖНО:**

1. **НЕ коммитьте** `.cursor/mcp.json` с токенами в git
2. Добавьте в `.gitignore`:
   ```
   .cursor/mcp.json
   ```

3. Используйте переменные окружения:
   ```json
   "env": {
     "GITHUB_TOKEN": "${GITHUB_TOKEN}"
   }
   ```

4. Создайте `.cursor/mcp.example.json` без токенов для команды

---

## 📚 Полезные ссылки

- **Cursor Docs:** https://docs.cursor.com/context/model-context-protocol
- **MCP Directory:** https://cursor.directory/mcp
- **Official MCP Servers:** https://github.com/cursor/mcp-servers
- **Awesome MCP List:** https://github.com/appcypher/awesome-mcp-servers
- **Community Examples:** https://dev.to/therealmrmumba/top-10-cursor-mcp-servers-in-2025-1nm7

---

## ❓ Troubleshooting

### MCP сервер не работает?

1. Проверьте синтаксис JSON (запятые, кавычки)
2. Проверьте права доступа к токенам
3. Перезапустите Cursor
4. Проверьте логи: `Help > Toggle Developer Tools > Console`

### Как узнать доступные команды MCP?

В Cursor Chat напишите:
```
@mcp list available commands
```

### Как обновить MCP серверы?

MCP серверы обновляются автоматически при использовании `npx -y`.

---

**Готово! Теперь ваш Cursor AI станет в 10 раз мощнее! 🚀**
