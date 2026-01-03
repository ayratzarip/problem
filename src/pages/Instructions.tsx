import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setupBackButton, hapticFeedback } from '../utils/telegram';

interface InstructionItem {
  id: string;
  icon: string;
  iconColor: string;
  title: string;
  content: string;
}

const basicInstructions: InstructionItem[] = [
  {
    id: 'create',
    icon: 'edit_note',
    iconColor: 'text-primary bg-blue-500/10 dark:bg-blue-500/20',
    title: 'Как создать новую запись',
    content: 'Нажмите на синюю кнопку «+» в главном меню. Откроется форма, где вы сможете подробно описать ситуацию, которая вас беспокоит.',
  },
  {
    id: 'describe',
    icon: 'description',
    iconColor: 'text-primary bg-blue-500/10 dark:bg-blue-500/20',
    title: 'Что писать в описании',
    content: 'Опишите ситуацию объективно (факты). Укажите ваши мысли в этот момент. Честно признайтесь в ощущениях в теле.',
  },
];

const featureInstructions: InstructionItem[] = [
  {
    id: 'emotions',
    icon: 'psychology',
    iconColor: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 dark:bg-purple-500/20',
    title: 'Анализ эмоций',
    content: 'Система автоматически анализирует текст записи и предлагает вероятные когнитивные искажения. Вы можете подтвердить их или отклонить.',
  },
  {
    id: 'tags',
    icon: 'label',
    iconColor: 'text-green-600 dark:text-green-400 bg-green-500/10 dark:bg-green-500/20',
    title: 'Использование тегов',
    content: 'Добавляйте теги для быстрой фильтрации записей. Например: #работа, #семья, #тревога.',
  },
];

const securityInstructions: InstructionItem[] = [
  {
    id: 'privacy',
    icon: 'lock',
    iconColor: 'text-orange-600 dark:text-orange-400 bg-orange-500/10 dark:bg-orange-500/20',
    title: 'Конфиденциальность',
    content: 'Ваши записи хранятся локально на устройстве и в зашифрованном облаке Telegram. Никто, кроме вас, не имеет к ним доступа.',
  },
];

function InstructionGroup({ title, items }: { title?: string; items: InstructionItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    hapticFeedback('light');
    setOpenId(openId === id ? null : id);
  };

  return (
    <div>
      {title && (
        <h3 className="px-4 pb-2 text-[13px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="flex flex-col gap-px rounded-xl overflow-hidden bg-slate-200 dark:bg-gray-800">
        {items.map(item => (
          <details 
            key={item.id}
            className="group bg-white dark:bg-surface-dark"
            open={openId === item.id}
            onToggle={(e) => {
              if ((e.target as HTMLDetailsElement).open) {
                toggleItem(item.id);
              }
            }}
          >
            <summary className="flex cursor-pointer items-center justify-between p-4 active:bg-slate-50 dark:active:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center size-8 rounded-lg ${item.iconColor}`}>
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                </div>
                <span className="text-slate-900 dark:text-white text-[16px] font-medium">{item.title}</span>
              </div>
              <span className={`material-symbols-outlined text-slate-400 transition-transform duration-200 ${openId === item.id ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </summary>
            <div className="px-4 pb-4 pt-0 pl-[52px]">
              <p className="text-slate-600 dark:text-slate-400 text-[14px] leading-relaxed">
                {item.content}
              </p>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

export default function Instructions() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setupBackButton(() => {
      navigate('/');
    });
  }, [navigate]);

  const handleBack = () => {
    hapticFeedback('light');
    navigate('/');
  };

  const handleUnderstood = () => {
    hapticFeedback('success');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-gray-800 transition-colors">
        <div className="flex items-center justify-between p-4 h-14">
          <button 
            onClick={handleBack}
            className="flex items-center justify-center text-primary active:opacity-70 transition-opacity"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
            <span className="text-primary text-[17px] font-normal leading-none ml-1">Назад</span>
          </button>
          <h2 className="text-slate-900 dark:text-white text-[17px] font-semibold leading-tight absolute left-1/2 -translate-x-1/2">
            Инструкции
          </h2>
          <div className="w-12" />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* Search Bar */}
        <div className="px-4 py-3">
          <div className="relative flex w-full items-center rounded-xl bg-slate-200/50 dark:bg-surface-dark group focus-within:ring-2 focus-within:ring-primary/50 transition-all overflow-hidden">
            <div className="flex items-center justify-center pl-3 text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none py-2.5 pl-2 pr-4 text-[17px] text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-0"
              placeholder="Поиск по инструкциям..."
            />
          </div>
        </div>

        {/* Intro Text */}
        <div className="px-5 pb-4 pt-1">
          <p className="text-slate-600 dark:text-slate-300 text-[15px] font-normal leading-relaxed text-center">
            База знаний для эффективного самоанализа. Здесь собраны советы, как вести записи и работать с эмоциями.
          </p>
        </div>

        {/* Instructions Lists */}
        <div className="px-4 space-y-6">
          <InstructionGroup items={basicInstructions} />
          <InstructionGroup title="Функции" items={featureInstructions} />
          <InstructionGroup title="Безопасность" items={securityInstructions} />

          {/* Footer */}
          <div className="text-center pt-4 pb-8">
            <p className="text-slate-400 dark:text-gray-600 text-xs">Версия приложения 1.0.0</p>
          </div>
        </div>
      </main>

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-t border-slate-200 dark:border-gray-800">
        <button 
          onClick={handleUnderstood}
          className="w-full flex items-center justify-center rounded-xl h-12 bg-primary active:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          <span className="text-white text-[17px] font-semibold tracking-wide">Всё понятно</span>
        </button>
      </div>
    </div>
  );
}

