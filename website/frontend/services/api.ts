/**
 * API client for Wall Library Playground backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

export interface GuardValidateRequest {
  text: string;
  guard_id?: string;
  validators?: Array<{
    type: string;
    params?: Record<string, any>;
    on_fail?: string;
    on?: 'input' | 'output';
  }>;
  num_reasks?: number;
  name?: string;
}

export interface GuardValidateResponse {
  validated_output: string;
  raw_output: string;
  validation_passed: boolean;
  metadata: Record<string, any>;
}

export interface ContextCheckRequest {
  text: string;
  context_id?: string;
  keywords?: string[];
  approved_contexts?: string[];
  threshold?: number;
  use_advanced_algo?: boolean;
  llm_provider?: string;
  llm_model?: string;
  llm_prompt_template?: string;
  openai_api_key?: string;
  llm_temperature?: number;
  strategy?: 'heuristic' | 'llm_check';
}

export interface ContextCheckResponse {
  is_valid: boolean;
  threshold: number;
  similarities: Array<{
    context: string;
    similarity: number;
  }>;
  max_similarity: number;
}

export interface ImageContextCheckRequest {
  image: string; // URL or Base64
  context_id?: string;
  keywords?: string[];
  approved_contexts?: string[];
  llm_provider?: string;
  llm_model?: string;
  llm_prompt_template?: string;
  openai_api_key?: string;
  llm_temperature?: number;
}

export interface ImageContextCheckResponse {
  is_valid: boolean;
  provider: string;
}

export interface RAGRetrieveRequest {
  query: string;
  rag_id?: string;
  top_k?: number;
  collection_name?: string;
  embedding_provider?: 'sentence-transformers' | 'openai';
  embedding_model_name?: string;
}

export interface RAGRetrieveResponse {
  query: string;
  results: Array<{
    document: string;
    metadata: Record<string, any>;
    score: number;
    distance: number;
  }>;
  count: number;
}

export interface ScorerCalculateRequest {
  response: string;
  reference: string;
  scorer_id?: string;
  metrics?: string[];
  threshold?: number;
  aggregation?: 'weighted_average' | 'average' | 'min' | 'max';
  weights?: Record<string, number>;
}

export interface ScorerCalculateResponse {
  response: string;
  reference: string;
  scores: Record<string, number>;
  aggregated_score: number;
  threshold: number;
  passed: boolean;
}

export interface ValidatorTestRequest {
  text: string;
  validator_type: string;
  validator_params?: Record<string, any>;
}

export interface ValidatorTestResponse {
  passed: boolean;
  result: string;
  error_message?: string;
  error?: string;
  metadata: Record<string, any>;
}

export interface ValidatorInfo {
  type: string;
  name: string;
  description: string;
}

export interface MonitorTrackRequest {
  input: string;
  output: string;
  metadata?: Record<string, any>;
  latency?: number;
}

export interface MonitorStatsResponse {
  total_interactions: number;
  successful_interactions: number;
  failed_interactions: number;
  success_rate: number;
  avg_latency: number;
  errors: Record<string, number>;
}

export interface VisualizationData {
  scores: Array<{
    x: number;
    y: number;
    z: number;
    label: string;
  }>;
  context_boundaries: {
    inside: number;
    outside: number;
  };
  word_frequencies: Record<string, number>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Guard endpoints
  async validateGuard(request: GuardValidateRequest): Promise<GuardValidateResponse> {
    return this.request<GuardValidateResponse>('/api/guard/validate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Context Manager endpoints
  async checkContext(request: ContextCheckRequest): Promise<ContextCheckResponse> {
    return this.request<ContextCheckResponse>('/api/context/check', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async checkImageContext(request: ImageContextCheckRequest): Promise<ImageContextCheckResponse> {
    return this.request<ImageContextCheckResponse>('/api/context/check_image', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // RAG endpoints
  async retrieveRAG(request: RAGRetrieveRequest): Promise<RAGRetrieveResponse> {
    return this.request<RAGRetrieveResponse>('/api/rag/retrieve', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Scorer endpoints
  async calculateScores(request: ScorerCalculateRequest): Promise<ScorerCalculateResponse> {
    return this.request<ScorerCalculateResponse>('/api/scorer/calculate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Validator endpoints
  async testValidator(request: ValidatorTestRequest): Promise<ValidatorTestResponse> {
    return this.request<ValidatorTestResponse>('/api/validators/test', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async listValidators(): Promise<{ validators: ValidatorInfo[] }> {
    return this.request<{ validators: ValidatorInfo[] }>('/api/validators/list', {
      method: 'GET',
    });
  }

  // Monitor endpoints
  async trackInteraction(request: MonitorTrackRequest): Promise<{ status: string }> {
    return this.request<{ status: string }>('/api/monitor/track', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getMonitorStats(): Promise<MonitorStatsResponse> {
    return this.request<MonitorStatsResponse>('/api/monitor/stats', {
      method: 'GET',
    });
  }

  // Visualization endpoints
  async getVisualizationData(): Promise<VisualizationData> {
    return this.request<VisualizationData>('/api/visualization/data', {
      method: 'GET',
    });
  }

  // Chat endpoint
  async chat(request: {
    prompt: string;
    llm_config: {
      provider: 'openai' | 'anthropic' | 'custom';
      model: string;
      api_key?: string;
      base_url?: string;
      temperature?: number;
      max_tokens?: number;
    };
    guard_config?: any;
    guard_id?: string;
  }): Promise<{
    response: string | null;
    raw_response?: string;
    input_validated: boolean;
    output_validated: boolean | null;
    input_validation_result?: any;
    output_validation_result?: any;
    error?: string;
    validation_stage?: string;
  }> {
    return this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
