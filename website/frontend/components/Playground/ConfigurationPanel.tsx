import React, { useState, useEffect, useRef } from 'react';
import {
    Settings2, Plus, X, ChevronDown, ChevronUp, Info, Upload, FileText, Code, Database,
    Brain, Search, BarChart3, FlaskConical, Activity, AlertTriangle, MessageSquare, PieChart,
    Shield, Ban, Filter, MicOff, RefreshCw, Wrench, Eye, ClipboardList, Folder, Check,
    Lightbulb, Terminal, AlertCircle, Bot, TrendingUp
} from 'lucide-react';
import { PlaygroundConfig } from '../../types';
import apiClient from '../../services/api';

const VALIDATOR_EXAMPLES: Record<string, string> = {
    'test_length': '{\n  "min_length": 10,\n  "max_length": 100\n}',
    'test_safety': '{\n  "restricted_terms": [\n    "hack",\n    "steal",\n    "bomb",\n    "kill",\n    "Hello World"\n  ]\n}',
    'pii': '{\n  "entities": ["email", "phone", "credit_card"],\n  "replace": true\n}',
    'profanity': '{\n  "threshold": 0.8\n}',
    'competitors': '{\n  "competitors": ["Competitor A", "Competitor B"]\n}',
    'on_topic': '{\n  "valid_topics": ["tech", "ai", "finance"],\n  "invalid_topics": ["politics", "religion"]\n}',
    'regex': '{\n  "pattern": "^[A-Z]\\\\d{3}$",\n  "match_type": "fullmatch"\n}',
    'toxicity': '{\n  "threshold": 0.5\n}',
    'hallucination': '{\n  "use_grounding": true\n}',
    'relevance': '{\n  "threshold": 0.5\n}'
};
// Helper component for JSON editing
const JsonEditor = ({ value, onChange, className, placeholder }: any) => {
    const [text, setText] = useState(JSON.stringify(value || {}, null, 2));
    const lastValueRef = useRef(value);

    useEffect(() => {
        if (JSON.stringify(value) !== JSON.stringify(lastValueRef.current)) {
            setText(JSON.stringify(value || {}, null, 2));
            lastValueRef.current = value;
        }
    }, [value]);

    const handleChange = (e: any) => {
        const newText = e.target.value;
        setText(newText);
        try {
            const parsed = JSON.parse(newText);
            // Only fire change if it parses
            lastValueRef.current = parsed;
            onChange(parsed);
        } catch { }
    };

    return (
        <textarea
            value={text}
            onChange={handleChange}
            className={className}
            placeholder={placeholder}
            spellCheck={false}
        />
    );
};
interface ConfigPanelProps {
    activeTool: string;
    config: PlaygroundConfig;
    onConfigChange: (config: PlaygroundConfig) => void;
}

