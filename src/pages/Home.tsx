import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { hapticFeedback, showConfirm } from '../utils/telegram';
import type { Entry } from '../types';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const entryDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (entryDate.getTime() === today.getTime()) {
    return 'Сегодня';
  }
  if (entryDate.getTime() === yesterday.getTime()) {
    return 'Вчера';
  }
  
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function getEmojiBackground(emoji: string): string {
  const emojiColors: Record<string, string> = {
    '😰': 'bg-orange-100 dark:bg-orange-500/20',
    '😨': 'bg-purple-100 dark:bg-purple-500/20',
    '😔': 'bg-blue-100 dark:bg-blue-500/20',
    '😌': 'bg-green-100 dark:bg-green-500/20',
    '😤': 'bg-red-100 dark:bg-red-500/20',
    '😢': 'bg-indigo-100 dark:bg-indigo-500/20',
    '😊': 'bg-yellow-100 dark:bg-yellow-500/20',
    '🤔': 'bg-cyan-100 dark:bg-cyan-500/20',
  };
  return emojiColors[emoji] || 'bg-gray-100 dark:bg-gray-500/20';
}

interface GroupedEntries {
  date: string;
  entries: Entry[];
}

export default function Home() {
  const { entries, isLoading, deleteEntry } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    
    const query = searchQuery.toLowerCase();
    return entries.filter(entry => 
      entry.title.toLowerCase().includes(query) ||
      entry.situation.toLowerCase().includes(query) ||
      entry.thoughts.toLowerCase().includes(query) ||
      entry.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [entries, searchQuery]);

  const groupedEntries = useMemo((): GroupedEntries[] => {
    const groups: Record<string, Entry[]> = {};
    
    filteredEntries.forEach(entry => {
      const dateKey = formatDate(entry.createdAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(entry);
    });
    
    return Object.entries(groups).map(([date, entries]) => ({ date, entries }));
  }, [filteredEntries]);

  const handleNewEntry = () => {
    hapticFeedback('light');
    navigate('/situation');
  };

  const handleOpenInstructions = () => {
    hapticFeedback('light');
    navigate('/instructions');
  };

  const handleDeleteEntry = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    hapticFeedback('medium');
    
    const confirmed = await showConfirm('Удалить эту запись?');
    if (confirmed) {
      await deleteEntry(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-light dark:bg-background-dark">
        <div className="animate-pulse text-text-secondary">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      {/* Header */}
      <header className="flex-none pt-2 pb-2 px-4 z-20 bg-background-light dark:bg-background-dark">
        <div className="flex items-center justify-between h-14">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Мои Записи
          </h1>
          <button 
            onClick={handleOpenInstructions}
            className="flex items-center justify-center size-10 rounded-full hover:bg-slate-200 dark:hover:bg-surface-dark transition-colors text-slate-900 dark:text-white"
          >
            <span className="material-symbols-outlined text-[28px]">settings</span>
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="mt-1 mb-2">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-secondary">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full h-11 pl-10 pr-4 text-base rounded-lg border-none bg-slate-200 dark:bg-surface-dark placeholder-text-secondary text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
              placeholder="Поиск по записям..."
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-4 pb-32">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Пока записей нет
            </h2>
            <p className="text-text-secondary max-w-xs">
              Нажмите «Новая запись», чтобы начать вести дневник самоанализа
            </p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Ничего не найдено
            </h2>
            <p className="text-text-secondary max-w-xs">
              Попробуйте изменить поисковый запрос
            </p>
          </div>
        ) : (
          <div className="space-y-3 mt-2">
            {groupedEntries.map(group => (
              <div key={group.date}>
                {/* Date Divider */}
                <div className="flex items-center py-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    {group.date}
                  </span>
                </div>
                
                {/* Entries */}
                {group.entries.map(entry => (
                  <article 
                    key={entry.id}
                    className="relative group active:scale-[0.98] transition-transform duration-100 mb-3"
                  >
                    <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex gap-4 bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-100 dark:border-transparent">
                      {/* Emoji */}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className={`flex items-center justify-center rounded-full size-12 text-2xl ${getEmojiBackground(entry.emoji)}`}>
                          {entry.emoji}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex flex-1 flex-col min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-base font-semibold text-slate-900 dark:text-white truncate pr-2">
                            {entry.title}
                          </h3>
                          <span className="text-xs font-medium text-text-secondary whitespace-nowrap">
                            {formatTime(entry.createdAt)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-slate-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-2">
                          {entry.situation}
                        </p>
                        
                        {/* Tags */}
                        {entry.tags.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            {entry.tags.map(tag => (
                              <span 
                                key={tag}
                                className="inline-flex items-center rounded-md bg-slate-100 dark:bg-surface-dark-alt px-2 py-1 text-xs font-medium text-slate-600 dark:text-text-secondary ring-1 ring-inset ring-gray-500/10"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Delete Button */}
                      <button 
                        onClick={(e) => handleDeleteEntry(e, entry.id)}
                        className="flex items-center justify-center text-text-secondary hover:text-red-500 transition-colors"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ))}
            
            {/* Bottom Spacer */}
            <div className="h-20" />
          </div>
        )}
      </main>

      {/* Floating Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-linear-to-t from-background-light via-background-light to-transparent dark:from-background-dark dark:via-background-dark pt-12 pb-6 z-30">
        <div className="flex flex-col gap-3 max-w-lg mx-auto w-full">
          <button 
            onClick={handleNewEntry}
            className="h-12 flex-1 rounded-xl bg-primary text-white font-semibold text-base shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Новая запись
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
          <button 
            onClick={handleOpenInstructions}
            className="flex items-center justify-center w-full bg-transparent hover:bg-slate-200 dark:hover:bg-surface-dark text-slate-600 dark:text-text-secondary font-medium h-10 rounded-lg transition-colors gap-2 text-sm"
          >
            <span className="material-symbols-outlined text-lg">menu_book</span>
            <span>Как это работает?</span>
          </button>
        </div>
      </div>
    </div>
  );
}

