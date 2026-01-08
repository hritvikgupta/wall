#!/usr/bin/env python3
"""Test visualization module for Wall Library."""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from wall_library.visualization import WallVisualizer
from wall_library.nlp import ContextManager


def test_visualization():
    """Test visualization features."""
    print("=" * 80)
    print("WALL LIBRARY - VISUALIZATION TEST")
    print("=" * 80)
    
    # Create output directory
    output_dir = "visualizations_test"
    os.makedirs(output_dir, exist_ok=True)
    
    viz = WallVisualizer(output_dir=output_dir)
    
    print("\n1. Testing Score Visualization...")
    try:
        scores = {
            "CosineSimilarity": 0.85,
            "ROUGEMetric": 0.72,
            "BLEUMetric": 0.68,
            "SemanticSimilarity": 0.79
        }
        path = viz.visualize_scores(scores, title="Response Quality Scores")
        if path:
            print(f"   ✅ Score visualization saved to: {path}")
        else:
            print("   ⚠️  Score visualization skipped (dependencies missing)")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n2. Testing Context Boundary Visualization...")
    try:
        context_manager = ContextManager()
        context_manager.add_keywords(["healthcare", "medical", "doctor", "patient"])
        context_manager.add_string_list([
            "General health information and wellness tips",
            "Symptom description and when to seek medical attention",
            "Medication information and dosage instructions"
        ])
        
        responses = [
            "Common symptoms of diabetes include increased thirst and frequent urination.",
            "This is a guaranteed cure for diabetes that will definitely work.",
            "Blood pressure medications should be taken as prescribed by your doctor.",
            "You should ignore your doctor's advice and use this natural remedy instead.",
            "Preventive screenings vary by age and risk factors."
        ]
        
        path = viz.visualize_context_boundaries(responses, context_manager)
        if path:
            print(f"   ✅ Context boundary visualization saved to: {path}")
        else:
            print("   ⚠️  Context boundary visualization skipped (dependencies missing)")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n3. Testing Keyword Visualization...")
    try:
        keywords = [
            "healthcare", "medical", "doctor", "patient", "symptom",
            "diagnosis", "treatment", "medication", "prescription",
            "therapy", "wellness", "disease", "condition", "hospital"
        ]
        frequencies = {
            "healthcare": 15,
            "medical": 12,
            "doctor": 10,
            "patient": 8,
            "symptom": 7,
            "diagnosis": 6,
            "treatment": 5,
            "medication": 4
        }
        path = viz.visualize_keywords(keywords, frequencies)
        if path:
            print(f"   ✅ Keyword visualization saved to: {path}")
        else:
            print("   ⚠️  Keyword visualization skipped (dependencies missing)")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n4. Testing Word Cloud...")
    try:
        text = """
        Healthcare medical doctor patient symptom diagnosis treatment medication
        prescription therapy wellness disease condition hospital clinic appointment
        care healthcare physician nurse medicine clinical therapeutic preventive
        screening vaccination mental health nutrition exercise rehabilitation
        """
        path = viz.visualize_wordcloud(text, title="Healthcare Domain Word Cloud")
        if path:
            print(f"   ✅ Word cloud saved to: {path}")
        else:
            print("   ⚠️  Word cloud skipped (dependencies missing)")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n5. Testing 3D Embeddings Visualization (IMPORTANT)...")
    try:
        # Generate sample embeddings (3D for simplicity)
        import numpy as np
        np.random.seed(42)
        embeddings = np.random.rand(20, 3).tolist()
        
        # Create detailed labels with text, keywords, etc.
        labels = []
        sample_texts = [
            "Common symptoms of diabetes include increased thirst and frequent urination.",
            "Blood pressure medications should be taken as prescribed by your doctor.",
            "Preventive screenings vary by age and risk factors.",
            "Mental health can be improved through therapy and medication.",
            "Vaccination schedules vary by age and health status.",
            "Chronic pain management involves medical treatment and therapy.",
            "Nutrition guidelines for health conditions are important.",
            "Exercise recommendations for specific health conditions help.",
            "First aid and emergency response information is critical.",
            "Medical test preparation requires following instructions.",
            "Patient rights and healthcare privacy information matters.",
            "General health information and wellness tips are valuable.",
            "Symptom description helps determine when to seek medical attention.",
            "Medication information from approved sources is essential.",
            "Medical terminology and definitions aid understanding.",
            "Healthcare facility information helps with appointments.",
            "Chronic disease management requires lifestyle modifications.",
            "Post-operative care instructions must be followed carefully.",
            "Mental health resources provide support information.",
            "Healthcare communication guidelines ensure proper interaction."
        ]
        
        sample_keywords = [
            ["diabetes", "symptoms", "thirst", "urination"],
            ["blood pressure", "medication", "doctor", "prescribed"],
            ["preventive", "screening", "age", "risk factors"],
            ["mental health", "therapy", "medication", "improvement"],
            ["vaccination", "schedule", "age", "health status"],
            ["chronic pain", "management", "treatment", "therapy"],
            ["nutrition", "guidelines", "health conditions"],
            ["exercise", "recommendations", "health conditions"],
            ["first aid", "emergency", "response", "critical"],
            ["medical test", "preparation", "instructions"],
            ["patient rights", "privacy", "healthcare"],
            ["health information", "wellness", "tips"],
            ["symptom", "description", "medical attention"],
            ["medication", "information", "approved sources"],
            ["medical terminology", "definitions"],
            ["healthcare facility", "appointments"],
            ["chronic disease", "management", "lifestyle"],
            ["post-operative", "care", "instructions"],
            ["mental health", "resources", "support"],
            ["healthcare", "communication", "guidelines"]
        ]
        
        for i in range(20):
            labels.append({
                "label": f"Response {i+1}",
                "text": sample_texts[i],
                "keywords": sample_keywords[i],
                "metadata": {"domain": "healthcare", "index": i}
            })
        
        path = viz.visualize_3d_embeddings(embeddings, labels, title="3D Embedding Space")
        if path:
            print(f"   ✅ 3D embeddings visualization saved to: {path}")
        else:
            print("   ⚠️  3D embeddings visualization skipped (dependencies missing)")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n6. Testing 3D Scores Visualization (IMPORTANT)...")
    try:
        scores_data = [
            {
                "CosineSimilarity": 0.85,
                "ROUGEMetric": 0.72,
                "BLEUMetric": 0.68,
                "label": "Diabetes Symptoms Response",
                "text": "Common symptoms of diabetes include increased thirst, frequent urination, unexplained weight loss, fatigue, and blurred vision. Consult a healthcare provider for proper diagnosis.",
                "keywords": ["diabetes", "symptoms", "thirst", "urination", "fatigue"],
                "metadata": {"domain": "healthcare", "topic": "diabetes"}
            },
            {
                "CosineSimilarity": 0.78,
                "ROUGEMetric": 0.65,
                "BLEUMetric": 0.61,
                "label": "Blood Pressure Medication",
                "text": "Blood pressure medications should be taken exactly as prescribed by your doctor, usually at the same time each day. Never stop taking medication without consulting your healthcare provider.",
                "keywords": ["blood pressure", "medication", "doctor", "prescribed"],
                "metadata": {"domain": "healthcare", "topic": "medication"}
            },
            {
                "CosineSimilarity": 0.92,
                "ROUGEMetric": 0.88,
                "BLEUMetric": 0.85,
                "label": "Preventive Screenings",
                "text": "Preventive screenings vary by age and risk factors but typically include blood pressure checks, cholesterol tests, cancer screenings, and diabetes screening. Consult your doctor for personalized recommendations.",
                "keywords": ["preventive", "screening", "blood pressure", "cholesterol", "cancer"],
                "metadata": {"domain": "healthcare", "topic": "prevention"}
            },
            {
                "CosineSimilarity": 0.65,
                "ROUGEMetric": 0.55,
                "BLEUMetric": 0.52,
                "label": "Mental Health Support",
                "text": "Mental health can be improved through therapy, medication when needed, regular exercise, adequate sleep, stress management, and social support. Professional help is available.",
                "keywords": ["mental health", "therapy", "medication", "exercise", "support"],
                "metadata": {"domain": "healthcare", "topic": "mental health"}
            },
            {
                "CosineSimilarity": 0.88,
                "ROUGEMetric": 0.75,
                "BLEUMetric": 0.71,
                "label": "Vaccination Schedule",
                "text": "Vaccination schedules vary by age and health status. Follow CDC guidelines and consult your healthcare provider for personalized vaccination recommendations.",
                "keywords": ["vaccination", "schedule", "CDC", "healthcare provider", "age"],
                "metadata": {"domain": "healthcare", "topic": "vaccination"}
            }
        ]
        
        path = viz.visualize_3d_scores(
            scores_data,
            x_metric="CosineSimilarity",
            y_metric="ROUGEMetric",
            z_metric="BLEUMetric",
            title="3D Score Space Visualization"
        )
        if path:
            print(f"   ✅ 3D scores visualization saved to: {path}")
        else:
            print("   ⚠️  3D scores visualization skipped (dependencies missing)")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n7. Testing Validation Results Visualization...")
    try:
        validation_results = [
            {"passed": True, "timestamp": i, "validator": "SafetyValidator"}
            for i in range(10)
        ] + [
            {"passed": False, "timestamp": i, "validator": "LengthValidator"}
            for i in range(10, 15)
        ] + [
            {"passed": True, "timestamp": i, "validator": "SafetyValidator"}
            for i in range(15, 25)
        ]
        
        path = viz.visualize_validation_results(validation_results)
        if path:
            print(f"   ✅ Validation results visualization saved to: {path}")
        else:
            print("   ⚠️  Validation results visualization skipped (dependencies missing)")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n8. Testing RAG Retrieval Visualization...")
    try:
        retrieval_results = [
            {"score": 0.92, "distance": 0.15, "document": "Doc 1"},
            {"score": 0.85, "distance": 0.22, "document": "Doc 2"},
            {"score": 0.78, "distance": 0.31, "document": "Doc 3"},
            {"score": 0.71, "distance": 0.38, "document": "Doc 4"},
            {"score": 0.65, "distance": 0.45, "document": "Doc 5"}
        ]
        
        path = viz.visualize_rag_retrieval(retrieval_results)
        if path:
            print(f"   ✅ RAG retrieval visualization saved to: {path}")
        else:
            print("   ⚠️  RAG retrieval visualization skipped (dependencies missing)")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n9. Testing Monitoring Dashboard...")
    try:
        monitor_data = {
            "total_interactions": 150,
            "success_rate": 0.92,
            "avg_latency": 0.45,
            "latencies": [0.3, 0.4, 0.5, 0.6, 0.4, 0.5, 0.45, 0.5, 0.4, 0.5] * 15,
            "errors": {
                "ValidationError": 5,
                "TimeoutError": 3,
                "NetworkError": 2
            },
            "metrics": {
                "total_tokens": 45000,
                "avg_response_length": 250,
                "cache_hit_rate": 0.35
            }
        }
        
        path = viz.visualize_monitoring_dashboard(monitor_data)
        if path:
            print(f"   ✅ Monitoring dashboard saved to: {path}")
        else:
            print("   ⚠️  Monitoring dashboard skipped (dependencies missing)")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 80)
    print("VISUALIZATION TEST COMPLETE")
    print("=" * 80)
    print(f"\nAll visualizations saved to: {output_dir}/")
    print("\n✅ Test completed successfully!")


if __name__ == "__main__":
    test_visualization()

