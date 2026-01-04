import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { setupBackButton, hapticFeedback, showConfirm } from '../utils/telegram';
import { BODY_ZONES } from '../types';

export default function EntryView() {
  const { id } = useParams<{ id: string }>();
  const { entries, currentEntry, updateCurrentEntry, loadEntryForEditing, updateExistingEntry, resetCurrentEntry, editingEntryId } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'situation' | 'thoughts' | 'body' | 'consequences' | 'withoutProblem'>('situation');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (id && !editingEntryId) {
      loadEntryForEditing(id);
    }
  }, [id, editingEntryId, loadEntryForEditing]);

  useEffect(() => {
    if (editingEntryId) {
      setHasChanges(true);
    }
  }, [currentEntry, editingEntryId]);

  useEffect(() => {
    setupBackButton(async () => {
      if (hasChanges) {
        const confirmed = await showConfirm('Выйти без сохранения изменений?');
        if (confirmed) {
          resetCurrentEntry();
          navigate('/');
        }
      } else {
        resetCurrentEntry();
        navigate('/');
      }
    });
  }, [navigate, hasChanges, resetCurrentEntry]);

  const handleBack = async () => {
    hapticFeedback('light');
    if (hasChanges) {
      const confirmed = await showConfirm('Выйти без сохранения изменений?');
      if (confirmed) {
        resetCurrentEntry();
        navigate('/');
      }
    } else {
      resetCurrentEntry();
      navigate('/');
    }
  };

  const handleSave = async () => {
    hapticFeedback('medium');
    try {
      await updateExistingEntry();
      navigate('/');
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const handleZoneToggle = (zone: string) => {
    hapticFeedback('light');
    const newZones = currentEntry.bodyZones.includes(zone)
      ? currentEntry.bodyZones.filter(z => z !== zone)
      : [...currentEntry.bodyZones, zone];
    updateCurrentEntry('bodyZones', newZones);
  };

  const entry = entries.find(e => e.id === id);
  if (!entry && !editingEntryId) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Запись не найдена
          </h2>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'situation' as const, label: 'Ситуация', icon: 'description' },
    { id: 'thoughts' as const, label: 'Мысли', icon: 'psychology' },
    { id: 'body' as const, label: 'Тело', icon: 'accessibility' },
    { id: 'consequences' as const, label: 'Последствия', icon: 'crisis_alert' },
    { id: 'withoutProblem' as const, label: 'Без проблемы', icon: 'sentiment_satisfied' },
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 pb-2 sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm">
        <button
          onClick={handleBack}
          className="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-surface-dark transition-colors"
        >
          <span className="material-symbols-outlined text-[24px] text-slate-900 dark:text-white">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight text-center text-slate-900 dark:text-white truncate max-w-[200px]">
          {entry?.title || 'Редактирование'}
        </h2>
        <div className="size-10" />
      </header>

      {/* Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 px-4 py-3 border-b border-slate-200 dark:border-border-dark">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); hapticFeedback('light'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-surface-dark/70'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-4 pb-32 pt-4">
        {activeTab === 'situation' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
                Описание ситуации
              </label>
              <textarea
                value={currentEntry.situation}
                onChange={(e) => updateCurrentEntry('situation', e.target.value)}
                className="w-full min-h-[200px] p-4 rounded-xl bg-white dark:bg-surface-dark border-2 border-transparent focus:border-primary/50 focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none transition-all shadow-sm"
                placeholder="Опишите факты, без эмоций и интерпретаций..."
              />
            </div>
          </div>
        )}

        {activeTab === 'thoughts' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
                О чём думаю
              </label>
              <textarea
                value={currentEntry.thoughts}
                onChange={(e) => updateCurrentEntry('thoughts', e.target.value)}
                className="w-full min-h-[200px] p-4 rounded-xl bg-white dark:bg-surface-dark border-2 border-transparent focus:border-primary/50 focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none transition-all shadow-sm"
                placeholder="Какие мысли крутятся в голове..."
              />
            </div>
          </div>
        )}

        {activeTab === 'body' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
                Ощущения в теле
              </label>
              <textarea
                value={currentEntry.bodyFeelings}
                onChange={(e) => updateCurrentEntry('bodyFeelings', e.target.value)}
                className="w-full min-h-[150px] p-4 rounded-xl bg-white dark:bg-surface-dark border-2 border-transparent focus:border-primary/50 focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none transition-all shadow-sm"
                placeholder="Опишите физические ощущения..."
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 block">
                Части тела
              </label>
              <div className="grid grid-cols-2 gap-3">
                {BODY_ZONES.map(zone => (
                  <button
                    key={zone}
                    onClick={() => handleZoneToggle(zone)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all ${
                      currentEntry.bodyZones.includes(zone)
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-border-dark'
                    }`}
                  >
                    {zone}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'consequences' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
                Как это мешает жить
              </label>
              <textarea
                value={currentEntry.consequences}
                onChange={(e) => updateCurrentEntry('consequences', e.target.value)}
                className="w-full min-h-[200px] p-4 rounded-xl bg-white dark:bg-surface-dark border-2 border-transparent focus:border-primary/50 focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none transition-all shadow-sm"
                placeholder="Какие проблемы это создаёт..."
              />
            </div>
          </div>
        )}

        {activeTab === 'withoutProblem' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
                Что бы я делал без проблемы
              </label>
              <textarea
                value={currentEntry.withoutProblem}
                onChange={(e) => updateCurrentEntry('withoutProblem', e.target.value)}
                className="w-full min-h-[200px] p-4 rounded-xl bg-white dark:bg-surface-dark border-2 border-transparent focus:border-primary/50 focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none transition-all shadow-sm"
                placeholder="Как бы изменилась жизнь..."
              />
            </div>
          </div>
        )}
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-linear-to-t from-background-light via-background-light to-transparent dark:from-background-dark dark:via-background-dark dark:to-transparent pt-12">
        <div className="flex gap-4 max-w-lg mx-auto w-full">
          <button
            onClick={handleSave}
            className="h-12 w-full rounded-xl bg-primary text-white font-semibold text-base shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">save</span>
            Сохранить изменения
          </button>
        </div>
        <div className="h-4" />
      </div>
    </div>
  );
}
