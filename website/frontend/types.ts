export interface BlogPost {
  id: string;
  date: string;
  author: string;
  category: string;
  title: string;
  excerpt: string;
  imageUrl: string;
}

export interface NavLink {
  label: string;
  href: string;
}

// ========== COMPREHENSIVE PLAYGROUND CONFIGURATION TYPES ==========

// Wall Guard Configuration - ALL features
export interface GuardConfig {
  validators: Array<{
    type: string;
    params: Record<string, any>;
    on_fail: string;
    on?: 'input' | 'output';
  }>;
  guard_id?: string;
  name?: string;
  num_reasks?: number;
  logger?: LoggerConfig;
  tracer?: boolean; // Enable telemetry
  schema_type?: 'none' | 'pydantic' | 'rail' | 'json_schema';
  schema_content?: string; // Pydantic model code, RAIL string, or JSON Schema
  schema_file?: File | null; // For file uploads
}

// Context Manager Configuration - ALL features
export interface ContextConfig {
  keywords: string[];
  approved_contexts: string[];
  threshold: number;
  context_id?: string;
  file_upload?: File | null; // For txt, json, csv files
  file_type?: 'txt' | 'json' | 'csv' | null;
}

// RAG Retriever Configuration - ALL features
export interface RAGConfig {
  top_k: number;
  collection_name: string;
  rag_id?: string;
  embedding_provider?: 'sentence-transformers' | 'openai';
  embedding_model_name?: string;
  persist_directory?: string;
  hybrid_search?: boolean; // Enable hybrid search (vector + keyword)
  document_upload?: File | null; // For uploading documents to add to collection
  qa_pairs?: Array<{ question: string; answer: string }>; // Q&A pairs to add
}

// Response Scorer Configuration - ALL features
export interface ScorerConfig {
  metrics: string[]; // All 5 metrics: CosineSimilarityMetric, SemanticSimilarityMetric, ROUGEMetric, BLEUMetric, CustomMetric
  scorer_id?: string;
  threshold?: number;
  aggregation?: 'weighted_average' | 'average' | 'min' | 'max';
  weights?: Record<string, number>;
}

// Validator Configuration
export interface ValidatorConfig {
  validator_type: string;
  validator_params: Record<string, any>;
  on_fail?: string;
}

// Logger Configuration - ALL features
export interface LoggerConfig {
  level?: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';
  scopes?: string[]; // VALIDATIONS, RAG, SCORING, LLM_CALLS, MONITORING, ERRORS, ALL
  output?: 'console' | 'file' | 'both';
  format?: 'json' | 'human' | 'both';
  log_file?: string;
  max_bytes?: number;
  backup_count?: number;
}

// Visualization Configuration - ALL 9 types
export interface VisualizationConfig {
  types?: string[]; // 3d_embeddings, 3d_scores, word_cloud, context_boundaries, monitoring_dashboard, scores, validation_results, rag_retrieval, keywords
  output_dir?: string;
  style?: 'default' | 'seaborn' | 'dark';
  auto_generate?: boolean; // Auto-generate visualizations after operations
}

// Monitor Configuration
export interface MonitorConfig {
  enable_telemetry?: boolean;
  track_latency?: boolean;
  track_metadata?: boolean;
}

// LLM Integration Configuration
export interface LLMConfig {
  provider?: 'openai' | 'anthropic' | 'custom';
  model?: string; // e.g., 'gpt-3.5-turbo', 'gpt-4', 'claude-3-opus'
  api_key?: string; // For custom API
  base_url?: string; // For custom API
  temperature?: number;
  max_tokens?: number;
  streaming?: boolean;
  async_mode?: boolean;
}

// Schema Systems Configuration
export interface SchemaConfig {
  type?: 'pydantic' | 'rail' | 'json_schema';
  content?: string; // Pydantic model code, RAIL string, or JSON Schema
  file?: File | null; // For file uploads
}

// Chat Configuration (for testing with LLM)
export interface ChatConfig {
  llm?: LLMConfig;
  use_guard?: boolean;
  use_context?: boolean;
  use_rag?: boolean;
  use_scorer?: boolean;
  input_type?: 'text' | 'file';
  input_file?: File | null;
}

// Complete Playground Configuration
export interface PlaygroundConfig {
  guard?: GuardConfig;
  context?: ContextConfig;
  rag?: RAGConfig;
  scorer?: ScorerConfig;
  validator?: ValidatorConfig;
  logger?: LoggerConfig;
  visualization?: VisualizationConfig;
  monitor?: MonitorConfig;
  llm?: LLMConfig;
  schema?: SchemaConfig;
  chat?: ChatConfig;
}