const ConfigurationPanel: React.FC<ConfigPanelProps> = ({ activeTool, config, onConfigChange }) => {
    const [localConfig, setLocalConfig] = useState<PlaygroundConfig>(config);
    const [envConfigLoaded, setEnvConfigLoaded] = useState<boolean>(false);
    const [availableValidators, setAvailableValidators] = useState<any[]>([]);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        validators: true,
        logger: false,
        schema: false,
        llm: false,
    });
    const [selectedOnFailAction, setSelectedOnFailAction] = useState<string>('exception');
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    // Only sync config from props if we haven't loaded env config yet
    useEffect(() => {
        if (!envConfigLoaded) {
            setLocalConfig(config);
        }
    }, [config, envConfigLoaded]);

    useEffect(() => {
        loadValidators();
        // Load env config after a small delay to ensure component is mounted
        setTimeout(() => {
            loadEnvConfig();
        }, 100);
    }, []);

    const loadEnvConfig = async () => {
        // Try to load LLM config from backend (reads .env file securely)
        try {
            const apiBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8001';
            const response = await fetch(`${apiBaseUrl}/api/config/llm`);
            if (response.ok) {
                const envConfig = await response.json();
                if (envConfig.api_key && envConfig.model) {
                    const newLlmConfig = {
                        provider: (envConfig.provider || 'openai') as 'openai' | 'anthropic' | 'custom',
                        model: envConfig.model,
                        api_key: envConfig.api_key,
                        base_url: envConfig.base_url || undefined,
                    };
                    
                    // Update local state and parent config simultaneously
                    const updated = {
                        ...localConfig,
                        llm: {
                            ...localConfig.llm,
                            ...newLlmConfig,
                        }
                    };
                    
                    setLocalConfig(updated);
                    setEnvConfigLoaded(true);
                    onConfigChange(updated);
                    
                    console.log('✅ Loaded LLM config from .env:', { 
                        provider: newLlmConfig.provider, 
                        model: newLlmConfig.model,
                        hasApiKey: !!newLlmConfig.api_key 
                    });
                }
            }
        } catch (err) {
            console.warn('Failed to load LLM config from backend:', err);
            // Fallback: Try Vite env vars (requires VITE_ prefix)
            const viteApiKey = (import.meta as any).env?.VITE_OPENAI_API_KEY;
            const viteModel = (import.meta as any).env?.VITE_LLM_MODEL || (import.meta as any).env?.VITE_OPENAI_MODEL;
            if (viteApiKey && viteModel) {
                const newLlmConfig = {
                    provider: 'openai' as const,
                    model: viteModel,
                    api_key: viteApiKey,
                };
                
                const updated = {
                    ...localConfig,
                    llm: {
                        ...localConfig.llm,
                        ...newLlmConfig,
                    }
                };
                
                setLocalConfig(updated);
                setEnvConfigLoaded(true);
                onConfigChange(updated);
                
                console.log('✅ Loaded LLM config from Vite env vars:', { 
                    provider: newLlmConfig.provider, 
                    model: newLlmConfig.model 
                });
            }
        }
    };

    const loadValidators = async () => {
        try {
            const response = await apiClient.listValidators();
            if (response && response.validators && response.validators.length > 0) {
                setAvailableValidators(response.validators);
            } else {
                setAvailableValidators([
                    { type: 'test_length', name: 'Length Validator', description: 'Validates minimum and maximum length' },
                    { type: 'test_safety', name: 'Safety Validator', description: 'Blocks unsafe keywords and restricted terms. Supports single words (word-boundary matching) and multi-word phrases (flexible spacing/punctuation). Leave empty {} to use defaults.' },
                ]);
            }
        } catch (err) {
            console.error('Failed to load validators:', err);
            setAvailableValidators([
                { type: 'test_length', name: 'Length Validator', description: 'Validates minimum and maximum length' },
                { type: 'test_safety', name: 'Safety Validator', description: 'Blocks unsafe keywords and restricted terms' },
            ]);
        }
    };

    const updateConfig = (updates: Partial<PlaygroundConfig>) => {
        const newConfig = { ...localConfig, ...updates };
        setLocalConfig(newConfig);
        onConfigChange(newConfig);
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleFileUpload = (key: string, file: File | null, fileType?: string) => {
        if (key === 'context_file' && file) {
            updateConfig({
                context: {
                    ...localConfig.context,
                    file_upload: file,
                    file_type: fileType as any,
                } as any,
            });
        } else if (key === 'rag_document' && file) {
            updateConfig({
                rag: {
                    ...localConfig.rag,
                    document_upload: file,
                } as any,
            });
        } else if (key === 'schema_file' && file) {
            updateConfig({
                guard: {
                    ...localConfig.guard,
                    schema_file: file,
                } as any,
            });
        }
    };

    // ========== WALL GUARD CONFIGURATION - ALL FEATURES ==========
    const renderGuardConfig = () => {
        const guardConfig = localConfig.guard || { validators: [], num_reasks: 0, name: '', guard_id: 'default' };

    return (
            <div className="space-y-4">
                {/* Collapsible Definition Dropdown */}
                <div className="bg-[#1E1E1C] border border-white/10 rounded-lg overflow-hidden">
                    <button
                        onClick={() => toggleSection('guard_definition')}
                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Shield size={18} className="text-[#888888]" />
                            <span className="text-sm font-medium text-[#d7d6d5]">What is Wall Guard?</span>
                            <span className="text-[10px] text-[#888888] bg-white/10 px-2 py-0.5 rounded">Definition</span>
                        </div>
                        {expandedSections['guard_definition'] ? <ChevronUp size={16} className="text-[#888888]" /> : <ChevronDown size={16} className="text-[#888888]" />}
                </button>

                    {expandedSections['guard_definition'] && (
                        <div className="px-4 pb-4 bg-[#1E1E1C] border-t border-white/5">
                            <p className="text-[11px] text-[#d7d6d5] mt-3 leading-relaxed">
                                <strong className="text-white">Wall Guard</strong> is the core validation engine. It acts as a <strong className="text-white">multi-layer firewall</strong> for your LLM applications.
                            </p>

                            <div className="bg-black/30 rounded-lg p-3 mt-3 space-y-1">
                                <p className="text-[10px] text-[#888888] font-semibold">How it works:</p>
                                <ol className="text-[10px] text-[#888888] space-y-0.5 ml-4 list-decimal">
                                    <li>Configure <strong>validators</strong> (safety, length, format)</li>
                                    <li>Validators run <strong>sequentially</strong></li>
                                    <li><strong>OnFailAction</strong> determines failure handling</li>
                                    <li><strong>num_reasks</strong> enables auto-retry</li>
                                </ol>
            </div>

                            <div className="bg-black/30 rounded-lg p-2 mt-2">
                                <p className="text-[9px] text-[#888888]">
                                    <span className="text-red-400 font-bold text-[10px] mr-1">[BLOCK]</span> Blocks: "This is a guaranteed cure!"<br />
                                    <span className="text-green-400 font-bold text-[10px] mr-1">[SAFE]</span> Allows: "Consult your doctor."
                                </p>
                    </div>
                        </div>
                    )}
                </div>

                {/* Guard Name */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Guard Name</label>
                        <Info size={12} className="text-[#888888]" title="Optional name to identify this guard instance" />
                    </div>
                    <input
                        type="text"
                        value={guardConfig.name || ''}
                        onChange={(e) => updateConfig({ guard: { ...guardConfig, name: e.target.value } as any })}
                        placeholder="my_guard"
                        className="w-full bg-[#1E1E1C] border border-white/10 rounded-lg p-2 text-sm text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                    />
                </div>

                {/* Num Reasks */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">
                            Num Reasks: {guardConfig.num_reasks || 0}
                        </label>
                        <Info size={12} className="text-[#888888]" title="When validation fails, Wall Guard can automatically re-ask the LLM with feedback. Set to 0 to disable re-asking." />
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        value={guardConfig.num_reasks || 0}
                        onChange={(e) => updateConfig({ guard: { ...guardConfig, num_reasks: parseInt(e.target.value) } as any })}
                        className="w-full accent-blue-500"
                    />
                    <div className="flex justify-between text-[10px] text-[#888888]">
                        <span>0 (No re-asks)</span>
                        <span>10 (Maximum)</span>
                    </div>
                    <p className="text-[10px] text-[#888888]">
                        {guardConfig.num_reasks === 0
                            ? 'Validation failures will immediately return errors'
                            : `LLM will be re-asked up to ${guardConfig.num_reasks} time(s) with validation feedback if response fails`
                        }
                    </p>
                </div>

                {/* Telemetry Toggle */}
                <div className="pt-2">
                    <label className="flex items-start gap-2 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                checked={guardConfig.enable_telemetry || false}
                                onChange={(e) => updateConfig({ guard: { ...guardConfig, enable_telemetry: e.target.checked } as any })}
                                className="peer sr-only"
                            />
                            <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-[#d7d6d5] group-hover:text-white transition-colors">Enable OpenTelemetry Tracing</span>
                            <p className="text-[10px] text-[#888888] mt-0.5">
                                Captures distributed traces for monitoring and debugging.
                            </p>
                            </div>
                    </label>
                        </div>

                {/* Schema Systems */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Schema System</label>
                            <Info size={12} className="text-[#888888]" title="Optional: Define structured output format. LLM responses will be validated against this schema to ensure correct structure." />
                        </div>
                        <button onClick={() => toggleSection('schema')} className="text-[#888888] hover:text-white transition-colors">
                            {expandedSections['schema'] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    </div>
                    <select
                        value={guardConfig.schema_type || 'none'}
                        onChange={(e) => updateConfig({ guard: { ...guardConfig, schema_type: e.target.value as any } as any })}
                        className="w-full bg-[#1E1E1C] border border-white/10 rounded-lg p-2 text-sm text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                    >
                        <option value="none">None - No schema validation (accept any format)</option>
                        <option value="pydantic">Pydantic - Python model classes for structured output</option>
                        <option value="rail">RAIL - XML-based schema with validators per field</option>
                        <option value="json_schema">JSON Schema - Standard JSON schema format</option>
                    </select>
                    {guardConfig.schema_type === 'none' && (
                        <p className="text-[10px] text-[#888888]">Responses will not be validated for structure. Only validators below will be used.</p>
                    )}

                    {expandedSections['schema'] && guardConfig.schema_type && guardConfig.schema_type !== 'none' && (
                        <div className="mt-2 space-y-2">
                            {guardConfig.schema_type === 'pydantic' && (
                                <div>
                                    <label className="text-[10px] text-[#888888] mb-1 block">Pydantic Model Code</label>
                                    <textarea
                                        value={guardConfig.schema_content || ''}
                                        onChange={(e) => updateConfig({ guard: { ...guardConfig, schema_content: e.target.value } as any })}
                                        placeholder="from pydantic import BaseModel, Field&#10;&#10;class PatientInfo(BaseModel):&#10;    condition: str = Field(description='Medical condition')&#10;    symptoms: list[str] = Field(description='List of symptoms')"
                                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-[#d7d6d5] font-mono h-32"
                                    />
                                </div>
                            )}
                            {guardConfig.schema_type === 'rail' && (
                                <div>
                                    <label className="text-[10px] text-[#888888] mb-1 block">RAIL Schema String</label>
                                    <textarea
                                        value={guardConfig.schema_content || ''}
                                        onChange={(e) => updateConfig({ guard: { ...guardConfig, schema_content: e.target.value } as any })}
                                        placeholder='&lt;rail version="0.1"&gt;&#10;&lt;output&gt;&#10;    &lt;string name="symptom" validators="length" on-fail-length="exception"/&gt;&#10;&lt;/output&gt;&#10;&lt;/rail&gt;'
                                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-[#d7d6d5] font-mono h-32"
                                    />
                                </div>
                            )}
                            {guardConfig.schema_type === 'json_schema' && (
                                <div>
                                    <label className="text-[10px] text-[#888888] mb-1 block">JSON Schema</label>
                                    <textarea
                                        value={guardConfig.schema_content || ''}
                                        onChange={(e) => updateConfig({ guard: { ...guardConfig, schema_content: e.target.value } as any })}
                                        placeholder='{"type": "object", "properties": {"name": {"type": "string"}}, "required": ["name"]}'
                                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-[#d7d6d5] font-mono h-32"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="text-[10px] text-[#888888] mb-1 block">Or Upload Schema File</label>
                                <input
                                    type="file"
                                    ref={(el) => fileInputRefs.current['schema_file'] = el}
                                    onChange={(e) => handleFileUpload('schema_file', e.target.files?.[0] || null)}
                                    accept=".py,.rail,.json"
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRefs.current['schema_file']?.click()}
                                    className="flex items-center gap-2 text-xs text-[#d7d6d5] border border-white/10 rounded-full px-3 py-1.5 hover:bg-white/5 transition-colors w-full"
                                >
                                    <Upload size={12} /> Upload Schema File
                                </button>
                                {guardConfig.schema_file && (
                                    <p className="text-[10px] text-[#888888] mt-1">{guardConfig.schema_file.name}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Logger Configuration */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Logger Configuration</label>
                        <button onClick={() => toggleSection('logger')} className="text-[#888888] hover:text-white">
                            {expandedSections['logger'] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    </div>
                    {expandedSections['logger'] && (
                        <div className="space-y-2 mt-2">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <label className="text-[10px] text-[#888888] block">Log Level</label>
                                    <Info size={10} className="text-[#888888]" title="Minimum log level to record. DEBUG shows everything, ERROR shows only errors." />
                                </div>
                                <select
                                    value={guardConfig.logger?.level || 'INFO'}
                                    onChange={(e) => updateConfig({ guard: { ...guardConfig, logger: { ...guardConfig.logger, level: e.target.value as any } } as any })}
                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                                >
                                    <option value="DEBUG">DEBUG - All operations (verbose)</option>
                                    <option value="INFO">INFO - Important operations (default)</option>
                                    <option value="WARNING">WARNING - Warnings and errors only</option>
                                    <option value="ERROR">ERROR - Errors only</option>
                                </select>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <label className="text-[10px] text-[#888888] block">Log Scopes</label>
                                    <Info size={10} className="text-[#888888]" title="Select which operations to log. 'ALL' logs everything. Select specific scopes for focused logging." />
                                </div>
                                <p className="text-[9px] text-[#888888] mb-2">Select operations to log (check 'ALL' to log everything):</p>
                                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                    {[
                                        { scope: 'ALL', desc: 'Log everything (validations, RAG, scoring, LLM calls, monitoring)' },
                                        { scope: 'VALIDATIONS', desc: 'Log all validation operations' },
                                        { scope: 'RAG', desc: 'Log RAG retrieval operations' },
                                        { scope: 'SCORING', desc: 'Log response scoring operations' },
                                        { scope: 'LLM_CALLS', desc: 'Log all LLM API calls and responses' },
                                        { scope: 'MONITORING', desc: 'Log monitoring events and statistics' },
                                        { scope: 'ERRORS', desc: 'Log errors and exceptions only' },
                                    ].map(({ scope, desc }) => (
                                        <label key={scope} className="flex items-start gap-2 cursor-pointer p-1.5 rounded hover:bg-black/20">
                                            <input
                                                type="checkbox"
                                                checked={(guardConfig.logger?.scopes || []).includes(scope.toLowerCase()) || (guardConfig.logger?.scopes || []).includes('all')}
                                                onChange={(e) => {
                                                    let scopes = [...(guardConfig.logger?.scopes || [])];
                                                    if (scope === 'ALL') {
                                                        if (e.target.checked) {
                                                            scopes = ['all'];
                                                        } else {
                                                            scopes = [];
                                                        }
                                                    } else {
                                                        // Remove 'all' if selecting specific scope
                                                        scopes = scopes.filter(s => s !== 'all');
                                                        if (e.target.checked) {
                                                            if (!scopes.includes(scope.toLowerCase())) {
                                                                scopes.push(scope.toLowerCase());
                                                            }
                                                        } else {
                                                            const idx = scopes.indexOf(scope.toLowerCase());
                                                            if (idx > -1) scopes.splice(idx, 1);
                                                        }
                                                    }
                                                    updateConfig({ guard: { ...guardConfig, logger: { ...guardConfig.logger, scopes } } as any });
                                                }}
                                                className="accent-blue-500 mt-0.5"
                                            />
                                            <div className="flex-1">
                                                <span className="text-xs text-[#d7d6d5] font-medium">{scope}</span>
                                                <p className="text-[9px] text-[#888888]">{desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <label className="text-[10px] text-[#888888] block">Output Destination</label>
                                    <Info size={10} className="text-[#888888]" title="Where to write logs: console (browser), file (server), or both." />
                                </div>
                                <select
                                    value={guardConfig.logger?.output || 'console'}
                                    onChange={(e) => updateConfig({ guard: { ...guardConfig, logger: { ...guardConfig.logger, output: e.target.value as any } } as any })}
                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                                >
                                    <option value="console">Console - Browser console (development)</option>
                                    <option value="file">File - Save to log file (production)</option>
                                    <option value="both">Both - Console and file</option>
                                </select>
                                <p className="text-[9px] text-[#888888] mt-1">
                                    {guardConfig.logger?.output === 'console' && 'Logs appear in browser console (F12 → Console tab)'}
                                    {guardConfig.logger?.output === 'file' && 'Logs saved to file (specify path below)'}
                                    {guardConfig.logger?.output === 'both' && 'Logs appear in console AND saved to file'}
                                </p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <label className="text-[10px] text-[#888888] block">Log Format</label>
                                    <Info size={10} className="text-[#888888]" title="Format of log entries: JSON (structured, machine-readable) or Human (readable, for debugging)." />
                                </div>
                                <select
                                    value={guardConfig.logger?.format || 'human'}
                                    onChange={(e) => updateConfig({ guard: { ...guardConfig, logger: { ...guardConfig.logger, format: e.target.value as any } } as any })}
                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                                >
                                    <option value="json">JSON - Structured format (for log aggregators)</option>
                                    <option value="human">Human-readable - Easy to read (for debugging)</option>
                                    <option value="both">Both - JSON and human formats</option>
                                </select>
                                <p className="text-[9px] text-[#888888] mt-1">
                                    {guardConfig.logger?.format === 'json' && 'Structured JSON logs - easy to parse programmatically'}
                                    {guardConfig.logger?.format === 'human' && 'Human-readable logs - easy to read in console/file'}
                                    {guardConfig.logger?.format === 'both' && 'Both formats written - structured and readable'}
                                </p>
                            </div>
                            {(guardConfig.logger?.output === 'file' || guardConfig.logger?.output === 'both') && (
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <label className="text-[10px] text-[#888888] block">Log File Path</label>
                                        <Info size={10} className="text-[#888888]" title="Path to log file on server. Use relative path (e.g., logs/wall_library.log) or absolute path." />
                                    </div>
                                    <input
                                        type="text"
                                        value={guardConfig.logger?.log_file || 'logs/wall_library.log'}
                                        onChange={(e) => updateConfig({ guard: { ...guardConfig, logger: { ...guardConfig.logger, log_file: e.target.value } } as any })}
                                        placeholder="logs/wall_library.log"
                                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                                    />
                                    <p className="text-[9px] text-[#888888] mt-1">File will be created automatically. Directory must exist or be writable.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>



                {/* Validators with Input/Output Separation */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Validators (guard.use() / guard.use_many())</label>
                            <Info size={12} className="text-[#888888]" title="Add validators using guard.use() or guard.use_many(). Each validator can be applied to 'input' (user prompt) or 'output' (LLM response) using the 'on' parameter." />
                        </div>
                        <button onClick={() => toggleSection('validators')} className="text-[#888888] hover:text-white transition-colors">
                            {expandedSections['validators'] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                </div>
                    {expandedSections['validators'] && (
                        <div className="mt-2 space-y-3">
                            {/* Show Input and Output Validators Separately - Matching Documentation */}
                            {guardConfig.validators && guardConfig.validators.length > 0 && (
                                <div className="space-y-4">
                                    {/* Input Validators Section */}
                                    {guardConfig.validators.filter((v: any) => (v.on || 'output') === 'input').length > 0 && (
                                        <div>
                                            <label className="text-[10px] text-[#888888] font-semibold mb-2 block flex items-center gap-2">
                                                <span className="bg-amber-500/20 px-2 py-0.5 rounded text-[9px]">INPUT</span>
                                                Input Validators (guard.use(..., on="input")) - Validates User Prompts
                                            </label>
                                            <div className="space-y-2">
                                                {guardConfig.validators
                                                    .map((v: any, originalIdx: number) => ({ v, originalIdx }))
                                                    .filter(({ v }: any) => (v.on || 'output') === 'input')
                                                    .map(({ v: validator, originalIdx: idx }: any) => (
                                                        <div key={`input-${idx}`} className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 space-y-2">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-[#d7d6d5] font-medium">
                                                                    {validator.type ? availableValidators.find(v => v.type === validator.type)?.name || validator.type : ' New Validator (select type below)'}
                                                                </span>
                                                                <button
                                                                    onClick={() => {
                                                                        const validators = [...(guardConfig.validators || [])];
                                                                        validators.splice(idx, 1);
                                                                        updateConfig({ guard: { ...guardConfig, validators } as any });
                                                                    }}
                                                                    className="text-[#888888] hover:text-red-400"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-[#888888] mb-1 block">Validator Type</label>
                                                                <select
                                                                    value={validator.type || ''}
                                                                    onChange={(e) => {
                                                                        const validators = [...(guardConfig.validators || [])];
                                                                        validators[idx] = { ...validators[idx], type: e.target.value, params: {} };
                                                                        updateConfig({ guard: { ...guardConfig, validators } as any });
                                                                    }}
                                                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                                                                >
                                                                    <option value="">Select validator...</option>
                                                                    {availableValidators.map(v => (
                                                                        <option key={v.type} value={v.type}>{v.name}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            {validator.type && (
                                                                <div>
                                                                    <div className="flex items-start justify-between mb-1">
                                                                        <label className="text-[10px] text-[#888888] block">Parameters (JSON) - guard.use((Validator, {"{params}"}, ...))</label>
                                                                        {validator.type === 'test_safety' && (
                                                                            <Info 
                                                                                size={12} 
                                                                                className="text-[#888888] ml-2 cursor-help flex-shrink-0" 
                                                                                title="TestSafetyValidator: Blocks responses containing restricted terms. Single words use word-boundary matching (e.g., 'kill' won't match 'skills'). Multi-word phrases match flexibly (e.g., 'Hello World' matches 'Hello, World!'). Leave {} empty for defaults." 
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    {validator.type === 'test_safety' && (
                                                                        <div className="mb-1 text-[9px] text-[#666666] italic">
                                                                            <strong>Examples:</strong> Single words: {"{"}"restricted_terms": ["kill", "hack"]{"}"} | Multi-word: {"{"}"restricted_terms": ["Hello World", "credit card"]{"}"} | Empty: {"{}"} (uses defaults)
                                                                        </div>
                                                                    )}
                                                                    <JsonEditor
                                                                        value={validator.params || {}}
                                                                        onChange={(params: any) => {
                                                                            const validators = [...(guardConfig.validators || [])];
                                                                            validators[idx] = { ...validators[idx], params };
                                                                            updateConfig({ guard: { ...guardConfig, validators } as any });
                                                                        }}
                                                                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-[#d7d6d5] font-mono h-20 focus:border-blue-500/50 focus:outline-none"
                                                                        placeholder={VALIDATOR_EXAMPLES[validator.type] || '{\n  "param": "value"\n}'}
                                                                    />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <label className="text-[10px] text-[#888888] mb-1 block">On Fail Action</label>
                                                                <select
                                                                    value={validator.on_fail || 'exception'}
                                                                    onChange={(e) => {
                                                                        const validators = [...(guardConfig.validators || [])];
                                                                        validators[idx].on_fail = e.target.value;
                                                                        updateConfig({ guard: { ...guardConfig, validators } as any });
                                                                    }}
                                                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                                                                >
                                                                    <option value="exception">EXCEPTION - Raise error immediately</option>
                                                                    <option value="filter">FILTER - Remove invalid content</option>
                                                                    <option value="refrain">REFRAIN - Return empty response</option>
                                                                    <option value="reask">REASK - Re-ask LLM to generate again</option>
                                                                    <option value="fix">FIX - Attempt to programmatically fix</option>
                                                                    <option value="fix_reask">FIX_REASK - Try to fix, then reask if needed</option>
                                                                    <option value="noop">NOOP - Pass through (no validation)</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-[#888888] mb-1 block">Apply On</label>
                                                                <select
                                                                    value={validator.on || 'input'}
                                                                    onChange={(e) => {
                                                                        const validators = [...(guardConfig.validators || [])];
                                                                        validators[idx].on = e.target.value as any;
                                                                        updateConfig({ guard: { ...guardConfig, validators } as any });
                                                                    }}
                                                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                                                                >
                                                                    <option value="input">Input - Validate user input</option>
                                                                    <option value="output">Output - Validate LLM output</option>
                                                                </select>
                                                                <p className="text-[9px] text-[#888888] mt-1">Matches: guard.use(..., on="{validator.on || 'input'}")</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Output Validators Section */}
                                    {guardConfig.validators.filter((v: any) => (v.on || 'output') === 'output').length > 0 && (
                                        <div>
                                            <label className="text-[10px] text-[#888888] font-semibold mb-2 block flex items-center gap-2">
                                                <span className="bg-white/10 px-2 py-0.5 rounded text-[9px]">OUTPUT</span>
                                                Output Validators (guard.use(..., on="output")) - Validates LLM Responses (Default)
                                            </label>
                                            <div className="space-y-2">
                                                {guardConfig.validators
                                                    .map((v: any, originalIdx: number) => ({ v, originalIdx }))
                                                    .filter(({ v }: any) => (v.on || 'output') === 'output')
                                                    .map(({ v: validator, originalIdx: idx }: any) => (
                                                        <div key={`output-${idx}`} className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 space-y-2">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-[#d7d6d5] font-medium">
                                                                    {validator.type ? availableValidators.find(v => v.type === validator.type)?.name || validator.type : ' New Validator (select type below)'}
                                                                </span>
                                                                <button
                                                                    onClick={() => {
                                                                        const validators = [...(guardConfig.validators || [])];
                                                                        const outputIndices = guardConfig.validators
                                                                            .map((v: any, i: number) => ((v.on || 'output') === 'output') ? i : -1)
                                                                            .filter((i: number) => i !== -1);
                                                                        const actualIdx = outputIndices.findIndex(i => i === idx);
                                                                        if (actualIdx !== -1) {
                                                                            const realIdx = outputIndices[actualIdx];
                                                                            validators.splice(realIdx, 1);
                                                                            updateConfig({ guard: { ...guardConfig, validators } as any });
                                                                        }
                                                                    }}
                                                                    className="text-[#888888] hover:text-red-400"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                    </div>
                                                            <div>
                                                                <label className="text-[10px] text-[#888888] mb-1 block">Validator Type</label>
                                                                <select
                                                                    value={validator.type || ''}
                                                                    onChange={(e) => {
                                                                        const validators = [...(guardConfig.validators || [])];
                                                                        validators[idx] = { ...validators[idx], type: e.target.value, params: {} };
                                                                        updateConfig({ guard: { ...guardConfig, validators } as any });
                                                                    }}
                                                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                                                                >
                                                                    <option value="">Select validator...</option>
                                                                    {availableValidators.map(v => (
                                                                        <option key={v.type} value={v.type}>{v.name}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            {validator.type && (
                                                                <div>
                                                                    <div className="flex items-start justify-between mb-1">
                                                                        <label className="text-[10px] text-[#888888] block">Parameters (JSON) - guard.use((Validator, {"{params}"}, ...))</label>
                                                                        {validator.type === 'test_safety' && (
                                                                            <Info 
                                                                                size={12} 
                                                                                className="text-[#888888] ml-2 cursor-help flex-shrink-0" 
                                                                                title="TestSafetyValidator: Blocks responses containing restricted terms. Single words use word-boundary matching (e.g., 'kill' won't match 'skills'). Multi-word phrases match flexibly (e.g., 'Hello World' matches 'Hello, World!'). Leave {} empty for defaults." 
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    {validator.type === 'test_safety' && (
                                                                        <div className="mb-1 text-[9px] text-[#666666] italic">
                                                                            <strong>Examples:</strong> Single words: {"{"}"restricted_terms": ["kill", "hack"]{"}"} | Multi-word: {"{"}"restricted_terms": ["Hello World", "credit card"]{"}"} | Empty: {"{}"} (uses defaults)
                                                                        </div>
                                                                    )}
                                                                    <JsonEditor
                                                                        value={validator.params || {}}
                                                                        onChange={(params: any) => {
                                                                            const validators = [...(guardConfig.validators || [])];
                                                                            validators[idx] = { ...validators[idx], params };
                                                                            updateConfig({ guard: { ...guardConfig, validators } as any });
                                                                        }}
                                                                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-[#d7d6d5] font-mono h-20 focus:border-blue-500/50 focus:outline-none"
                                                                        placeholder={VALIDATOR_EXAMPLES[validator.type] || '{\n  "param": "value"\n}'}
                                                                    />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <label className="text-[10px] text-[#888888] mb-1 block">On Fail Action</label>
                                                                <select
                                                                    value={validator.on_fail || 'exception'}
                                                                    onChange={(e) => {
                                                                        const validators = [...(guardConfig.validators || [])];
                                                                        validators[idx].on_fail = e.target.value;
                                                                        updateConfig({ guard: { ...guardConfig, validators } as any });
                                                                    }}
                                                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                                                                >
                                                                    <option value="exception">EXCEPTION - Raise error immediately</option>
                                                                    <option value="filter">FILTER - Remove invalid content</option>
                                                                    <option value="refrain">REFRAIN - Return empty response</option>
                                                                    <option value="reask">REASK - Re-ask LLM to generate again</option>
                                                                    <option value="fix">FIX - Attempt to programmatically fix</option>
                                                                    <option value="fix_reask">FIX_REASK - Try to fix, then reask if needed</option>
                                                                    <option value="noop">NOOP - Pass through (no validation)</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-[#888888] mb-1 block">Apply On</label>
                                                                <select
                                                                    value={validator.on || 'output'}
                                                                    onChange={(e) => {
                                                                        const validators = [...(guardConfig.validators || [])];
                                                                        validators[idx].on = e.target.value as any;
                                                                        updateConfig({ guard: { ...guardConfig, validators } as any });
                                                                    }}
                                                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                                                                >
                                                                    <option value="output">Output - Validate LLM output (default)</option>
                                                                    <option value="input">Input - Validate user input</option>
                                                                </select>
                                                                <p className="text-[9px] text-[#888888] mt-1">Matches: guard.use(..., on="{validator.on || 'output'}")</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}


                                </div>
                            )}

                            {(!guardConfig.validators || guardConfig.validators.length === 0) && (
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2">
                                    <p className="text-[10px] text-yellow-200">[WARN] No validators configured. Add validators below using guard.use() or guard.use_many() methods.</p>
                                </div>
                            )}

                            {/* Add Validator Button - Simplified */}
                            <div className="space-y-2 mt-3">
                                <button
                                    onClick={() => {
                                        // Add a validator with a default type pre-selected
                                        const validators = [...(guardConfig.validators || []), {
                                            type: 'test_length',
                                            params: { min_length: 10, max_length: 1000 },
                                            on_fail: 'exception',
                                            on: 'output'
                                        }];
                                        updateConfig({ guard: { ...guardConfig, validators } as any });
                                    }}
                                    className="flex items-center gap-2 text-xs text-[#d7d6d5] bg-white/10 border border-blue-500/30 rounded-lg px-3 py-2 hover:bg-blue-500/30 transition-colors w-full"
                                >
                                    <Plus size={14} /> Add Output Validator
                                </button>
                                <button
                                    onClick={() => {
                                        const validators = [...(guardConfig.validators || []), {
                                            type: 'test_safety',
                                            params: { restricted_terms: [] },
                                            on_fail: 'exception',
                                            on: 'input'
                                        }];
                                        updateConfig({ guard: { ...guardConfig, validators } as any });
                                    }}
                                    className="flex items-center gap-2 text-xs text-[#888888] border border-white/10 rounded-lg px-3 py-2 hover:bg-white/5 transition-colors w-full"
                                >
                                    <Plus size={14} /> Add Input Validator
                    </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* LLM Configuration for Testing */}
                <div className="space-y-2 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">LLM Configuration (for Testing)</label>
                            <Info size={12} className="text-[#888888]" title="Configure LLM to test guard validation with actual LLM responses. Leave empty to test validation only." />
                    </div>
                        <button onClick={() => toggleSection('guard_llm')} className="text-[#888888] hover:text-white transition-colors">
                            {expandedSections['guard_llm'] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    </div>
                    {expandedSections['guard_llm'] && (
                        <div className="mt-2 space-y-2">
                            <div>
                                <label className="text-[10px] text-[#888888] mb-1 block">LLM Provider</label>
                                <select
                                    value={localConfig.llm?.provider || 'openai'}
                                    onChange={(e) => updateConfig({ llm: { ...localConfig.llm, provider: e.target.value as any } } as any)}
                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                                >
                                    <option value="openai">OpenAI</option>
                                    <option value="anthropic">Anthropic</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-[#888888] mb-1 block">Model</label>
                                <input
                                    type="text"
                                    value={localConfig.llm?.model || ''}
                                    onChange={(e) => updateConfig({ llm: { ...localConfig.llm, model: e.target.value } } as any)}
                                    placeholder="gpt-4o, claude-3-opus-20240229, etc."
                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-[#888888] mb-1 block">API Key</label>
                                <input
                                    type="password"
                                    value={localConfig.llm?.api_key || ''}
                                    onChange={(e) => updateConfig({ llm: { ...localConfig.llm, api_key: e.target.value } } as any)}
                                    placeholder="sk-..."
                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                                />
                            </div>
                            {(localConfig.llm?.provider === 'openai' || localConfig.llm?.provider === 'custom') && (
                                <div>
                                    <label className="text-[10px] text-[#888888] mb-1 block">Base URL (Optional)</label>
                                    <input
                                        type="text"
                                        value={localConfig.llm?.base_url || ''}
                                        onChange={(e) => updateConfig({ llm: { ...localConfig.llm, base_url: e.target.value } } as any)}
                                        placeholder="https://api.openai.com/v1"
                                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                                    />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] text-[#888888] mb-1 block">Temperature</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="2"
                                        value={localConfig.llm?.temperature ?? 0.7}
                                        onChange={(e) => updateConfig({ llm: { ...localConfig.llm, temperature: parseFloat(e.target.value) } } as any)}
                                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-[#888888] mb-1 block">Max Tokens</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="4000"
                                        value={localConfig.llm?.max_tokens ?? 1000}
                                        onChange={(e) => updateConfig({ llm: { ...localConfig.llm, max_tokens: parseInt(e.target.value) } } as any)}
                                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                                    />
                                </div>
                            </div>
                            {(!localConfig.llm?.provider || !localConfig.llm?.model) && (
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 mt-2">
                                    <p className="text-[10px] text-yellow-200">⚠️ Configure LLM (provider, model, API key) to test guard validation with actual LLM responses. Without LLM config, only text validation will run.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // ========== CONTEXT MANAGER CONFIGURATION - ALL FEATURES ==========
    const renderContextConfig = () => {
        const contextConfig = localConfig.context || { keywords: [], approved_contexts: [], threshold: 0.7, context_id: 'default' };

        return (
            <div className="space-y-4">
                {/* Collapsible Definition Dropdown */}
                <div className="bg-[#1E1E1C] border border-white/10 rounded-lg overflow-hidden">
                    <button
                        onClick={() => toggleSection('context_definition')}
                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Brain size={18} className="text-[#888888]" />
                            <span className="text-sm font-medium text-[#d7d6d5]">What is Context Manager?</span>
                            <span className="text-[10px] text-[#888888] bg-white/10 px-2 py-0.5 rounded">Definition</span>
                        </div>
                        {expandedSections['context_definition'] ? <ChevronUp size={16} className="text-[#888888]" /> : <ChevronDown size={16} className="text-[#888888]" />}
                    </button>

                    {expandedSections['context_definition'] && (
                        <div className="px-4 pb-4 bg-[#1E1E1C] border-t border-white/5">
                            <p className="text-[11px] text-[#d7d6d5] mt-3 leading-relaxed">
                                <strong className="text-white">Context Manager</strong> ensures LLM responses stay within approved topics using NLP.
                            </p>
                            <div className="bg-black/30 rounded-lg p-2 mt-2">
                                <p className="text-[10px] text-[#888888]">
                                    It checks if responses match keywords or are similar to approved contexts.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                {/* Keywords */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Keywords</label>
                        <Info size={12} className="text-[#888888]" title="Keywords are matched first (fast check). If any keyword is found, text passes." />
                    </div>
                    <div className="space-y-2">
                        {(contextConfig.keywords || []).map((keyword, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-[#1E1E1C] border border-white/10 rounded-lg p-2">
                                <input
                                    type="text"
                                    value={keyword}
                                    onChange={(e) => {
                                        const keywords = [...(contextConfig.keywords || [])];
                                        keywords[idx] = e.target.value;
                                        updateConfig({ context: { ...contextConfig, keywords } as any });
                                    }}
                                    placeholder="Enter keyword..."
                                    className="flex-1 bg-transparent text-sm text-[#d7d6d5] outline-none"
                                />
                                <button
                                    onClick={() => {
                                        const keywords = [...(contextConfig.keywords || [])];
                                        keywords.splice(idx, 1);
                                        updateConfig({ context: { ...contextConfig, keywords } as any });
                                    }}
                                    className="text-[#888888] hover:text-red-400"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => {
                                const keywords = [...(contextConfig.keywords || []), ''];
                                updateConfig({ context: { ...contextConfig, keywords } as any });
                            }}
                            className="flex items-center gap-2 text-xs text-[#d7d6d5] border border-white/10 rounded-full px-3 py-1.5 hover:bg-white/5 transition-colors w-full"
                        >
                            <Plus size={12} /> Add Keyword
                        </button>
                    </div>
                </div>

                {/* Approved Contexts */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Approved Contexts</label>
                        <Info size={12} className="text-[#888888]" title="Contexts are used for semantic similarity matching. Text is compared against all contexts." />
                    </div>
                    <div className="space-y-2">
                        {(contextConfig.approved_contexts || []).map((context, idx) => (
                            <div key={idx} className="flex items-start gap-2 bg-[#1E1E1C] border border-white/10 rounded-lg p-2">
                    <textarea
                                    value={context}
                                    onChange={(e) => {
                                        const contexts = [...(contextConfig.approved_contexts || [])];
                                        contexts[idx] = e.target.value;
                                        updateConfig({ context: { ...contextConfig, approved_contexts: contexts } as any });
                                    }}
                                    placeholder="Enter approved context string..."
                                    className="flex-1 bg-transparent text-xs text-[#d7d6d5] outline-none resize-none"
                                    rows={3}
                                />
                                <button
                                    onClick={() => {
                                        const contexts = [...(contextConfig.approved_contexts || [])];
                                        contexts.splice(idx, 1);
                                        updateConfig({ context: { ...contextConfig, approved_contexts: contexts } as any });
                                    }}
                                    className="text-[#888888] hover:text-red-400 mt-1"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => {
                                const contexts = [...(contextConfig.approved_contexts || []), ''];
                                updateConfig({ context: { ...contextConfig, approved_contexts: contexts } as any });
                            }}
                            className="flex items-center gap-2 text-xs text-[#d7d6d5] border border-white/10 rounded-full px-3 py-1.5 hover:bg-white/5 transition-colors w-full"
                        >
                            <Plus size={12} /> Add Context
                        </button>
                    </div>
                </div>

                {/* File Upload for Context */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Upload Context File</label>
                    <p className="text-[10px] text-[#888888]">Load contexts from file (txt, json, csv)</p>
                    <input
                        type="file"
                        ref={(el) => fileInputRefs.current['context_file'] = el}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const ext = file.name.split('.').pop()?.toLowerCase();
                                handleFileUpload('context_file', file, ext as any);
                            }
                        }}
                        accept=".txt,.json,.csv"
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRefs.current['context_file']?.click()}
                        className="flex items-center gap-2 text-xs text-[#d7d6d5] border border-white/10 rounded-full px-3 py-1.5 hover:bg-white/5 transition-colors w-full"
                    >
                        <Upload size={12} /> Upload Context File (.txt, .json, .csv)
                    </button>
                    {contextConfig.file_upload && (
                        <p className="text-[10px] text-[#888888] mt-1">{contextConfig.file_upload.name} ({contextConfig.file_type})</p>
                    )}
                </div>

                {/* Similarity Threshold */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">
                            Similarity Threshold: {contextConfig.threshold?.toFixed(2) || '0.70'}
                        </label>
                        <Info size={12} className="text-[#888888]" title="Minimum similarity score (0.0-1.0) required for text to pass. Higher = stricter." />
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={contextConfig.threshold || 0.7}
                        onChange={(e) => {
                            updateConfig({ context: { ...contextConfig, threshold: parseFloat(e.target.value) } as any });
                        }}
                        className="w-full accent-blue-500"
                    />
                    <div className="flex justify-between text-[10px] text-[#888888]">
                        <span>0.0 (Lenient)</span>
                        <span>1.0 (Strict)</span>
                    </div>
                </div>
            </div>
        );
    };

    // ========== RAG CONFIGURATION - ALL FEATURES ==========
    const renderRAGConfig = () => {
        const ragConfig = localConfig.rag || {
            top_k: 5,
            collection_name: 'playground_collection',
            embedding_provider: 'sentence-transformers',
            embedding_model_name: 'all-MiniLM-L6-v2',
            rag_id: 'default',
            hybrid_search: false,
        };

        return (
            <div className="space-y-4">
                {/* Collapsible Definition Dropdown */}
                <div className="bg-[#1E1E1C] border border-white/10 rounded-lg overflow-hidden">
                    <button
                        onClick={() => toggleSection('rag_definition')}
                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Search size={18} className="text-[#888888]" />
                            <span className="text-sm font-medium text-[#d7d6d5]">What is RAG Retriever?</span>
                            <span className="text-[10px] text-[#888888] bg-white/10 px-2 py-0.5 rounded">Definition</span>
                        </div>
                        {expandedSections['rag_definition'] ? <ChevronUp size={16} className="text-[#888888]" /> : <ChevronDown size={16} className="text-[#888888]" />}
                    </button>

                    {expandedSections['rag_definition'] && (
                        <div className="px-4 pb-4 bg-[#1E1E1C] border-t border-white/5">
                            <p className="text-[11px] text-[#d7d6d5] mt-3 leading-relaxed">
                                <strong className="text-white">RAG (Retrieval-Augmented Generation)</strong> grounds LLM responses in your knowledge base.
                            </p>
                            <div className="bg-black/30 rounded-lg p-2 mt-2">
                                <p className="text-[10px] text-[#888888]">
                                    Retrieves relevant info and includes it in the prompt to reduce hallucinations.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                {/* Top K */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Top K Results</label>
                        <Info size={12} className="text-[#888888]" title="Number of most relevant documents to retrieve from your knowledge base for each query. Higher = more context but slower." />
                    </div>
                    <input
                        type="number"
                        min="1"
                        max="20"
                        value={ragConfig.top_k || 5}
                        onChange={(e) => {
                            updateConfig({ rag: { ...ragConfig, top_k: parseInt(e.target.value) || 5 } as any });
                        }}
                        className="w-full bg-[#1E1E1C] border border-white/10 rounded-lg p-2 text-sm text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                    />
                    <p className="text-[10px] text-[#888888]">
                        Retrieves top {ragConfig.top_k || 5} most similar documents. Recommended: 3-5 for focused responses, 10+ for comprehensive context.
                    </p>
                </div>

                {/* Collection Name */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Collection Name</label>
                        <Info size={12} className="text-[#888888]" title="ChromaDB collection name. Different collections can store different knowledge domains. Change this to switch knowledge bases." />
                    </div>
                    <input
                        type="text"
                        value={ragConfig.collection_name || 'playground_collection'}
                        onChange={(e) => {
                            updateConfig({ rag: { ...ragConfig, collection_name: e.target.value } as any });
                        }}
                        placeholder="playground_collection"
                        className="w-full bg-[#1E1E1C] border border-white/10 rounded-lg p-2 text-sm text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                    />
                    <p className="text-[10px] text-[#888888]">All uploaded documents/Q&A pairs are stored in this collection</p>
                </div>

                {/* Embedding Provider */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Embedding Provider</label>
                    <select
                        value={ragConfig.embedding_provider || 'sentence-transformers'}
                        onChange={(e) => {
                            updateConfig({ rag: { ...ragConfig, embedding_provider: e.target.value as any } as any });
                        }}
                        className="w-full bg-[#1E1E1C] border border-white/10 rounded-lg p-2 text-sm text-[#d7d6d5]"
                    >
                        <option value="sentence-transformers">Sentence Transformers (Local)</option>
                        <option value="openai">OpenAI (Requires API Key)</option>
                    </select>
                    <p className="text-[10px] text-[#888888]">Provider for generating embeddings</p>
                </div>

                {/* Embedding Model */}
                {ragConfig.embedding_provider === 'sentence-transformers' && (
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Model Name</label>
                        <input
                            type="text"
                            value={ragConfig.embedding_model_name || 'all-MiniLM-L6-v2'}
                            onChange={(e) => {
                                updateConfig({ rag: { ...ragConfig, embedding_model_name: e.target.value } as any });
                            }}
                            placeholder="all-MiniLM-L6-v2"
                            className="w-full bg-[#1E1E1C] border border-white/10 rounded-lg p-2 text-sm text-[#d7d6d5]"
                        />
                        <p className="text-[10px] text-[#888888]">HuggingFace model name for embeddings</p>
                    </div>
                )}

                {/* Persist Directory */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Persist Directory</label>
                    <input
                        type="text"
                        value={ragConfig.persist_directory || ''}
                        onChange={(e) => {
                            updateConfig({ rag: { ...ragConfig, persist_directory: e.target.value } as any });
                        }}
                        placeholder="Leave empty for in-memory (temporary)"
                        className="w-full bg-[#1E1E1C] border border-white/10 rounded-lg p-2 text-sm text-[#d7d6d5]"
                    />
                    <p className="text-[10px] text-[#888888]">Directory to persist ChromaDB (optional)</p>
                </div>

                {/* Hybrid Search */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={ragConfig.hybrid_search || false}
                            onChange={(e) => updateConfig({ rag: { ...ragConfig, hybrid_search: e.target.checked } as any })}
                            className="accent-blue-500"
                        />
                        <span className="text-xs text-[#d7d6d5]">Enable Hybrid Search (Vector + Keyword)</span>
                    </label>
                    <p className="text-[10px] text-[#888888]">Combines semantic and keyword search for better results</p>
                </div>

                {/* Document Upload */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Upload Documents</label>
                    <p className="text-[10px] text-[#888888]">Add documents to the collection</p>
                    <input
                        type="file"
                        ref={(el) => fileInputRefs.current['rag_document'] = el}
                        onChange={(e) => handleFileUpload('rag_document', e.target.files?.[0] || null)}
                        accept=".txt,.md,.pdf"
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRefs.current['rag_document']?.click()}
                        className="flex items-center gap-2 text-xs text-[#d7d6d5] border border-white/10 rounded-full px-3 py-1.5 hover:bg-white/5 transition-colors w-full"
                    >
                        <Upload size={12} /> Upload Document
                    </button>
                    {ragConfig.document_upload && (
                        <p className="text-[10px] text-[#888888] mt-1">{ragConfig.document_upload.name}</p>
                    )}
                </div>

                {/* Q&A Pairs */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Q&A Pairs</label>
                    <div className="space-y-2">
                        {(ragConfig.qa_pairs || []).map((pair, idx) => (
                            <div key={idx} className="bg-[#1E1E1C] border border-white/10 rounded-lg p-2 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-[#888888]">Pair {idx + 1}</span>
                                    <button
                                        onClick={() => {
                                            const pairs = [...(ragConfig.qa_pairs || [])];
                                            pairs.splice(idx, 1);
                                            updateConfig({ rag: { ...ragConfig, qa_pairs: pairs } as any });
                                        }}
                                        className="text-[#888888] hover:text-red-400"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={pair.question}
                                    onChange={(e) => {
                                        const pairs = [...(ragConfig.qa_pairs || [])];
                                        pairs[idx].question = e.target.value;
                                        updateConfig({ rag: { ...ragConfig, qa_pairs: pairs } as any });
                                    }}
                                    placeholder="Question..."
                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-[#d7d6d5]"
                                />
                                <textarea
                                    value={pair.answer}
                                    onChange={(e) => {
                                        const pairs = [...(ragConfig.qa_pairs || [])];
                                        pairs[idx].answer = e.target.value;
                                        updateConfig({ rag: { ...ragConfig, qa_pairs: pairs } as any });
                                    }}
                                    placeholder="Answer..."
                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-[#d7d6d5] h-16"
                                />
                            </div>
                        ))}
                        <button
                            onClick={() => {
                                const pairs = [...(ragConfig.qa_pairs || []), { question: '', answer: '' }];
                                updateConfig({ rag: { ...ragConfig, qa_pairs: pairs } as any });
                            }}
                            className="flex items-center gap-2 text-xs text-[#d7d6d5] border border-white/10 rounded-full px-3 py-1.5 hover:bg-white/5 transition-colors w-full"
                        >
                            <Plus size={12} /> Add Q&A Pair
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ========== SCORER CONFIGURATION - ALL FEATURES ==========
    const renderScorerConfig = () => {
        const scorerConfig = localConfig.scorer || {
            metrics: ['CosineSimilarityMetric', 'SemanticSimilarityMetric'],
            threshold: 0.7,
            aggregation: 'weighted_average',
            weights: {},
            scorer_id: 'default',
        };

        // Check if scorer can actually be used (needs to be enabled in chat AND have metrics configured)
        const hasMetricsConfigured = (scorerConfig.metrics || []).length > 0;
        const isScorerEnabledInChat = localConfig.chat?.use_scorer;
        const hasDataToScore = isScorerEnabledInChat && hasMetricsConfigured;

        return (
            <div className="space-y-4">
                {/* Collapsible Definition Dropdown */}
                <div className="bg-[#1E1E1C] border border-white/10 rounded-lg overflow-hidden">
                    <button
                        onClick={() => toggleSection('scorer_definition')}
                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <BarChart3 size={18} className="text-[#888888]" />
                            <span className="text-sm font-medium text-[#d7d6d5]">What is Response Scorer?</span>
                            <span className="text-[10px] text-[#888888] bg-white/10 px-2 py-0.5 rounded">Definition</span>
                        </div>
                        {expandedSections['scorer_definition'] ? <ChevronUp size={16} className="text-[#888888]" /> : <ChevronDown size={16} className="text-[#888888]" />}
                    </button>

                    {expandedSections['scorer_definition'] && (
                        <div className="px-4 pb-4 bg-[#1E1E1C] border-t border-white/5">
                            <p className="text-[11px] text-[#d7d6d5] mt-3 leading-relaxed">
                                <strong className="text-white">Response Scorer</strong> evaluates LLM responses <strong>after</strong> generation.
                            </p>
                            <div className="bg-black/30 rounded-lg p-2 mt-2">
                                <p className="text-[10px] text-[#888888]">
                                    Use metrics like Cosine Similarity or ROUGE to valid response quality.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                {/* Info Banner */}
                {!hasMetricsConfigured && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <Info size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs text-amber-300 font-medium mb-1">📊 Response Scorer - Configure Metrics First</p>
                                <p className="text-[10px] text-amber-200/80 mb-2">
                                    Response Scorer evaluates LLM responses <strong>after</strong> they're generated. To use it:
                                </p>
                                <ol className="text-[10px] text-amber-200/80 mt-1 ml-4 list-decimal space-y-1">
                                    <li><strong>Step 1:</strong> Select metrics below (this section) ⬇️</li>
                                    <li><strong>Step 2:</strong> Go to "Chat" section and enable "Use Response Scorer"</li>
                                    <li><strong>Step 3:</strong> Chat with LLM - responses will be automatically scored</li>
                                    <li><strong>Step 4:</strong> View scores in the preview panel</li>
                                </ol>
                                <p className="text-[10px] text-amber-200/80 mt-2 font-medium bg-amber-500/20 p-2 rounded">
                                    💡 <strong>Important:</strong> Select at least one metric below to enable scoring!
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {hasMetricsConfigured && !isScorerEnabledInChat && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2">
                        <p className="text-[10px] text-[#888888] flex items-center gap-1">
                            <Check size={12} className="text-green-500" /> Metrics configured! Now go to "Chat" section and enable "Use Response Scorer" to start scoring responses automatically.
                        </p>
                    </div>
                )}

                {hasDataToScore && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <Info size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs text-green-300 font-medium mb-1">✅ Ready to Score Responses</p>
                                <p className="text-[10px] text-green-200/80">
                                    You have features enabled! Scorer will automatically evaluate LLM responses when you chat. Configure metrics below and ensure "Use Response Scorer" is enabled in Chat configuration.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                {/* Metrics - All 5 types */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Scoring Metrics</label>
                        <Info size={12} className="text-[#888888]" title="Select which metrics to use for scoring. Multiple metrics provide comprehensive quality assessment." />
                    </div>
                    <p className="text-[10px] text-[#888888] mb-2">Select one or more metrics to evaluate response quality:</p>
                    <div className="space-y-2">
                        {[
                            { id: 'CosineSimilarityMetric', label: 'Cosine Similarity', desc: 'Vector cosine similarity' },
                            { id: 'SemanticSimilarityMetric', label: 'Semantic Similarity', desc: 'Semantic meaning similarity' },
                            { id: 'ROUGEMetric', label: 'ROUGE', desc: 'ROUGE score for summarization (ROUGE-1, ROUGE-2, ROUGE-L)' },
                            { id: 'BLEUMetric', label: 'BLEU', desc: 'BLEU score for translation' },
                            { id: 'CustomMetric', label: 'Custom Metric', desc: 'Define your own scoring function' },
                        ].map((metric) => (
                            <label key={metric.id} className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-white/5">
                                <input
                                    type="checkbox"
                                    checked={(scorerConfig.metrics || []).includes(metric.id)}
                                    onChange={(e) => {
                                        const metrics = [...(scorerConfig.metrics || [])];
                                        if (e.target.checked) {
                                            metrics.push(metric.id);
                                        } else {
                                            const idx = metrics.indexOf(metric.id);
                                            if (idx > -1) metrics.splice(idx, 1);
                                        }
                                        updateConfig({ scorer: { ...scorerConfig, metrics } as any });
                                    }}
                                    className="accent-blue-500 mt-1"
                                />
                                <div className="flex-1">
                                    <span className="text-sm text-[#d7d6d5]">{metric.label}</span>
                                    <p className="text-[10px] text-[#888888]">{metric.desc}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Threshold */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">
                            Quality Threshold: {scorerConfig.threshold?.toFixed(2) || '0.70'}
                        </label>
                        <Info size={12} className="text-[#888888]" title="Minimum aggregated score (0.0-1.0) for a response to be considered acceptable. Scores below threshold indicate poor quality." />
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={scorerConfig.threshold || 0.7}
                        onChange={(e) => {
                            updateConfig({ scorer: { ...scorerConfig, threshold: parseFloat(e.target.value) } as any });
                        }}
                        className="w-full accent-blue-500"
                    />
                    <div className="flex justify-between text-[10px] text-[#888888]">
                        <span>0.0 (Accept all)</span>
                        <span>1.0 (Perfect only)</span>
                    </div>
                    <p className="text-[10px] text-[#888888]">
                        Responses with aggregated score {'>='} {scorerConfig.threshold?.toFixed(2) || '0.70'} will pass quality check
                    </p>
                </div>

                {/* Aggregation Method */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Aggregation Method</label>
                        <Info size={12} className="text-[#888888]" title="How to combine scores from multiple metrics into a single aggregated score for comparison against threshold." />
                    </div>
                    <select
                        value={scorerConfig.aggregation || 'weighted_average'}
                        onChange={(e) => {
                            updateConfig({ scorer: { ...scorerConfig, aggregation: e.target.value as any } as any });
                        }}
                        className="w-full bg-[#1E1E1C] border border-white/10 rounded-lg p-2 text-sm text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                    >
                        <option value="weighted_average">Weighted Average - Weight metrics by importance</option>
                        <option value="average">Average - Simple mean of all metrics</option>
                        <option value="min">Minimum - Use lowest score (strictest)</option>
                        <option value="max">Maximum - Use highest score (lenient)</option>
                    </select>
                    <p className="text-[10px] text-[#888888]">
                        {scorerConfig.aggregation === 'weighted_average' && 'Configure weights below for each metric'}
                        {scorerConfig.aggregation === 'average' && 'All metrics contribute equally to final score'}
                        {scorerConfig.aggregation === 'min' && 'Response must pass ALL metrics (strictest)'}
                        {scorerConfig.aggregation === 'max' && 'Response passes if ANY metric is high (lenient)'}
                    </p>
                </div>

                {/* Metric Weights */}
                {(scorerConfig.metrics || []).length > 1 && scorerConfig.aggregation === 'weighted_average' && (
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Metric Weights</label>
                        <div className="space-y-2">
                            {(scorerConfig.metrics || []).map((metric: string) => (
                                <div key={metric} className="flex items-center gap-2">
                                    <span className="text-xs text-[#d7d6d5] w-32 truncate">{metric}</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                        value={scorerConfig.weights?.[metric] || 1.0}
                                        onChange={(e) => {
                                            const weights = { ...(scorerConfig.weights || {}), [metric]: parseFloat(e.target.value) || 1.0 };
                                            updateConfig({ scorer: { ...scorerConfig, weights } as any });
                                        }}
                                        className="flex-1 bg-[#1E1E1C] border border-white/10 rounded px-2 py-1 text-xs text-[#d7d6d5]"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // ========== VALIDATOR CONFIGURATION ==========
    const renderValidatorConfig = () => {
        const validatorConfig = localConfig.validator || {
            validator_type: 'test_length',
            validator_params: { min_length: 10, max_length: 1000 },
            on_fail: 'exception',
        };

        // Check if validator is actually being used in Wall Guard
        const hasValidatorsInGuard = (localConfig.guard?.validators?.length || 0) > 0;
        const isGuardEnabledInChat = localConfig.chat?.use_guard;

        return (
            <div className="space-y-4">
                {/* Collapsible Definition Dropdown */}
                <div className="bg-[#1E1E1C] border border-white/10 rounded-lg overflow-hidden">
                    <button
                        onClick={() => toggleSection('validator_definition')}
                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <FlaskConical size={18} className="text-[#888888]" />
                            <span className="text-sm font-medium text-[#d7d6d5]">What are Validators?</span>
                            <span className="text-[10px] text-[#888888] bg-white/10 px-2 py-0.5 rounded">Definition</span>
                        </div>
                        {expandedSections['validator_definition'] ? <ChevronUp size={16} className="text-[#888888]" /> : <ChevronDown size={16} className="text-[#888888]" />}
                    </button>

                    {expandedSections['validator_definition'] && (
                        <div className="px-4 pb-4 bg-[#1E1E1C] border-t border-white/5">
                            <p className="text-[11px] text-[#d7d6d5] mt-3 leading-relaxed">
                                Test individual <strong>validators</strong> here before adding them to Wall Guard.
                            </p>
                            <div className="bg-black/30 rounded-lg p-2 mt-2">
                                <p className="text-[10px] text-[#888888]">
                                    Configure a validator, test with sample text, then add it to your Wall Guard config.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {hasValidatorsInGuard && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2">
                        <p className="text-[10px] text-green-200/80">
                            ✅ You have {localConfig.guard?.validators?.length} validator(s) in Wall Guard. They'll run automatically when you chat with LLM!
                        </p>
                    </div>
                )}

                {hasValidatorsInGuard && !isGuardEnabledInChat && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
                        <p className="text-[10px] text-amber-200/80">
                            [WARN] Validators configured but not enabled. Go to "Chat" section and enable "Use Wall Guard" to activate them.
                        </p>
                    </div>
                )}
                {/* Validator Type */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Validator Type</label>
                        <Info size={12} className="text-[#888888]" title="Select which validator to test. Each validator checks responses for specific criteria." />
                    </div>
                    <select
                        value={validatorConfig.validator_type || 'test_length'}
                        onChange={(e) => {
                            updateConfig({ validator: { ...validatorConfig, validator_type: e.target.value, validator_params: {} } as any });
                        }}
                        className="w-full bg-[#1E1E1C] border border-white/10 rounded-lg p-2 text-sm text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                    >
                        {availableValidators.map(v => (
                            <option key={v.type} value={v.type}>{v.name}</option>
                        ))}
                    </select>
                    {availableValidators.find(v => v.type === validatorConfig.validator_type) && (
                        <div className="bg-[#1E1E1C] border border-white/10 rounded-lg p-2 mt-1">
                            <p className="text-[10px] text-[#d7d6d5]">
                                {availableValidators.find(v => v.type === validatorConfig.validator_type)?.description}
                            </p>
                        </div>
                    )}
                </div>

                {/* Validator Parameters */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Validator Parameters (JSON)</label>
                        <Info size={12} className="text-[#888888]" title="Configure validator-specific parameters. Each validator type has different required parameters." />
                    </div>
                    {validatorConfig.validator_type === 'test_safety' && (
                        <div className="mb-2 p-3 bg-blue-950/20 border border-blue-500/30 rounded-lg text-[10px] text-[#d7d6d5]">
                            <strong className="text-blue-300 block mb-1">TestSafetyValidator Documentation:</strong>
                            <ul className="list-disc list-inside space-y-1 text-[#888888]">
                                <li><strong>Single words:</strong> Uses word-boundary matching. Example: "kill" matches whole word only (won't match "skills" or "killing")</li>
                                <li><strong>Multi-word phrases:</strong> Matches phrases with flexible spacing/punctuation. Example: "Hello World" matches "Hello, World!", "hello world", "Hello  World"</li>
                                <li><strong>Empty {}:</strong> Uses default terms: ['hack', 'steal', 'bomb', 'kill', 'ignore previous']</li>
                                <li><strong>Format:</strong> {"{"}"restricted_terms": ["term1", "term2", "multi word phrase"]{"}"}</li>
                            </ul>
                        </div>
                    )}
                    <JsonEditor
                        value={validatorConfig.validator_params || {}}
                        onChange={(params: any) => updateConfig({ validator: { ...validatorConfig, validator_params: params } as any })}
                        className="w-full bg-[#1E1E1C] border border-white/10 rounded-lg p-2 text-xs text-[#d7d6d5] font-mono h-32 focus:border-blue-500/50 focus:outline-none"
                        placeholder={VALIDATOR_EXAMPLES[validatorConfig.validator_type] || '{\n  "param": "value"\n}'}
                    />
                    <div className="bg-[#1E1E1C] border border-white/10 rounded-lg p-2">
                        <p className="text-[10px] text-[#888888] font-medium mb-1">Example for {validatorConfig.validator_type}:</p>
                        <p className="text-[10px] text-[#d7d6d5] font-mono">
                            {validatorConfig.validator_type === 'test_length' && '{"min_length": 10, "max_length": 1000}'}
                            {validatorConfig.validator_type === 'test_safety' && '{"restricted_terms": ["hack", "steal", "bomb", "kill", "Hello World"]}'}
                            {!['test_length', 'test_safety'].includes(validatorConfig.validator_type) && 'Configure parameters based on validator requirements'}
                        </p>
                    </div>
                </div>

                {/* On Fail Action */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">On Fail Action</label>
                        <Info size={12} className="text-[#888888]" title="What happens when this validator fails? This is used when the validator is added to Wall Guard." />
                    </div>
                    <select
                        value={validatorConfig.on_fail || 'exception'}
                        onChange={(e) => {
                            updateConfig({ validator: { ...validatorConfig, on_fail: e.target.value } as any });
                        }}
                        className="w-full bg-[#1E1E1C] border border-white/10 rounded-lg p-2 text-sm text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                    >
                        <option value="exception">Exception - Immediately raise error (strictest)</option>
                        <option value="filter">Filter - Remove invalid parts, keep valid content</option>
                        <option value="reask">Reask - Automatically request LLM to generate again</option>
                        <option value="fix">Fix - Attempt to programmatically fix the content</option>
                        <option value="fix_reask">Fix Reask - Try to fix, then reask if fix fails</option>
                        <option value="refrain">Refrain - Return empty/neutral response</option>
                        <option value="noop">Noop - Pass through without validation</option>
                    </select>
                    <p className="text-[10px] text-[#888888]">
                        {validatorConfig.on_fail === 'exception' && 'Block: Stops execution immediately (Best for safety)'}
                        {validatorConfig.on_fail === 'filter' && 'Moderate: Invalid content removed, valid parts kept'}
                        {validatorConfig.on_fail === 'reask' && 'Retry: Re-asks the LLM for a better response'}
                        {validatorConfig.on_fail === 'fix' && 'Repair: System attempts to fix invalid content automatically'}
                        {validatorConfig.on_fail === 'fix_reask' && 'Smart: Fix first, then reask if needed'}
                        {validatorConfig.on_fail === 'refrain' && 'Safe: Return empty response when validation fails'}
                        {validatorConfig.on_fail === 'noop' && '[WARN] Lenient: Ignore validation failures (not recommended)'}
                    </p>
                </div>
            </div>
        );
    };

    // ========== MONITOR CONFIGURATION ==========
    const renderMonitorConfig = () => {
        const monitorConfig = localConfig.monitor || { enable_telemetry: true, track_latency: true, track_metadata: true };
        const hasChatEnabled = localConfig.chat?.use_guard || localConfig.chat?.use_context || localConfig.chat?.use_rag;

        return (
            <div className="space-y-4">
                {/* Collapsible Definition Dropdown */}
                <div className="bg-[#1E1E1C] border border-white/10 rounded-lg overflow-hidden">
                    <button
                        onClick={() => toggleSection('monitor_definition')}
                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Activity size={18} className="text-[#888888]" />
                            <span className="text-sm font-medium text-[#d7d6d5]">What is LLM Monitor?</span>
                            <span className="text-[10px] text-[#888888] bg-white/10 px-2 py-0.5 rounded">Definition</span>
                        </div>
                        {expandedSections['monitor_definition'] ? <ChevronUp size={16} className="text-[#888888]" /> : <ChevronDown size={16} className="text-[#888888]" />}
                    </button>

                    {expandedSections['monitor_definition'] && (
                        <div className="px-4 pb-4 bg-[#1E1E1C] border-t border-white/5">
                            <p className="text-[11px] text-[#d7d6d5] mt-3 leading-relaxed">
                                <strong className="text-white">LLM Monitor</strong> automatically tracks all LLM interactions.
                            </p>
                            <div className="bg-black/30 rounded-lg p-2 mt-2">
                                <p className="text-[10px] text-[#888888]">
                                    No configuration needed - just chat and view stats in the preview panel.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {!hasChatEnabled && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
                        <p className="text-[10px] text-amber-200/80">
                            💡 Tip: Monitor automatically tracks when you chat with LLM. Go to "Chat" section and enable features to start monitoring.
                        </p>
                    </div>
                )}

                <div className="space-y-3">
                    <label className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-white/5">
                        <input
                            type="checkbox"
                            checked={monitorConfig.enable_telemetry !== false}
                            onChange={(e) => updateConfig({ monitor: { ...monitorConfig, enable_telemetry: e.target.checked } as any })}
                            className="accent-blue-500 mt-1"
                        />
                        <div className="flex-1">
                            <span className="text-sm text-[#d7d6d5]">Enable Telemetry (OpenTelemetry)</span>
                            <p className="text-[10px] text-[#888888] mt-0.5">
                                Export monitoring data to OpenTelemetry for distributed tracing and observability
                            </p>
                        </div>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-white/5">
                        <input
                            type="checkbox"
                            checked={monitorConfig.track_latency !== false}
                            onChange={(e) => updateConfig({ monitor: { ...monitorConfig, track_latency: e.target.checked } as any })}
                            className="accent-blue-500 mt-1"
                        />
                        <div className="flex-1">
                            <span className="text-sm text-[#d7d6d5]">Track Latency</span>
                            <p className="text-[10px] text-[#888888] mt-0.5">
                                Monitor how long LLM calls take (response time tracking)
                            </p>
                        </div>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-white/5">
                        <input
                            type="checkbox"
                            checked={monitorConfig.track_metadata !== false}
                            onChange={(e) => updateConfig({ monitor: { ...monitorConfig, track_metadata: e.target.checked } as any })}
                            className="accent-blue-500 mt-1"
                        />
                        <div className="flex-1">
                            <span className="text-sm text-[#d7d6d5]">Track Metadata</span>
                            <p className="text-[10px] text-[#888888] mt-0.5">
                                Include additional context (model name, features used, etc.) in monitoring data
                            </p>
                        </div>
                    </label>
                </div>

                <div className="bg-[#1E1E1C] border border-white/10 rounded-lg p-3 mt-4">
                    <p className="text-xs text-[#d7d6d5] font-medium mb-2">📊 Monitoring Dashboard</p>
                    <p className="text-[10px] text-[#888888]">
                        After chatting with LLM, view comprehensive statistics in the preview panel:
                    </p>
                    <ul className="text-[10px] text-[#888888] mt-1 ml-4 list-disc space-y-0.5">
                        <li>Total interactions and success rate</li>
                        <li>Average latency and performance trends</li>
                        <li>Error distribution and types</li>
                        <li>Token usage and response metrics</li>
                    </ul>
                </div>
            </div>
        );
    };

    // ========== ONFAIL ACTIONS CONFIGURATION ==========
    const renderOnFailActionsConfig = () => {
        const actions = [
            {
                id: 'exception',
                name: 'EXCEPTION',
                color: 'red',
                icon: <Ban size={20} className="text-red-400" />,
                description: 'Raise error immediately when validation fails',
                behavior: 'Raises ValidationError exception. Stops execution. No output returned to user.',
                useCase: 'Safety-critical applications (healthcare, legal, finance)',
                example: 'try:\n  result = guard.validate(text)\nexcept ValidationError as e:\n  print(f"Blocked: {e}")'
            },
            {
                id: 'filter',
                name: 'FILTER',
                color: 'yellow',
                icon: <Filter size={20} className="text-yellow-400" />,
                description: 'Remove invalid content from response, keep valid parts',
                behavior: 'Removes problematic content. Returns cleaned response. No error raised.',
                useCase: 'Content moderation - remove bad phrases while keeping valid content',
                example: '"This is great! Bad word." → "This is great! ."'
            },
            {
                id: 'refrain',
                name: 'REFRAIN',
                color: 'gray',
                icon: <MicOff size={20} className="text-gray-400" />,
                description: 'Return empty or default response when validation fails',
                behavior: 'Returns empty string or default value. No error raised. User gets no response.',
                useCase: 'When no response is safer than a bad response',
                example: 'Unsafe input → "" (empty response)'
            },
            {
                id: 'reask',
                name: 'REASK',
                color: 'blue',
                icon: <RefreshCw size={20} className="text-blue-400" />,
                description: 'Re-ask the LLM to generate a new response with feedback',
                behavior: 'Provides feedback to LLM about validation failure. Re-calls LLM with improved prompt.',
                useCase: 'Quality improvement - automatically retry for better responses',
                example: 'Failed response → LLM re-asked with feedback → New response'
            },
            {
                id: 'fix',
                name: 'FIX',
                color: 'green',
                icon: <Wrench size={20} className="text-green-400" />,
                description: 'Attempt to programmatically fix invalid content',
                behavior: 'Validator provides a fix (via fix_value). Fix is applied automatically.',
                useCase: 'Automatic fixes (e.g., add missing disclaimer, format correction)',
                example: '"Symptom info." → "Symptom info. [Consult your doctor.]"'
            },
            {
                id: 'fix_reask',
                name: 'FIX_REASK',
                color: 'purple',
                icon: <div className="flex gap-1"><Wrench size={16} className="text-purple-400" /><RefreshCw size={16} className="text-purple-400" /></div>,
                description: 'Try to fix first, then reask if fix fails',
                behavior: 'First attempts automatic fix. If fix fails or not available, reasks LLM.',
                useCase: 'Best of both worlds - fast fix when possible, quality retry when needed',
                example: 'Try fix → If fails → Reask LLM'
            },
            {
                id: 'noop',
                name: 'NOOP',
                color: 'gray',
                icon: <Eye size={20} className="text-gray-400" />,
                description: 'Pass through invalid content without blocking (logging only)',
                behavior: 'Invalid content is passed through. Warning is logged. No error raised.',
                useCase: 'Testing validators, monitoring what would be blocked',
                example: '[WARN] Warning logged, but content passes through'
            },
        ];

        const getColorClass = (color: string) => {
            const colors: Record<string, string> = {
                red: 'bg-[#1E1E1C] border-red-500/20 hover:border-red-500/40',
                yellow: 'bg-[#1E1E1C] border-yellow-500/20 hover:border-yellow-500/40',
                gray: 'bg-[#1E1E1C] border-white/10 hover:border-white/20',
                blue: 'bg-[#1E1E1C] border-blue-500/20 hover:border-blue-500/40',
                green: 'bg-[#1E1E1C] border-green-500/20 hover:border-green-500/40',
                purple: 'bg-[#1E1E1C] border-purple-500/20 hover:border-purple-500/40',
            };
            return colors[color] || colors.gray;
        };

        return (
            <div className="space-y-4">
                {/* Collapsible Definition Dropdown */}
                <div className="bg-[#1E1E1C] border border-white/10 rounded-lg overflow-hidden">
                    <button
                        onClick={() => toggleSection('onfail_definition')}
                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={18} className="text-[#888888]" />
                            <span className="text-sm font-medium text-[#d7d6d5]">What are OnFail Actions?</span>
                            <span className="text-[10px] text-[#888888] bg-white/10 px-2 py-0.5 rounded">Definition</span>
                        </div>
                        {expandedSections['onfail_definition'] ? <ChevronUp size={16} className="text-[#888888]" /> : <ChevronDown size={16} className="text-[#888888]" />}
                    </button>

                    {expandedSections['onfail_definition'] && (
                        <div className="px-4 pb-4 bg-[#1E1E1C] border-t border-white/5">
                            <p className="text-[11px] text-[#d7d6d5] mt-3 leading-relaxed">
                                <strong className="text-white">OnFail Actions</strong> define what happens when validation fails.
                            </p>
                            <div className="bg-black/30 rounded-lg p-2 mt-2">
                                <p className="text-[10px] text-[#888888] font-mono">
                                    guard.use(..., OnFailAction.EXCEPTION)
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Selection */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Select Action to Learn About</label>
                    <div className="grid grid-cols-2 gap-2">
                        {actions.map((action) => (
                            <button
                                key={action.id}
                                onClick={() => setSelectedOnFailAction(action.id)}
                                className={`p-2 rounded-lg border text-left transition-all ${selectedOnFailAction === action.id
                                    ? `${getColorClass(action.color)} border`
                                    : 'bg-[#1E1E1C] border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span>{action.icon}</span>
                                    <span className="text-xs font-medium text-[#d7d6d5]">{action.name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Selected Action Details */}
                {selectedOnFailAction && (() => {
                    const action = actions.find(a => a.id === selectedOnFailAction);
                    if (!action) return null;
                    return (
                        <div className={`${getColorClass(action.color)} border rounded-lg p-4 space-y-3`}>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{action.icon}</span>
                                <div>
                                    <h4 className="text-sm font-bold text-[#d7d6d5]">OnFailAction.{action.name}</h4>
                                    <p className="text-[10px] text-[#888888]">{action.description}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="bg-black/30 rounded p-2">
                                    <p className="text-[10px] text-[#888888] font-semibold mb-1">Behavior:</p>
                                    <p className="text-[10px] text-[#d7d6d5]">{action.behavior}</p>
                                </div>
                                <div className="bg-black/30 rounded p-2">
                                    <p className="text-[10px] text-[#888888] font-semibold mb-1">Best Use Case:</p>
                                    <p className="text-[10px] text-[#d7d6d5]">{action.useCase}</p>
                                </div>
                                <div className="bg-black/30 rounded p-2">
                                    <p className="text-[10px] text-[#888888] font-semibold mb-1">Example:</p>
                                    <pre className="text-[10px] text-[#d7d6d5] font-mono whitespace-pre-wrap">{action.example}</pre>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Decision Matrix */}
                <div className="bg-[#1E1E1C] border border-white/10 rounded-lg p-3 mt-4">
                    <p className="text-xs text-[#d7d6d5] font-medium mb-3 flex items-center gap-2">
                        <ClipboardList size={14} className="text-[#888888]" /> Quick Decision Guide
                    </p>
                    <div className="space-y-2 text-[10px]">
                        <div className="flex gap-2">
                            <span className="text-red-400 w-20">Safety Critical:</span>
                            <span className="text-[#d7d6d5]">Use EXCEPTION</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-yellow-400 w-20">Moderation:</span>
                            <span className="text-[#d7d6d5]">Use FILTER</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-blue-400 w-20">Quality:</span>
                            <span className="text-[#d7d6d5]">Use REASK</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-green-400 w-20">Auto-fix:</span>
                            <span className="text-[#d7d6d5]">Use FIX or FIX_REASK</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-gray-400 w-20">Testing:</span>
                            <span className="text-[#d7d6d5]">Use NOOP</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ========== WALL LOGGER CONFIGURATION ==========
    const renderLoggerConfig = () => {
        const loggerConfig = localConfig.logger || {
            level: 'INFO',
            scopes: ['all'],
            output: 'both',
            format: 'both',
            log_file: 'logs/wall_library.log',
            max_bytes: 10485760, // 10MB
            backup_count: 5
        };

        return (
            <div className="space-y-4">
                {/* Collapsible Definition Dropdown */}
                <div className="bg-[#1E1E1C] border border-white/10 rounded-lg overflow-hidden">
                    <button
                        onClick={() => toggleSection('logger_definition')}
                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <FileText size={18} className="text-[#888888]" />
                            <span className="text-sm font-medium text-[#d7d6d5]">What is Wall Logger?</span>
                            <span className="text-[10px] text-[#888888] bg-white/10 px-2 py-0.5 rounded">Definition</span>
                        </div>
                        {expandedSections['logger_definition'] ? <ChevronUp size={16} className="text-[#888888]" /> : <ChevronDown size={16} className="text-[#888888]" />}
                    </button>

                    {expandedSections['logger_definition'] && (
                        <div className="px-4 pb-4 bg-[#1E1E1C] border-t border-white/5">
                            <p className="text-[11px] text-[#d7d6d5] mt-3 leading-relaxed">
                                <strong className="text-white">Wall Logger</strong> provides comprehensive, automatic logging of all operations.
                            </p>
                            <div className="bg-black/30 rounded-lg p-2 mt-2">
                                <p className="text-[10px] text-[#888888]">
                                    Set logger once on components, and all operations are logged automatically.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Log Level */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Log Level</label>
                        <Info size={12} className="text-[#888888]" title="Minimum log level to record" />
                    </div>
                    <select
                        value={loggerConfig.level || 'INFO'}
                        onChange={(e) => updateConfig({ logger: { ...loggerConfig, level: e.target.value as any } as any })}
                        className="w-full bg-[#1E1E1C] border border-white/10 rounded-lg p-2 text-sm text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                    >
                        <option value="DEBUG">DEBUG - All operations (verbose, development)</option>
                        <option value="INFO">INFO - Important operations (recommended for production)</option>
                        <option value="WARNING">WARNING - Warnings and errors only</option>
                        <option value="ERROR">ERROR - Errors only (minimal)</option>
                    </select>
                </div>

                {/* Log Scopes */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Log Scopes</label>
                        <Info size={12} className="text-[#888888]" title="What operations to log" />
                    </div>
                    <p className="text-[9px] text-[#888888]">Select operations to log:</p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {[
                            { scope: 'ALL', desc: 'Log everything (validations, RAG, scoring, LLM calls, monitoring)', icon: <BarChart3 size={14} /> },
                            { scope: 'VALIDATION', desc: 'Log all validation operations (pass/fail, errors)', icon: <Check size={14} /> },
                            { scope: 'RAG', desc: 'Log RAG retrieval operations (queries, results, scores)', icon: <Search size={14} /> },
                            { scope: 'SCORING', desc: 'Log response scoring operations (metrics, scores)', icon: <TrendingUp size={14} /> },
                            { scope: 'LLM_CALLS', desc: 'Log all LLM API calls and responses', icon: <Bot size={14} /> },
                            { scope: 'MONITORING', desc: 'Log monitoring events and statistics', icon: <Activity size={14} /> },
                        ].map(({ scope, desc, icon }) => (
                            <label key={scope} className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-white/5 border border-white/5">
                                <input
                                    type="checkbox"
                                    checked={(loggerConfig.scopes || []).includes(scope.toLowerCase()) || (loggerConfig.scopes || []).includes('all')}
                                    onChange={(e) => {
                                        let scopes = [...(loggerConfig.scopes || [])];
                                        if (scope === 'ALL') {
                                            scopes = e.target.checked ? ['all'] : [];
                                        } else {
                                            scopes = scopes.filter(s => s !== 'all');
                                            if (e.target.checked) {
                                                if (!scopes.includes(scope.toLowerCase())) scopes.push(scope.toLowerCase());
                                            } else {
                                                scopes = scopes.filter(s => s !== scope.toLowerCase());
                                            }
                                        }
                                        updateConfig({ logger: { ...loggerConfig, scopes } as any });
                                    }}
                                    className="accent-emerald-500 mt-0.5"
                                />
                                <div className="flex-1">
                                    <span className="text-xs text-[#d7d6d5] font-medium">{icon} {scope}</span>
                                    <p className="text-[9px] text-[#888888]">{desc}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Output Destination */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Output Destination</label>
                    <select
                        value={loggerConfig.output || 'both'}
                        onChange={(e) => updateConfig({ logger: { ...loggerConfig, output: e.target.value as any } as any })}
                        className="w-full bg-[#1E1E1C] border border-white/10 rounded-lg p-2 text-sm text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                    >
                        <option value="console">Console - Browser console (development)</option>
                        <option value="file">File - Save to log file (production)</option>
                        <option value="both">Both - Console and file (recommended)</option>
                    </select>
                </div>

                {/* Log Format */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Log Format</label>
                    <select
                        value={loggerConfig.format || 'both'}
                        onChange={(e) => updateConfig({ logger: { ...loggerConfig, format: e.target.value as any } as any })}
                        className="w-full bg-[#1E1E1C] border border-white/10 rounded-lg p-2 text-sm text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                    >
                        <option value="json">JSON - Structured format (for log aggregators like ELK, Splunk)</option>
                        <option value="human">Human-readable - Easy to read (for debugging)</option>
                        <option value="both">Both - JSON and human formats</option>
                    </select>
                </div>

                {/* File Configuration */}
                {(loggerConfig.output === 'file' || loggerConfig.output === 'both') && (
                    <div className="space-y-3 bg-[#1E1E1C] border border-white/10 rounded-lg p-3">
                        <p className="text-xs text-[#d7d6d5] font-medium flex items-center gap-2">
                            <Folder size={14} className="text-[#888888]" /> File Configuration
                        </p>

                        <div className="space-y-2">
                            <label className="text-[10px] text-[#888888]">Log File Path</label>
                            <input
                                type="text"
                                value={loggerConfig.log_file || 'logs/wall_library.log'}
                                onChange={(e) => updateConfig({ logger: { ...loggerConfig, log_file: e.target.value } as any })}
                                placeholder="logs/wall_library.log"
                                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-[10px] text-[#888888]">Max Size (MB)</label>
                                <input
                                    type="number"
                                    value={Math.round((loggerConfig.max_bytes || 10485760) / 1048576)}
                                    onChange={(e) => updateConfig({ logger: { ...loggerConfig, max_bytes: parseInt(e.target.value) * 1048576 } as any })}
                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-[#888888]">Backup Count</label>
                                <input
                                    type="number"
                                    value={loggerConfig.backup_count || 5}
                                    onChange={(e) => updateConfig({ logger: { ...loggerConfig, backup_count: parseInt(e.target.value) } as any })}
                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-[#d7d6d5] focus:border-blue-500/50 focus:outline-none"
                                />
                            </div>
                        </div>
                        <p className="text-[9px] text-[#888888]">Log rotation: creates up to {loggerConfig.backup_count || 5} backup files, each max {Math.round((loggerConfig.max_bytes || 10485760) / 1048576)}MB</p>
                    </div>
                )}

                {/* Code Preview */}
                <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                    <p className="text-[10px] text-[#888888] font-semibold mb-2">Generated Code:</p>
                    <pre className="text-[10px] text-emerald-300 font-mono whitespace-pre-wrap">
                        {`logger = WallLogger(
    level="${loggerConfig.level || 'INFO'}",
    scopes=[${(loggerConfig.scopes || ['all']).map(s => `"${s}"`).join(', ')}],
    output="${loggerConfig.output || 'both'}",
    format="${loggerConfig.format || 'both'}"${loggerConfig.log_file ? `,
    log_file="${loggerConfig.log_file}"` : ''}
)`}
                    </pre>
                </div>
            </div>
        );
    };

    // ========== VISUALIZATION CONFIGURATION - ALL 9 TYPES ==========
    const renderVisualizationConfig = () => {
        const vizConfig = localConfig.visualization || {
            types: [],
            output_dir: 'visualizations',
            style: 'default',
            auto_generate: false,
        };
        const hasDataForViz = localConfig.chat?.use_guard || localConfig.chat?.use_context || localConfig.chat?.use_rag || localConfig.chat?.use_scorer;

        return (
            <div className="space-y-4">
                {/* Collapsible Definition Dropdown */}
                <div className="bg-[#1E1E1C] border border-white/10 rounded-lg overflow-hidden">
                    <button
                        onClick={() => toggleSection('viz_definition')}
                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <PieChart size={18} className="text-[#888888]" />
                            <span className="text-sm font-medium text-[#d7d6d5]">What are Visualizations?</span>
                            <span className="text-[10px] text-[#888888] bg-white/10 px-2 py-0.5 rounded">Definition</span>
                        </div>
                        {expandedSections['viz_definition'] ? <ChevronUp size={16} className="text-[#888888]" /> : <ChevronDown size={16} className="text-[#888888]" />}
                    </button>

                    {expandedSections['viz_definition'] && (
                        <div className="px-4 pb-4 bg-[#1E1E1C] border-t border-white/5">
                            <p className="text-[11px] text-[#d7d6d5] mt-3 leading-relaxed">
                                <strong className="text-white">Visualizations</strong> help you analyze interactions, scores, and boundaries.
                            </p>
                            <div className="bg-black/30 rounded-lg p-2 mt-2">
                                <p className="text-[10px] text-[#888888]">
                                    Select types below, chat with the LLM, and see auto-generated charts.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {!hasDataForViz && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
                        <p className="text-[10px] text-amber-200/80 flex items-start gap-1">
                            <Lightbulb size={14} className="text-amber-400 shrink-0 mt-0.5" /> Tip: Visualizations need data from chatting. Configure Chat, enable features, chat with LLM, then visualizations will show results!
                        </p>
                    </div>
                )}

                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Visualization Types</label>
                        <Info size={12} className="text-[#888888]" title="Select which visualizations to generate. Each type shows different aspects of your LLM interactions." />
                    </div>
                    <p className="text-[10px] text-[#888888] mb-2">Select visualizations to generate automatically after chatting:</p>
                    <div className="space-y-2">
                        {[
                            {
                                id: '3d_embeddings',
                                label: '3D Embeddings (Interactive)',
                                desc: 'Interactive 3D scatter plot showing how responses cluster in embedding space. Best for understanding semantic relationships.',
                                requires: 'RAG or Context Manager'
                            },
                            {
                                id: '3d_scores',
                                label: '3D Scores (Multi-metric)',
                                desc: 'Plot responses in 3D space using 3 different metrics (e.g., Cosine, ROUGE, BLEU). See quality distribution.',
                                requires: 'Scorer with 3+ metrics'
                            },
                            {
                                id: 'word_cloud',
                                label: 'Word Cloud',
                                desc: 'Visualize most frequent keywords in responses. Great for understanding topics.',
                                requires: 'Any chat data'
                            },
                            {
                                id: 'context_boundaries',
                                label: 'Context Boundaries',
                                desc: 'Pie chart showing which responses are inside/outside context. Bar chart of similarity scores.',
                                requires: 'Context Manager'
                            },
                            {
                                id: 'monitoring_dashboard',
                                label: 'Monitoring Dashboard',
                                desc: 'Comprehensive analytics: interactions, latency, errors, metrics. Full overview of system performance.',
                                requires: 'Monitor with chat data'
                            },
                            {
                                id: 'scores',
                                label: 'Score Charts',
                                desc: 'Bar charts showing individual metric scores. Color-coded by quality (green/yellow/red).',
                                requires: 'Scorer'
                            },
                            {
                                id: 'validation_results',
                                label: 'Validation Timeline',
                                desc: 'Timeline showing pass/fail results over time. Validator usage statistics.',
                                requires: 'Wall Guard with validation data'
                            },
                            {
                                id: 'rag_retrieval',
                                label: 'RAG Retrieval Analysis',
                                desc: 'Relevance scores and distances for retrieved documents. Shows retrieval quality.',
                                requires: 'RAG Retriever'
                            },
                            {
                                id: 'keywords',
                                label: 'Keyword Frequency',
                                desc: 'Horizontal bar chart showing keyword frequency. Top 20 most common keywords.',
                                requires: 'Context Manager with keywords'
                            },
                        ].map((viz) => (
                            <label key={viz.id} className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-white/5">
                                <input
                                    type="checkbox"
                                    checked={(vizConfig.types || []).includes(viz.id)}
                                    onChange={(e) => {
                                        const types = [...(vizConfig.types || [])];
                                        if (e.target.checked) {
                                            types.push(viz.id);
                                        } else {
                                            const idx = types.indexOf(viz.id);
                                            if (idx > -1) types.splice(idx, 1);
                                        }
                                        updateConfig({ visualization: { ...vizConfig, types } as any });
                                    }}
                                    className="accent-blue-500 mt-1"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-[#d7d6d5]">{viz.label}</span>
                                        <span className="text-[9px] text-[#888888] bg-black/40 px-1.5 py-0.5 rounded">Requires: {viz.requires}</span>
                                    </div>
                                    <p className="text-[10px] text-[#888888] mt-0.5">{viz.desc}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Output Directory</label>
                    <input
                        type="text"
                        value={vizConfig.output_dir || 'visualizations'}
                        onChange={(e) => {
                            updateConfig({ visualization: { ...vizConfig, output_dir: e.target.value } as any });
                        }}
                        className="w-full bg-[#1E1E1C] border border-white/10 rounded-lg p-2 text-sm text-[#d7d6d5]"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Style</label>
                    <select
                        value={vizConfig.style || 'default'}
                        onChange={(e) => {
                            updateConfig({ visualization: { ...vizConfig, style: e.target.value as any } as any });
                        }}
                        className="w-full bg-[#1E1E1C] border border-white/10 rounded-lg p-2 text-sm text-[#d7d6d5]"
                    >
                        <option value="default">Default</option>
                        <option value="seaborn">Seaborn</option>
                        <option value="dark">Dark</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={vizConfig.auto_generate || false}
                            onChange={(e) => updateConfig({ visualization: { ...vizConfig, auto_generate: e.target.checked } as any })}
                            className="accent-blue-500"
                        />
                        <span className="text-xs text-[#d7d6d5]">Auto-generate visualizations after operations</span>
                    </label>
                </div>
            </div>
        );
    };

    // ========== CHAT CONFIGURATION (LLM Integration) ==========
    const renderChatConfig = () => {
        const chatConfig = localConfig.chat || {};
        const llmConfig = localConfig.llm || {
            provider: 'openai',
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
            max_tokens: 1000,
            streaming: false,
            async_mode: false,
        };

        return (
            <div className="space-y-4">
                {/* Collapsible Definition Dropdown */}
                <div className="bg-[#1E1E1C] border border-white/10 rounded-lg overflow-hidden">
                    <button
                        onClick={() => toggleSection('chat_definition')}
                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <MessageSquare size={18} className="text-[#888888]" />
                            <span className="text-sm font-medium text-[#d7d6d5]">What is Chat?</span>
                            <span className="text-[10px] text-[#888888] bg-white/10 px-2 py-0.5 rounded">Definition</span>
                        </div>
                        {expandedSections['chat_definition'] ? <ChevronUp size={16} className="text-[#888888]" /> : <ChevronDown size={16} className="text-[#888888]" />}
                    </button>

                    {expandedSections['chat_definition'] && (
                        <div className="px-4 pb-4 bg-[#1E1E1C] border-t border-white/5">
                            <p className="text-[11px] text-[#d7d6d5] mt-3 leading-relaxed">
                                <strong className="text-white">Chat</strong> lets you test your entire configuration in real-time.
                            </p>
                            <div className="bg-black/30 rounded-lg p-2 mt-2">
                                <p className="text-[10px] text-[#888888]">
                                    Configure LLM settings and enable features (Guard, Context, RAG) to see them in action.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                {/* LLM Provider */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">LLM Provider</label>
                        <button onClick={() => toggleSection('llm')} className="text-[#888888] hover:text-white">
                            {expandedSections['llm'] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    </div>
                    <select
                        value={llmConfig.provider || 'openai'}
                        onChange={(e) => {
                            updateConfig({ llm: { ...llmConfig, provider: e.target.value as any } as any });
                        }}
                        className="w-full bg-[#1E1E1C] border border-white/10 rounded-lg p-2 text-sm text-[#d7d6d5]"
                    >
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic (Claude)</option>
                        <option value="custom">Custom API</option>
                    </select>
                </div>

                {expandedSections['llm'] && (
                    <div className="space-y-2 mt-2">
                        {/* Model Selection */}
                        <div>
                            <label className="text-[10px] text-[#888888] mb-1 block">Model</label>
                            <input
                                type="text"
                                value={llmConfig.model || 'gpt-3.5-turbo'}
                                onChange={(e) => {
                                    updateConfig({ llm: { ...llmConfig, model: e.target.value } as any });
                                }}
                                placeholder="gpt-3.5-turbo"
                                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-[#d7d6d5]"
                            />
                        </div>

                        {/* Custom API Settings */}
                        {llmConfig.provider === 'custom' && (
                            <>
                                <div>
                                    <label className="text-[10px] text-[#888888] mb-1 block">API Key</label>
                                    <input
                                        type="password"
                                        value={llmConfig.api_key || ''}
                                        onChange={(e) => {
                                            updateConfig({ llm: { ...llmConfig, api_key: e.target.value } as any });
                                        }}
                                        placeholder="Your API key"
                                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-[#d7d6d5]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-[#888888] mb-1 block">Base URL</label>
                                    <input
                                        type="text"
                                        value={llmConfig.base_url || ''}
                                        onChange={(e) => {
                                            updateConfig({ llm: { ...llmConfig, base_url: e.target.value } as any });
                                        }}
                                        placeholder="https://api.example.com/v1"
                                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-[#d7d6d5]"
                                    />
                                </div>
                            </>
                        )}

                        {/* Temperature */}
                        <div>
                            <label className="text-[10px] text-[#888888] mb-1 block">Temperature: {llmConfig.temperature || 0.7}</label>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={llmConfig.temperature || 0.7}
                                onChange={(e) => {
                                    updateConfig({ llm: { ...llmConfig, temperature: parseFloat(e.target.value) } as any });
                                }}
                                className="w-full accent-blue-500"
                            />
                        </div>

                        {/* Max Tokens */}
                        <div>
                            <label className="text-[10px] text-[#888888] mb-1 block">Max Tokens</label>
                            <input
                                type="number"
                                min="1"
                                max="4000"
                                value={llmConfig.max_tokens || 1000}
                                onChange={(e) => {
                                    updateConfig({ llm: { ...llmConfig, max_tokens: parseInt(e.target.value) || 1000 } as any });
                                }}
                                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-[#d7d6d5]"
                            />
                        </div>

                        {/* Streaming */}
                        <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={llmConfig.streaming || false}
                                    onChange={(e) => updateConfig({ llm: { ...llmConfig, streaming: e.target.checked } as any })}
                                    className="accent-blue-500"
                                />
                                <span className="text-xs text-[#d7d6d5]">Enable Streaming</span>
                            </label>
                        </div>

                        {/* Async Mode */}
                        <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={llmConfig.async_mode || false}
                                    onChange={(e) => updateConfig({ llm: { ...llmConfig, async_mode: e.target.checked } as any })}
                                    className="accent-blue-500"
                                />
                                <span className="text-xs text-[#d7d6d5]">Async Mode</span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Feature Toggles for Chat */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Enable Features in Chat</label>
                        <Info size={12} className="text-[#888888]" title="Select which features to activate when chatting with LLM. Each feature will automatically run on every message." />
                    </div>
                    <p className="text-[10px] text-[#888888] mb-2">Features run in order: Guard → Context → RAG → LLM → Guard (validation) → Scorer</p>
                    <div className="space-y-2">
                        <label className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-white/5">
                            <input
                                type="checkbox"
                                checked={chatConfig.use_guard !== false}
                                onChange={(e) => updateConfig({ chat: { ...chatConfig, use_guard: e.target.checked } as any })}
                                className="accent-blue-500 mt-1"
                            />
                            <div className="flex-1">
                                <span className="text-sm text-[#d7d6d5]">Use Wall Guard</span>
                                <p className="text-[10px] text-[#888888]">
                                    Validates LLM responses using configured validators. Requires validators to be configured in "Wall Guard" section.
                                    {(localConfig.guard?.validators?.length || 0) === 0 && (
                                        <span className="text-yellow-400 ml-1">[WARN] No validators configured</span>
                                    )}
                                </p>
                            </div>
                        </label>
                        <label className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-white/5">
                            <input
                                type="checkbox"
                                checked={chatConfig.use_context !== false}
                                onChange={(e) => updateConfig({ chat: { ...chatConfig, use_context: e.target.checked } as any })}
                                className="accent-blue-500 mt-1"
                            />
                            <div className="flex-1">
                                <span className="text-sm text-[#d7d6d5]">Use Context Manager</span>
                                <p className="text-[10px] text-[#888888]">
                                    Filters responses to stay within approved topics. Requires keywords or contexts configured in "Context Manager" section.
                                    {(!localConfig.context?.keywords?.length && !localConfig.context?.approved_contexts?.length) && (
                                        <span className="text-yellow-400 ml-1">[WARN] No keywords/contexts configured</span>
                                    )}
                                </p>
                            </div>
                        </label>
                        <label className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-white/5">
                            <input
                                type="checkbox"
                                checked={chatConfig.use_rag || false}
                                onChange={(e) => updateConfig({ chat: { ...chatConfig, use_rag: e.target.checked } as any })}
                                className="accent-blue-500 mt-1"
                            />
                            <div className="flex-1">
                                <span className="text-sm text-[#d7d6d5]">Use RAG Retriever</span>
                                <p className="text-[10px] text-[#888888]">
                                    Retrieves relevant knowledge from your documents before generating response. Requires documents/Q&A pairs to be added in "RAG Agent" section.
                                    {(!localConfig.rag?.qa_pairs?.length && !localConfig.rag?.document_upload) && (
                                        <span className="text-yellow-400 ml-1">[WARN] No documents/Q&A pairs added</span>
                                    )}
                                </p>
                            </div>
                        </label>
                        <label className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-white/5">
                            <input
                                type="checkbox"
                                checked={chatConfig.use_scorer || false}
                                onChange={(e) => updateConfig({ chat: { ...chatConfig, use_scorer: e.target.checked } as any })}
                                className="accent-blue-500 mt-1"
                            />
                            <div className="flex-1">
                                <span className="text-sm text-[#d7d6d5]">Use Response Scorer</span>
                                <p className="text-[10px] text-[#888888]">
                                    Scores response quality after generation. Requires metrics to be configured in "Scorer" section. Best used with RAG or Context Manager for comparison.
                                    {(localConfig.scorer?.metrics?.length || 0) === 0 && (
                                        <span className="text-yellow-400 ml-1">⚠️ No metrics selected</span>
                                    )}
                                </p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Input Type */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Input Type</label>
                    <select
                        value={chatConfig.input_type || 'text'}
                        onChange={(e) => {
                            updateConfig({ chat: { ...chatConfig, input_type: e.target.value as any } as any });
                        }}
                        className="w-full bg-[#1E1E1C] border border-white/10 rounded-lg p-2 text-sm text-[#d7d6d5]"
                    >
                        <option value="text">Text Input</option>
                        <option value="file">File Upload</option>
                    </select>
                    {chatConfig.input_type === 'file' && (
                        <div className="mt-2">
                            <input
                                type="file"
                                ref={(el) => fileInputRefs.current['chat_file'] = el}
                                onChange={(e) => {
                                    updateConfig({ chat: { ...chatConfig, input_file: e.target.files?.[0] || null } as any });
                                }}
                                accept=".txt,.md,.pdf"
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRefs.current['chat_file']?.click()}
                                className="flex items-center gap-2 text-xs text-[#d7d6d5] border border-white/10 rounded-full px-3 py-1.5 hover:bg-white/5 transition-colors w-full"
                            >
                                <Upload size={12} /> Upload File
                            </button>
                            {chatConfig.input_file && (
                                <p className="text-[10px] text-[#888888] mt-1">{chatConfig.input_file.name}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const getTitle = () => {
        const titles: Record<string, string> = {
            'guard': 'Wall Guard Configuration',
            'context-manager': 'Context Manager Configuration',
            'rag': 'RAG Retriever Configuration',
            'scorer': 'Response Scorer Configuration',
            'validators': 'Validator Configuration',
            'onfail-actions': 'OnFail Actions - Failure Handling',
            'monitor': 'LLM Monitor Configuration',
            'logger': 'Wall Logger Configuration',
            'visualization': 'Visualization Configuration',
            'chat': 'Chat Playground - Test Components',
        };
        return titles[activeTool] || 'Configuration';
    };

    const renderConfig = () => {
        switch (activeTool) {
            case 'guard':
                return renderGuardConfig();
            case 'context-manager':
                return renderContextConfig();
            case 'rag':
                return renderRAGConfig();
            case 'scorer':
                return renderScorerConfig();
            case 'validators':
                return renderValidatorConfig();
            case 'onfail-actions':
                return renderOnFailActionsConfig();
            case 'monitor':
                return renderMonitorConfig();
            case 'logger':
                return renderLoggerConfig();
            case 'visualization':
                return renderVisualizationConfig();
            case 'chat':
                return renderChatConfig();
            default:
                return (
                    <div className="text-sm text-[#888888] text-center py-8">
                        <p className="mb-2">No configuration needed for this feature</p>
                        <p className="text-xs text-[#666666]">Select a feature from the sidebar to configure it</p>
                        <p className="text-xs text-red-500 mt-4">Active Tool: {activeTool}</p>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#13120b] border-r border-white/5 overflow-y-auto">
            <div className="p-4 border-b border-white/5 flex justify-between items-center shrink-0">
                <h2 className="text-sm font-semibold text-[#d7d6d5]">{getTitle()}</h2>
                <button className="text-[#888888] hover:text-white transition-colors">
                    <Settings2 size={16} />
                </button>
            </div>
            <div className="p-4 space-y-6 flex-1 overflow-y-auto">
                {renderConfig()}
            </div>
        </div>
    );
};

export default ConfigurationPanel;
