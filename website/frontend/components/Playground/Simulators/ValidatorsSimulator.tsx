import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertOctagon, Settings } from 'lucide-react';
import apiClient, { ValidatorTestRequest } from '../../../services/api';
import { ValidatorConfig } from '../../../types';

interface ValidatorsSimulatorProps {
    config?: ValidatorConfig;
}

const ValidatorsSimulator: React.FC<ValidatorsSimulatorProps> = ({ config }) => {
    const [selectedValidator, setSelectedValidator] = useState(config?.validator_type || 'min_length');
    const [validatorParams, setValidatorParams] = useState(config?.validator_params || { min: 10 });
    const [input, setInput] = useState('');
    const [result, setResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validators, setValidators] = useState<any[]>([]);

    useEffect(() => {
        loadValidators();
    }, []);

    useEffect(() => {
        if (config?.validator_type) {
            setSelectedValidator(config.validator_type);
        }
        if (config?.validator_params) {
            setValidatorParams(config.validator_params);
        }
    }, [config]);

    const loadValidators = async () => {
        try {
            const response = await apiClient.listValidators();
            setValidators(response.validators);
        } catch (err) {
            // Fallback to default validators
            setValidators([
                { type: 'min_length', name: 'MinLengthValidator', description: 'Enforces minimum character count' },
                { type: 'email', name: 'EmailValidator', description: 'Validates email format strictness' },
            ]);
        }
    };

    const testValidator = async () => {
        if (!input.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const request: ValidatorTestRequest = {
                text: input,
                validator_type: selectedValidator,
                validator_params: validatorParams,
            };

            const response = await apiClient.testValidator(request);
            setResult({
                passed: response.passed,
                message: response.passed
                    ? `Pass: ${response.result}`
                    : `Fail: ${response.error_message || response.error || 'Validation failed'}`,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <CheckCircle className="text-green-500" /> Validator Workbench
                </h2>
                <p className="text-zinc-400 mt-2">
                    Test individual validation logic in isolation. Configure parameters and verify edge cases.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <div className="col-span-1 space-y-6">
                    <div className="bg-zinc-900 border border-white/10 rounded-xl p-5">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Settings size={14} /> Configuration
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-zinc-300 block mb-2">Select Validator</label>
                                <select
                                    value={selectedValidator}
                                    onChange={(e) => setSelectedValidator(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-green-500/50 outline-none"
                                >
                                    {validators.map(v => (
                                        <option key={v.type} value={v.type}>{v.name}</option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-zinc-500 mt-2 leading-tight">
                                    {validators.find(v => v.type === selectedValidator)?.description}
                                </p>
                            </div>

                            {selectedValidator === 'min_length' && (
                                <div>
                                    <label className="text-sm text-zinc-300 block mb-2">
                                        Min Length: {validatorParams.min || 10}
                                    </label>
                                    <input
                                        type="range"
                                        min="1" max="50"
                                        value={validatorParams.min || 10}
                                        onChange={(e) => setValidatorParams({ ...validatorParams, min: parseInt(e.target.value) })}
                                        className="w-full accent-green-500"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Test Area */}
                <div className="col-span-1 md:col-span-2 space-y-6">
                    <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
                        <label className="text-sm font-semibold text-zinc-300 mb-2 block">Test Input</label>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    testValidator();
                                }
                            }}
                            placeholder="Type here to validate..."
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-green-500/50 outline-none transition-all"
                        />
                        <button
                            onClick={testValidator}
                            disabled={isLoading || !input.trim()}
                            className="mt-4 w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Testing...' : 'Test Validator'}
                        </button>

                        {/* Error Display */}
                        {error && (
                            <div className="mt-4 p-4 rounded-lg border bg-red-900/20 border-red-500/30 text-red-400">
                                {error}
                            </div>
                        )}

                        {/* Result */}
                        {result && (
                            <div className={`mt-4 p-4 rounded-lg border flex items-center gap-3 ${
                                result.passed
                                    ? 'bg-green-900/20 border-green-500/30 text-green-400'
                                    : 'bg-red-900/20 border-red-500/30 text-red-400'
                            }`}>
                                {result.passed ? <CheckCircle size={20} /> : <AlertOctagon size={20} />}
                                <span className="font-medium">{result.message}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ValidatorsSimulator;
