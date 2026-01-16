import React, { useState } from 'react';
import { Paperclip, ArrowUp, RefreshCw, MessageSquare, Loader2 } from 'lucide-react';
import apiClient from '../../../services/api';
import { PlaygroundConfig } from '../../../types';

interface ChatInterfaceProps {
    activeTool: string;
    config: PlaygroundConfig;
}

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata?: any;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ activeTool, config }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Helper function to extract error message from validation result
    const extractErrorMessage = (validationResult: any): string => {
        if (!validationResult) return 'Validation failed';
        
        // Try to extract from metadata.validation_results[0].error_message
        if (validationResult.metadata?.validation_results?.[0]?.error_message) {
            return validationResult.metadata.validation_results[0].error_message;
        }
        
        // Fallback to metadata.error_message
        if (validationResult.metadata?.error_message) {
            return validationResult.metadata.error_message;
        }
        
        // Fallback to direct error_message
        if (validationResult.error_message) {
            return validationResult.error_message;
        }
        
        // Last resort fallback
        return 'Output validation failed';
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            let response: Message;

            switch (activeTool) {
                case 'guard':
                    // If LLM config exists, call LLM with guard validation
                    if (config.llm && config.llm.provider && config.llm.model) {
                        try {
                            // Ensure API key is provided (required for LLM calls)
                            if (!config.llm.api_key && config.llm.provider === 'openai') {
                                throw new Error('OpenAI API key is required. Please configure it in the settings.');
                            }
                            
                            const chatResult = await apiClient.chat({
                                prompt: input,
                                llm_config: {
                                    provider: config.llm.provider,
                                    model: config.llm.model,
                                    api_key: config.llm.api_key,
                                    base_url: config.llm.base_url,
                                    temperature: config.llm.temperature,
                                    max_tokens: config.llm.max_tokens,
                                },
                                guard_config: config.guard ? {
                                    validators: config.guard.validators || [],
                                    num_reasks: config.guard.num_reasks || 0,
                                    name: config.guard.name,
                                } : undefined,
                                guard_id: config.guard?.guard_id || 'default',
                            });
                            
                            // Check if LLM call actually succeeded
                            if (!chatResult.response && !chatResult.error && !chatResult.raw_response) {
                                throw new Error('LLM did not return a response. Please check your API key and configuration.');
                            }

                            if (!chatResult.input_validated) {
                                response = {
                                    role: 'system',
                                    content: `❌ Input blocked: ${chatResult.error || 'Input validation failed'}`,
                                    metadata: chatResult,
                                };
                            } else if (chatResult.output_validated === false) {
                                const errorMsg = extractErrorMessage(chatResult.output_validation_result);
                                const rawResponse = chatResult.raw_response 
                                    ? `\n\nBlocked response: "${chatResult.raw_response.substring(0, 200)}${chatResult.raw_response.length > 200 ? '...' : ''}"`
                                    : '';
                                response = {
                                    role: 'system',
                                    content: `❌ Output blocked: ${errorMsg}${rawResponse}`,
                                    metadata: chatResult,
                                };
                            } else {
                                response = {
                                    role: 'assistant',
                                    content: chatResult.response || 'No response',
                                    metadata: chatResult,
                                };
                            }
                        } catch (err) {
                            response = {
                                role: 'system',
                                content: `❌ Error: ${err instanceof Error ? err.message : 'Failed to call LLM'}`,
                            };
                        }
                    } else {
                        // LLM config missing - show error instead of silently falling back to validation
                        response = {
                            role: 'system',
                            content: '❌ Error: LLM configuration is required to chat. Please configure provider, model, and API key in the Configuration panel.',
                            metadata: {
                                error: 'LLM config missing',
                                required: ['provider', 'model', 'api_key']
                            },
                        };
                    }
                    break;

                case 'context-manager':
                    const contextResult = await apiClient.checkContext({
                        text: input,
                        context_id: config.context?.context_id || 'default',
                        keywords: config.context?.keywords || [],
                        approved_contexts: config.context?.approved_contexts || [],
                        threshold: config.context?.threshold || 0.7,
                    });
                    response = {
                        role: 'assistant',
                        content: contextResult.is_valid
                            ? `✅ Within context (similarity: ${contextResult.max_similarity.toFixed(3)})`
                            : `❌ Outside context (max similarity: ${contextResult.max_similarity.toFixed(3)}, threshold: ${contextResult.threshold})`,
                        metadata: contextResult,
                    };
                    break;

                case 'rag':
                    const ragResult = await apiClient.retrieveRAG({
                        query: input,
                        rag_id: config.rag?.rag_id || 'default',
                        top_k: config.rag?.top_k || 5,
                        collection_name: config.rag?.collection_name || 'playground_collection',
                        embedding_provider: config.rag?.embedding_provider || 'sentence-transformers',
                        embedding_model_name: config.rag?.embedding_model_name,
                    });
                    const ragContent = ragResult.results.length > 0
                        ? ragResult.results.map((r, idx) => `[${idx + 1}] ${r.document.substring(0, 100)}... (score: ${r.score.toFixed(3)})`).join('\n\n')
                        : 'No relevant documents found.';
                    response = {
                        role: 'assistant',
                        content: `Retrieved ${ragResult.count} document(s):\n\n${ragContent}`,
                        metadata: ragResult,
                    };
                    break;

                case 'scorer':
                    // For scorer, we need a reference text - use the last assistant message or prompt user
                    const lastAssistantMsg = messages.filter(m => m.role === 'assistant').pop();
                    if (!lastAssistantMsg) {
                        response = {
                            role: 'system',
                            content: 'Please provide a reference text first. The scorer compares your response against a reference.',
                        };
                    } else {
                        const scorerResult = await apiClient.calculateScores({
                            response: input,
                            reference: lastAssistantMsg.content,
                            scorer_id: config.scorer?.scorer_id || 'default',
                            metrics: config.scorer?.metrics || ['CosineSimilarityMetric', 'SemanticSimilarityMetric'],
                            threshold: config.scorer?.threshold || 0.7,
                            aggregation: config.scorer?.aggregation || 'weighted_average',
                            weights: config.scorer?.weights || {},
                        });
                        const scoresText = Object.entries(scorerResult.scores)
                            .map(([metric, score]) => `${metric}: ${(score as number).toFixed(3)}`)
                            .join(', ');
                        response = {
                            role: 'assistant',
                            content: `Scores: ${scoresText}\nAggregated: ${scorerResult.aggregated_score.toFixed(3)}`,
                            metadata: scorerResult,
                        };
                    }
                    break;

                case 'validators':
                    const validatorResult = await apiClient.testValidator({
                        text: input,
                        validator_type: config.validator?.validator_type || 'min_length',
                        validator_params: config.validator?.validator_params || {},
                    });
                    response = {
                        role: 'assistant',
                        content: validatorResult.passed
                            ? `✅ Passed: ${validatorResult.result}`
                            : `❌ Failed: ${validatorResult.error_message || validatorResult.error || 'Validation failed'}`,
                        metadata: validatorResult,
                    };
                    break;

                case 'chat':
                    // Chat with LLM using configured settings
                    // Try config.chat.llm first, fallback to config.llm (auto-loaded from .env)
                    const llmConfig = config.chat?.llm || config.llm;
                    if (!llmConfig || !llmConfig.provider || !llmConfig.model) {
                        response = {
                            role: 'system',
                            content: '❌ Please configure LLM settings (provider, model, API key) in the Configuration panel to use chat.',
                        };
                    } else {
                        try {
                            // Ensure API key is provided (required for LLM calls)
                            if (!llmConfig.api_key && llmConfig.provider === 'openai') {
                                throw new Error('OpenAI API key is required. Please configure it in the settings.');
                            }
                            
                            const chatResult = await apiClient.chat({
                                prompt: input,
                                llm_config: {
                                    provider: llmConfig.provider,
                                    model: llmConfig.model,
                                    api_key: llmConfig.api_key,
                                    base_url: llmConfig.base_url,
                                    temperature: llmConfig.temperature,
                                    max_tokens: llmConfig.max_tokens,
                                },
                                guard_config: config.chat?.use_guard && config.guard ? {
                                    validators: config.guard.validators || [],
                                    num_reasks: config.guard.num_reasks || 0,
                                    name: config.guard.name,
                                } : undefined,
                                guard_id: config.guard?.guard_id || 'default',
                            });

                            if (!chatResult.input_validated) {
                                response = {
                                    role: 'system',
                                    content: `❌ Input blocked: ${chatResult.error || 'Input validation failed'}`,
                                    metadata: chatResult,
                                };
                            } else if (chatResult.output_validated === false) {
                                const errorMsg = extractErrorMessage(chatResult.output_validation_result);
                                const rawResponse = chatResult.raw_response 
                                    ? `\n\nBlocked response: "${chatResult.raw_response.substring(0, 200)}${chatResult.raw_response.length > 200 ? '...' : ''}"`
                                    : '';
                                response = {
                                    role: 'system',
                                    content: `❌ Output blocked: ${errorMsg}${rawResponse}`,
                                    metadata: chatResult,
                                };
                            } else {
                                response = {
                                    role: 'assistant',
                                    content: chatResult.response || 'No response',
                                    metadata: chatResult,
                                };
                            }
                        } catch (err) {
                            response = {
                                role: 'system',
                                content: `❌ Error: ${err instanceof Error ? err.message : 'Failed to call LLM'}`,
                            };
                        }
                    }
                    break;

                case 'monitor':
                case 'visualization':
                default:
                    // For general chat or features without specific LLM testing, just echo
                    response = {
                        role: 'assistant',
                        content: `You said: "${input}". This is a general chat interface. Select a specific feature (Guard, Context Manager, RAG, etc.) to test with Wall Library.`,
                    };
                    break;
            }

            setMessages((prev) => [...prev, response]);

            // Track interaction for monitoring
            if (activeTool !== 'monitor' && activeTool !== 'visualization') {
                try {
                    await apiClient.trackInteraction({
                        input: input,
                        output: response.content,
                        metadata: {
                            tool: activeTool,
                            validation_passed: response.metadata?.validation_passed ?? true,
                        },
                        latency: 0.5, // Would calculate actual latency
                    });
                } catch (e) {
                    // Silently fail monitoring
                }
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMsg);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'system',
                    content: `❌ Error: ${errorMsg}`,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header showing active feature */}
            <div className="p-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-[#d7d6d5]">
                            Testing: {activeTool === 'context-manager' ? 'Context Manager' : 
                                     activeTool === 'guard' ? 'Wall Guard' :
                                     activeTool === 'rag' ? 'RAG Retriever' :
                                     activeTool === 'scorer' ? 'Response Scorer' :
                                     activeTool === 'validators' ? 'Validators' :
                                     activeTool === 'monitor' ? 'Monitor' :
                                     activeTool === 'visualization' ? 'Visualization' : 'Chat'}
                        </h3>
                        <p className="text-xs text-[#888888] mt-1">
                            Configure settings in the middle panel, then test here
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#888888]">
                        <div className="w-12 h-12 rounded-xl bg-[#1E1E1C] border border-white/5 flex items-center justify-center mb-4">
                            <MessageSquare size={24} />
                        </div>
                        <p className="font-medium text-[#d7d6d5]">Your conversation will appear here</p>
                        <p className="text-xs mt-2 text-center max-w-xs">
                            Configure the {activeTool === 'context-manager' ? 'Context Manager' : activeTool} in the middle panel, then test it here with your messages.
                        </p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                    msg.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : msg.role === 'system'
                                        ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-500/30'
                                        : 'bg-[#1E1E1C] text-[#d7d6d5] border border-white/10'
                                }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                {msg.metadata && (
                                    <details className="mt-2 text-xs opacity-70">
                                        <summary className="cursor-pointer">View details</summary>
                                        <pre className="mt-2 overflow-auto text-[10px]">
                                            {JSON.stringify(msg.metadata, null, 2)}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-[#1E1E1C] border border-white/10 rounded-lg p-3 flex items-center gap-2">
                            <Loader2 className="animate-spin" size={16} />
                            <span className="text-sm text-[#888888]">Processing...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-white/5">
                {error && (
                    <div className="mb-4 p-3 bg-red-950/20 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 text-xs">{error}</p>
                    </div>
                )}
                <div className="bg-[#1E1E1C] border border-white/10 rounded-2xl p-4 relative shadow-lg shadow-black/20">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder={`Test ${activeTool === 'context-manager' ? 'Context Manager' : activeTool} with your message...`}
                        className="w-full bg-transparent text-[#d7d6d5] text-sm resize-none focus:outline-none min-h-[50px] max-h-[200px]"
                        disabled={isLoading}
                    />

                    <div className="flex justify-between items-center mt-3">
                        <button className="text-[#888888] hover:text-[#d7d6d5] transition-colors">
                            <Paperclip size={18} />
                        </button>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => {
                                    setMessages([]);
                                    setError(null);
                                }}
                                className="flex items-center gap-2 text-xs text-[#888888] hover:text-[#d7d6d5] transition-colors rounded-full hover:bg-white/5 px-2 py-1"
                            >
                                <RefreshCw size={12} /> Clear
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#d7d6d5] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={16} /> : <ArrowUp size={16} />}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="text-center mt-4 text-[10px] text-[#888888]">
                    Wall Library AI can make mistakes. Consider checking important information.
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
