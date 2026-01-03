import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import {
  Home,
  Situation,
  Thoughts,
  BodyFeelings,
  Consequences,
  WithoutProblem,
  Instructions,
} from './pages';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display">
          <Routes>
            {/* 1. Мои записи - Домашняя страница */}
            <Route path="/" element={<Home />} />
            
            {/* 2. Описание ситуации */}
            <Route path="/situation" element={<Situation />} />
            
            {/* 3. О чем думаю */}
            <Route path="/thoughts" element={<Thoughts />} />
            
            {/* 4. Что ощущаю в теле */}
            <Route path="/body-feelings" element={<BodyFeelings />} />
            
            {/* 5. Как это мешает жить? */}
            <Route path="/consequences" element={<Consequences />} />
            
            {/* 6. Что бы я делал без проблемы? */}
            <Route path="/without-problem" element={<WithoutProblem />} />
            
            {/* 7. Инструкции */}
            <Route path="/instructions" element={<Instructions />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
