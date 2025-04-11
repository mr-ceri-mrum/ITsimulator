# Руководство по устранению проблем

## Общие проблемы и их решение

### 1. Ошибки импорта компонентов

Если вы видите ошибки типа:
```
Module not found: Error: Can't resolve '../dashboard/Dashboard' in '...'
```

**Решение:**
- Проверьте правильность путей импорта в ваших компонентах
- Убедитесь, что компоненты находятся в ожидаемых директориях или обновите пути импорта

В рамках рефакторинга была предложена новая структура папок, но не все компоненты были перемещены. Возможные проблемы:

1. В `src/components/game/GameInterface.js` были исправлены пути к импортируемым компонентам:
   ```js
   import Header from '../Header';
   import Sidebar from '../Sidebar';
   import Dashboard from '../Dashboard';
   // и так далее
   ```

2. В `src/App.js` путь к StartGame.js был изменен на:
   ```js
   import StartGame from './components/game/StartGame';
   ```

### 2. Отсутствие функциональности хранилища

Если вы видите ошибки, связанные с функциями из хранилища Zustand:

**Решение:**
- Убедитесь, что все необходимые срезы (slices) были созданы в `/src/store/slices/`
- Проверьте, что они правильно экспортируются и импортируются в `src/store/index.js`

```js
// src/store/index.js
import { create } from 'zustand';
import createGameStateSlice from './slices/gameStateSlice';
import createCompanySlice from './slices/companySlice';
// и другие срезы

export const useGameStore = create((set, get) => ({
  ...createGameStateSlice(set, get),
  ...createCompanySlice(set, get),
  // и так далее
}));
```

### 3. Отсутствие стилей или CSS ошибки

**Решение:**
- Убедитесь, что все CSS классы, используемые в новых компонентах, определены в файле `src/index.css`
- При необходимости добавьте новые стили, соответствующие новым компонентам, например:

```css
/* Стили для уведомлений */
.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.notification {
  margin-bottom: 10px;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 300px;
}

.notification-info {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.notification-success {
  background-color: #e8f5e9;
  border-left: 4px solid #4caf50;
}

.notification-warning {
  background-color: #fff8e1;
  border-left: 4px solid #ff9800;
}

.notification-error {
  background-color: #ffebee;
  border-left: 4px solid #f44336;
}

.notification-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  margin-left: 10px;
}
```

### 4. Проблемы с игровым циклом

**Решение:**
- Проверьте, что хук `useGameTick` правильно импортирован и используется в `GameInterface.js`
- Убедитесь, что функция `tick` доступна в хранилище и передается в хук

```js
// src/components/game/GameInterface.js
import useGameTick from '../../hooks/useGameTick';

// ...
const { tick, gameSpeed, isPaused } = useGameStore(/* ... */);
useGameTick(tick, gameSpeed, isPaused);
```

### 5. Поэтапная миграция

Для постепенного перехода на новую архитектуру рекомендуется:

1. Сначала изменить только структуру хранилища, сохранив всё остальное как есть
2. Затем постепенно перемещать компоненты в новые папки, обновляя импорты
3. Добавлять новые компоненты (Notifications и др.) только после того, как основа работает

## Полезные советы

1. **Используйте консоль браузера** для обнаружения ошибок JavaScript

2. **Временные решения**: Если какая-то функциональность не работает, можно временно использовать условные проверки:
   ```js
   // Проверяем, существует ли функция перед вызовом
   if (showSuccessNotification) {
     showSuccessNotification('Сообщение', 5000);
   }
   ```

3. **Откат изменений**: Если что-то не работает, можно откатиться к предыдущей версии и постепенно вносить изменения:
   ```bash
   git checkout [имя_файла]
   ```

4. **Модульное тестирование**: Проверяйте каждый компонент и функциональность отдельно перед интеграцией

## Дальнейшие улучшения

После устранения основных проблем, рекомендуется продолжить рефакторинг:

1. Постепенно перемещать все компоненты в соответствующие директории
2. Продолжить разделение больших компонентов на более мелкие и переиспользуемые
3. Добавить типизацию с помощью TypeScript
4. Создать файлы стилей для каждого компонента или группы компонентов
