import React, { useState, useEffect } from 'react';
import { SettingsIcon, CarouselIcon, CaptionIcon, BrainIcon, HashtagIcon } from './components/icons';
import { SettingsModal } from './components/SettingsModal';
import { CaptionGenerator } from './components/CaptionGenerator';
import { CarouselGenerator } from './components/CarouselGenerator';
import { IdeaGenerator } from './components/IdeaGenerator';
import { HashtagGenerator } from './components/HashtagGenerator';


const App: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<'carousel' | 'caption' | 'idea' | 'hashtag'>('carousel');
  const [initialCarouselTopic, setInitialCarouselTopic] = useState<string | undefined>(undefined);

  useEffect(() => {
    const storedApiKey = localStorage.getItem('geminiApiKey');
    if (storedApiKey) {
        setApiKey(storedApiKey);
    }
  }, []);

  const handleSaveApiKey = (newApiKey: string) => {
      setApiKey(newApiKey);
      localStorage.setItem('geminiApiKey', newApiKey);
  };
  
  const handleUseIdea = (ideaTopic: string) => {
    setInitialCarouselTopic(ideaTopic);
    setActiveTool('carousel');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ToolButton: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
  }> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
            isActive
                ? 'border-purple-500 text-white bg-gray-800/50'
                : 'border-transparent text-gray-400 hover:bg-gray-700/30 hover:text-gray-200'
        }`}
    >
        {icon}
        {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6 lg:p-8">
      <div 
        className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/40 -z-10"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0% 100%)'}}
      ></div>

      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="w-10"></div> {/* Spacer to keep title centered */}
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 text-center">
            7k Insta Hub
          </h1>
          <button 
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 rounded-full hover:bg-gray-700/50 transition-colors"
            aria-label="Settings"
          >
            <SettingsIcon className="w-6 h-6 text-gray-300"/>
          </button>
        </header>

        <main>
          {notification && (
            <div className="bg-yellow-900/30 border border-yellow-600 text-yellow-300 px-4 py-3 rounded-lg relative mb-6 animate-pulse" role="alert">
                <span className="block sm:inline">{notification}</span>
                <button onClick={() => setNotification(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Close notification">
                    <svg className="fill-current h-6 w-6 text-yellow-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                </button>
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-600 text-red-300 px-4 py-3 rounded-lg relative mb-6 whitespace-pre-wrap" role="alert">
                <span className="block sm:inline">{error}</span>
                <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Close error">
                     <svg className="fill-current h-6 w-6 text-red-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                </button>
            </div>
          )}

          {/* Tool Selector */}
          <div className="flex border-b border-gray-700 mb-8 overflow-x-auto">
              <ToolButton
                  label="Idea Generator"
                  icon={<BrainIcon />}
                  isActive={activeTool === 'idea'}
                  onClick={() => setActiveTool('idea')}
              />
              <ToolButton
                  label="Carousel Generator"
                  icon={<CarouselIcon />}
                  isActive={activeTool === 'carousel'}
                  onClick={() => setActiveTool('carousel')}
              />
              <ToolButton
                  label="Caption Generator"
                  icon={<CaptionIcon />}
                  isActive={activeTool === 'caption'}
                  onClick={() => setActiveTool('caption')}
              />
              <ToolButton
                  label="Hashtag Generator"
                  icon={<HashtagIcon />}
                  isActive={activeTool === 'hashtag'}
                  onClick={() => setActiveTool('hashtag')}
              />
          </div>
          
          {activeTool === 'idea' && (
              <IdeaGenerator
                apiKey={apiKey}
                onError={(msg) => { setError(msg); if(msg) setNotification(null); }}
                onRequireApiKey={() => setIsSettingsModalOpen(true)}
                onUseIdea={handleUseIdea}
              />
          )}

          {activeTool === 'carousel' && (
              <CarouselGenerator
                apiKey={apiKey}
                onError={(msg) => { setError(msg); if(msg) setNotification(null); }}
                onNotification={(msg) => { setNotification(msg); if(msg) setError(null); }}
                onRequireApiKey={() => setIsSettingsModalOpen(true)}
                initialTopic={initialCarouselTopic}
              />
          )}

          {activeTool === 'caption' && (
              <CaptionGenerator
                  apiKey={apiKey}
                  onError={(msg) => {
                      setError(msg);
                      if (msg) setNotification(null);
                  }}
                  onRequireApiKey={() => setIsSettingsModalOpen(true)}
              />
          )}

          {activeTool === 'hashtag' && (
              <HashtagGenerator
                  apiKey={apiKey}
                  onError={(msg) => {
                      setError(msg);
                      if (msg) setNotification(null);
                  }}
                  onRequireApiKey={() => setIsSettingsModalOpen(true)}
              />
          )}
        </main>
      </div>
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentApiKey={apiKey}
        onSave={handleSaveApiKey}
      />
    </div>
  );
};

export default App;