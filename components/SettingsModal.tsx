import React, { useState } from 'react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentApiKey: string;
    onSave: (apiKey: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentApiKey, onSave }) => {
    const [apiKey, setApiKey] = useState(currentApiKey);

    const handleSave = () => {
        onSave(apiKey);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6 w-full max-w-md m-4"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold mb-4">Settings</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-1">
                            Gemini API Key
                        </label>
                        <input
                            type="password"
                            id="apiKey"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            placeholder="Enter your API key"
                        />
                         <p className="text-xs text-gray-500 mt-1">
                            Your key is stored securely in your browser's local storage.
                        </p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};