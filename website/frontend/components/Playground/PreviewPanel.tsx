import React from 'react';
import ChatInterface from './Components/ChatInterface';
import { PlaygroundConfig } from '../../types';

interface PreviewPanelProps {
    activeTool: string;
    config: PlaygroundConfig;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ activeTool, config }) => {
    return (
        <div className="flex flex-col h-full bg-[#13120b] relative overflow-y-auto">
            <ChatInterface activeTool={activeTool} config={config} />
        </div>
    );
};

export default PreviewPanel;
