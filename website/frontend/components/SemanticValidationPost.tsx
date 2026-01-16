import React from 'react';
import { ArrowLeft, Clock, Calendar, User, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import CodeCard from './CodeCard';

const SemanticValidationPost: React.FC = () => {
    return (
        <div className="min-h-screen bg-background text-text">
            <div className="max-w-4xl mx-auto px-6 md:px-12 py-12 md:py-20">

                {/* Back Link */}
                <Link to="/" className="flex items-center gap-2 text-muted hover:text-white transition-colors mb-12 font-mono text-sm group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Home</span>
                </Link>

                {/* Header */}
                <header className="mb-12">
                    <div className="flex flex-wrap items-center gap-4 md:gap-6 font-mono text-xs text-muted mb-6 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Jan 5, 2026</span>
                        </div>
                        <span className="text-white/20">|</span>
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>Team LLMWall</span>
                        </div>
                        <span className="text-white/20">|</span>
                        <div className="flex items-center gap-2 text-blue-400">
                            <Tag className="w-4 h-4" />
                            <span>Engineering</span>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold font-sans text-white leading-tight mb-8">
                        The Architecture of Semantic Validation
                    </h1>

                    <p className="text-xl text-muted font-mono leading-relaxed border-l-2 border-blue-500 pl-6 italic">
                        How we reduced latency by 40% while moving from keyword matching to full embedding-based semantic analysis for enterprise LLM guardrails.
                    </p>
                </header>

                {/* Content Body */}
                <article className="prose prose-invert prose-lg max-w-none font-sans">
                    <div className="space-y-8 text-gray-300 leading-relaxed">
                        
                        {/* Introduction */}
                        <div>
                            <p className="text-lg mb-4">
                            Traditional guardrails rely heavily on keyword matching and regex patterns. While fast, this approach is brittle.
                            Users can easily bypass filters by using synonyms, slight misspellings, or creative phrasing.
                                <strong className="text-white"> Semantic Validation</strong> solves this by analyzing the <em>meaning</em> of the input, not just the raw text.
                            </p>
                            <p className="mb-4">
                                In this article, we'll explore how <strong className="text-white">Wall Library</strong> implements semantic validation using NLP techniques,
                                embedding-based similarity, and intelligent caching to provide enterprise-grade security without sacrificing performance.
                            </p>
                        </div>

                        {/* What is Semantic Validation */}
                        <section className="mt-12">
                            <h2 className="text-3xl font-bold text-white mt-12 mb-6">What is Semantic Validation?</h2>
                            <p className="mb-4">
                                Semantic validation goes beyond simple keyword matching. Instead of checking if specific words appear in text,
                                it understands the <em>meaning</em> and <em>intent</em> behind the words. This makes it much harder to bypass
                                security measures through word substitution or creative phrasing.
                            </p>
                            <p className="mb-4">
                                <strong className="text-white">Wall Library's Context Manager</strong> implements semantic validation using two complementary approaches:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 font-mono text-sm text-muted my-6">
                                <li><strong className="text-white">Keyword Matching</strong>: Fast exact/fuzzy keyword matching for quick filtering (Stage 1)</li>
                                <li><strong className="text-white">Semantic Similarity</strong>: Embedding-based similarity using cosine similarity for deep meaning analysis (Stage 2)</li>
                            </ul>
                            <p className="mb-4">
                                This hybrid approach gives you the speed of keyword matching for obvious cases, while semantic similarity catches
                                sophisticated attempts to bypass filters.
                            </p>
                        </section>

                        {/* The Latency Challenge */}
                        <section className="mt-12">
                            <h2 className="text-3xl font-bold text-white mt-12 mb-6">The Latency Challenge</h2>
                            <p className="mb-4">
                            The primary blocker to adopting semantic validation has always been latency.
                            Running an embedding model and performing a vector search for every user prompt adds significant overhead.
                                At Wall Library, our goal was to bring this overhead down to sub-50ms levels while maintaining accuracy.
                            </p>
                            <p className="mb-4">
                                We achieved this through several optimizations:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 font-mono text-sm text-muted my-6">
                                <li><strong className="text-white">Two-Stage Pipeline</strong>: Fast keyword matching first, semantic analysis only when needed</li>
                                <li><strong className="text-white">Efficient Embeddings</strong>: Using sentence-transformers for fast, accurate embeddings</li>
                                <li><strong className="text-white">Smart Caching</strong>: Caching similarity results for semantically similar queries</li>
                                <li><strong className="text-white">Optimized Similarity</strong>: Cosine similarity computation optimized for production</li>
                            </ul>
                        </section>

                        {/* Wall Library Implementation */}
                        <section className="mt-12">
                            <h2 className="text-3xl font-bold text-white mt-12 mb-6">Wall Library's Implementation</h2>
                            <p className="mb-4">
                                Wall Library provides semantic validation through the <strong className="text-white">Context Manager</strong> component.
                                It's designed to be simple to use while providing powerful semantic analysis capabilities.
                            </p>

                            <h3 className="text-2xl font-bold text-white mt-8 mb-4">Basic Setup</h3>
                            <p className="mb-4">
                                Getting started with semantic validation in Wall Library is straightforward:
                            </p>
                            <div className="my-8">
                                <CodeCard
                                    title="basic_semantic_validation.py"
                                    code={`from wall_library.nlp import ContextManager

# Create context manager
context_manager = ContextManager()

# Add keywords that define your domain
context_manager.add_keywords([
    "healthcare", "medical", "doctor", "patient", "symptom",
    "diagnosis", "treatment", "medication", "prescription"
])

# Add approved context strings (used for semantic similarity)
context_manager.add_string_list([
    "General health information and wellness tips",
    "Symptom description and when to seek medical attention",
    "Medication information and dosage instructions",
    "Medical terminology and definitions"
])

# Check if response is within context
response = "Common symptoms of diabetes include increased thirst and frequent urination."

# threshold: minimum similarity score (0.0 to 1.0)
# Default is 0.7 (70% similarity)
is_valid = context_manager.check_context(response, threshold=0.7)

if is_valid:
    print("✅ Response is within approved healthcare context")
else:
    print("❌ Response is outside approved context boundaries")`}
                                    input="Running semantic validation..."
                                    output="✅ Response is within approved healthcare context"
                                    showSidebar={false}
                                />
                            </div>
                        </section>

                        {/* Integration with Wall Guard */}
                        <section className="mt-12">
                            <h2 className="text-3xl font-bold text-white mt-12 mb-6">Integration with Wall Guard</h2>
                            <p className="mb-4">
                                Semantic validation works seamlessly with Wall Library's core validation engine, <strong className="text-white">Wall Guard</strong>.
                                You can combine semantic context checking with other validators for comprehensive protection.
                            </p>
                            <div className="my-8">
                                <CodeCard
                                    title="guard_with_semantic_validation.py"
                                    code={`from wall_library import WallGuard, OnFailAction
from wall_library.nlp import ContextManager
from wall_library.validator_base import Validator, register_validator
from wall_library.classes.validation.validation_result import PassResult, FailResult

# Create custom validator that uses context manager
@register_validator("context_check")
class ContextValidator(Validator):
    def __init__(self, context_manager: ContextManager, threshold: float = 0.7, **kwargs):
        super().__init__(require_rc=False, **kwargs)
        self.context_manager = context_manager
        self.threshold = threshold
    
    def _validate(self, value: str, metadata: dict):
        if not self.context_manager.check_context(value, threshold=self.threshold):
            return FailResult(
                error_message=f"Response outside approved context (threshold: {self.threshold})",
                metadata=metadata
            )
        return PassResult(metadata=metadata)

# Setup context manager
context_manager = ContextManager()
context_manager.add_keywords(["healthcare", "medical", "doctor"])
context_manager.add_string_list([
    "General health information and wellness tips",
    "Symptom description and when to seek medical attention"
])

# Create guard with context validator
guard = WallGuard().use(
    (ContextValidator, {"context_manager": context_manager, "threshold": 0.7}, OnFailAction.EXCEPTION)
)

# Use guard to validate LLM responses
from openai import OpenAI
client = OpenAI(api_key="your-api-key")

def llm_api_call(prompt: str, **kwargs):
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        **kwargs
    )
    return response.choices[0].message.content

# Guard automatically validates context
raw, validated, outcome = guard(
    llm_api=llm_api_call,
    prompt="What are diabetes symptoms?"
)

if outcome.validation_passed:
    print(f"✅ Validated: {validated}")
else:
    print(f"❌ Blocked: {outcome.error_messages}")`}
                                    input="Validating with semantic context..."
                                    output="✅ Validated: Common symptoms of diabetes include increased thirst and frequent urination."
                                    showSidebar={false}
                                />
                            </div>
                        </section>

                        {/* Real-World Healthcare Example */}
                        <section className="mt-12">
                            <h2 className="text-3xl font-bold text-white mt-12 mb-6">Real-World Example: Healthcare Domain</h2>
                            <p className="mb-4">
                                Here's a complete example showing how to use semantic validation in a healthcare application
                                to ensure responses stay within approved medical boundaries:
                            </p>
                            <div className="my-8">
                                <CodeCard
                                    title="healthcare_semantic_validation.py"
                                    code={`from wall_library import WallGuard, OnFailAction
from wall_library.nlp import ContextManager
from wall_library.validator_base import Validator, register_validator
from wall_library.classes.validation.validation_result import PassResult, FailResult

# Healthcare-approved context boundaries
HEALTHCARE_APPROVED_CONTEXTS = [
    "General health information and wellness tips",
    "Symptom description and when to seek medical attention",
    "Medication information and dosage instructions from approved sources",
    "Medical terminology and definitions",
    "Healthcare facility information and appointment scheduling",
    "Preventive care and screening recommendations",
    "Chronic disease management and lifestyle modifications"
]

HEALTHCARE_KEYWORDS = [
    "health", "medical", "doctor", "patient", "symptom", "diagnosis",
    "treatment", "medication", "prescription", "therapy", "wellness",
    "disease", "condition", "hospital", "clinic", "appointment"
]

# Initialize context manager
context_manager = ContextManager()
context_manager.add_keywords(HEALTHCARE_KEYWORDS)
context_manager.add_string_list(HEALTHCARE_APPROVED_CONTEXTS)

# Create context validator
@register_validator("healthcare_context")
class HealthcareContextValidator(Validator):
    def __init__(self, **kwargs):
        super().__init__(require_rc=False, **kwargs)
        self.context_manager = context_manager
    
    def _validate(self, value: str, metadata: dict):
        if not self.context_manager.check_context(value, threshold=0.7):
            return FailResult(
                error_message="Response outside approved healthcare context",
                metadata=metadata
            )
        return PassResult(metadata=metadata)

# Create guard
guard = WallGuard().use(
    (HealthcareContextValidator, {}, OnFailAction.EXCEPTION)
)

# Test responses
test_responses = [
    "Common symptoms of diabetes include increased thirst and frequent urination.",
    "Here's a delicious recipe for chocolate cake. Mix flour, sugar, eggs...",
    "Blood pressure medications should be taken as prescribed by your doctor.",
    "The latest movie reviews and entertainment news..."
]

# Check each response
for response in test_responses:
    result = guard.validate(response)
    status = "✅ APPROVED" if result.validation_passed else "❌ BLOCKED"
    print(f"{status}: {response[:60]}...")`}
                                    input="Testing healthcare semantic validation..."
                                    output="✅ APPROVED: Common symptoms of diabetes include increased thirst...\n❌ BLOCKED: Here's a delicious recipe for chocolate cake...\n✅ APPROVED: Blood pressure medications should be taken...\n❌ BLOCKED: The latest movie reviews and entertainment news..."
                                    showSidebar={false}
                                />
                            </div>
                            <p className="mb-4 mt-6">
                                Notice how semantic validation correctly identifies that cooking recipes and entertainment news
                                are outside the healthcare domain, even though they don't contain explicit keywords that would
                                trigger a simple keyword filter.
                            </p>
                        </section>

                        {/* Loading Contexts from Files */}
                        <section className="mt-12">
                            <h2 className="text-3xl font-bold text-white mt-12 mb-6">Loading Contexts from Files</h2>
                            <p className="mb-4">
                                For production applications, you'll want to manage your approved contexts in external files.
                                Wall Library supports loading contexts from TXT, JSON, and CSV files:
                            </p>
                            <div className="my-8">
                                <CodeCard
                                    title="load_contexts_from_file.py"
                                    code={`from wall_library.nlp import ContextManager

# Create context manager
context_manager = ContextManager()

# Option 1: Load from text file
# File: approved_contexts.txt
# Content:
# General health information and wellness tips
# Symptom description and when to seek medical attention
# Medication information and dosage instructions

context_manager.load_from_file("approved_contexts.txt")

# Option 2: Load from JSON file
# File: contexts.json
# Content:
# [
#   "General health information",
#   "Symptom description",
#   "Medication information"
# ]

context_manager.load_from_file("contexts.json")

# Option 3: Load from CSV file
# File: contexts.csv
# Content:
# General health information,Symptom description,Medication information
# Preventive care,Chronic disease management,Mental health resources

context_manager.load_from_file("contexts.csv")

# Now use the context manager
is_valid = context_manager.check_context(
    "Common symptoms of diabetes include increased thirst.",
    threshold=0.7
)

print(f"Valid: {is_valid}")`}
                                    input="Loading contexts from files..."
                                    output="✅ Contexts loaded from approved_contexts.txt\n✅ Contexts loaded from contexts.json\n✅ Contexts loaded from contexts.csv\nValid: True"
                                    showSidebar={false}
                                />
                            </div>
                        </section>

                        {/* Complete Production Example */}
                        <section className="mt-12">
                            <h2 className="text-3xl font-bold text-white mt-12 mb-6">Complete Production Example</h2>
                            <p className="mb-4">
                                Here's a complete production-ready example that combines semantic validation with other
                                Wall Library features for comprehensive LLM protection:
                            </p>
                            <div className="my-8">
                            <CodeCard
                                    title="production_semantic_validation.py"
                                    code={`from wall_library import WallGuard, OnFailAction, WallLogger, LogScope
from wall_library.nlp import ContextManager
from wall_library.validator_base import Validator, register_validator
from wall_library.classes.validation.validation_result import PassResult, FailResult
from wall_library.monitoring import LLMMonitor
from openai import OpenAI
import os

# 1. Setup logging
logger = WallLogger(
    level="INFO",
    scopes=[LogScope.ALL.value],
    output="file",
    log_file="semantic_validation.log"
)

# 2. Setup context manager
context_manager = ContextManager()
context_manager.load_from_file("approved_contexts.txt")  # Load from file

# 3. Create semantic context validator
@register_validator("semantic_context")
class SemanticContextValidator(Validator):
    def __init__(self, **kwargs):
        super().__init__(require_rc=False, **kwargs)
        self.context_manager = context_manager
    
    def _validate(self, value: str, metadata: dict):
        # Check semantic similarity
        is_valid = self.context_manager.check_context(value, threshold=0.7)
        
        if not is_valid:
            return FailResult(
                error_message="Response outside approved semantic context",
                metadata={**metadata, "threshold": 0.7}
            )
        return PassResult(metadata=metadata)

# 4. Create guard with semantic validation
guard = WallGuard(
    name="semantic_guard",
    logger=logger
).use(
    (SemanticContextValidator, {}, OnFailAction.EXCEPTION)
)

# 5. Setup monitoring
monitor = LLMMonitor()
monitor.set_logger(logger)

# 6. LLM client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def llm_api_call(prompt: str, **kwargs):
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        **kwargs
    )
    return response.choices[0].message.content

# 7. Process query with semantic validation
def process_query(query: str):
    import time
    start_time = time.time()
    
    try:
        # Guard automatically validates semantic context
        raw, validated, outcome = guard(
            llm_api=llm_api_call,
            prompt=query
        )
        
        latency = time.time() - start_time
        
        # Monitor interaction
        monitor.track_call(
            input_data=query,
            output=validated or raw,
            metadata={
                "validation_passed": outcome.validation_passed,
                "semantic_validation": True
            },
            latency=latency
        )
        
        return validated if outcome.validation_passed else None
        
    except Exception as e:
        # Log and track errors
        latency = time.time() - start_time
        monitor.track_call(
            input_data=query,
            output="",
            metadata={"error": str(e), "validation_passed": False},
            latency=latency
        )
        raise

# Use it
result = process_query("What are diabetes symptoms?")
print(f"Result: {result}")`}
                                    input="Processing query with semantic validation..."
                                    output="Result: Common symptoms of diabetes include increased thirst and frequent urination."
                                showSidebar={false}
                            />
                        </div>
                        </section>

                        {/* Performance Optimization */}
                        <section className="mt-12">
                            <h2 className="text-3xl font-bold text-white mt-12 mb-6">Performance Optimization</h2>
                            <p className="mb-4">
                                Wall Library's semantic validation is optimized for production use. Here are the key optimizations:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 font-mono text-sm text-muted my-6">
                                <li><strong className="text-white">Two-Stage Pipeline</strong>: Keyword matching first (fast), semantic analysis only when needed</li>
                                <li><strong className="text-white">Efficient Embeddings</strong>: Uses sentence-transformers for fast, accurate embeddings</li>
                                <li><strong className="text-white">Cosine Similarity</strong>: Optimized vector similarity computation</li>
                                <li><strong className="text-white">Configurable Thresholds</strong>: Adjust similarity threshold based on your needs (0.7 default)</li>
                            </ul>
                            <p className="mb-4">
                                In our benchmarks, semantic validation adds less than 50ms of latency on average, making it suitable
                                for production applications.
                            </p>
                        </section>

                        {/* Best Practices */}
                        <section className="mt-12">
                            <h2 className="text-3xl font-bold text-white mt-12 mb-6">Best Practices</h2>
                            <p className="mb-4">
                                When implementing semantic validation with Wall Library, follow these best practices:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 font-mono text-sm text-muted my-6">
                                <li><strong className="text-white">Define Clear Contexts</strong>: Be specific about what's approved. Vague contexts lead to inconsistent results</li>
                                <li><strong className="text-white">Use Appropriate Thresholds</strong>: Start with 0.7, adjust based on your needs (higher = stricter)</li>
                                <li><strong className="text-white">Combine with Keywords</strong>: Use both keyword matching and semantic similarity for best results</li>
                                <li><strong className="text-white">Load from Files</strong>: Manage contexts in external files for easier updates</li>
                                <li><strong className="text-white">Monitor Performance</strong>: Track validation results to understand system behavior</li>
                                <li><strong className="text-white">Test Thoroughly</strong>: Test with edge cases to ensure your contexts work as expected</li>
                            </ul>
                        </section>

                        {/* Call to Action */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-8 mt-12">
                            <h4 className="font-bold text-white mb-4 text-xl">Ready to try semantic validation?</h4>
                            <p className="text-sm font-mono text-muted mb-6 leading-relaxed">
                                Wall Library makes semantic validation easy with its Context Manager component.
                                Get started in minutes with comprehensive documentation and examples.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link 
                                    to="/documentation" 
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors font-mono text-sm"
                                >
                                    Read Documentation
                                </Link>
                                <a 
                                    href="https://github.com/hritvikgupta/wall.git" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-colors font-mono text-sm border border-white/20"
                                >
                                    View Source
                                </a>
                            </div>
                        </div>

                    </div>
                </article>

            </div>
        </div>
    );
};

export default SemanticValidationPost;
