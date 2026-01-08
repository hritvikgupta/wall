"""Comprehensive visualization module for Wall Library."""

from typing import Dict, List, Optional, Any, Tuple
import os
import warnings

# Try to import visualization libraries
try:
    import matplotlib
    matplotlib.use('Agg')  # Use non-interactive backend
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
    from matplotlib.colors import LinearSegmentedColormap
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False
    plt = None
    mpatches = None
    LinearSegmentedColormap = None

try:
    import plotly.graph_objects as go
    import plotly.express as px
    from plotly.subplots import make_subplots
    PLOTLY_AVAILABLE = True
except ImportError:
    PLOTLY_AVAILABLE = False
    go = None
    px = None
    make_subplots = None

try:
    from wordcloud import WordCloud
    WORDCLOUD_AVAILABLE = True
except ImportError:
    WORDCLOUD_AVAILABLE = False
    WordCloud = None

try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False
    np = None

try:
    import seaborn as sns
    SEABORN_AVAILABLE = True
except ImportError:
    SEABORN_AVAILABLE = False
    sns = None


class WallVisualizer:
    """Main visualization class for Wall Library."""
    
    def __init__(self, output_dir: str = "visualizations", style: str = "default"):
        """Initialize visualizer.
        
        Args:
            output_dir: Directory to save visualizations
            style: Plot style (default, seaborn, dark)
        """
        self.output_dir = output_dir
        self.style = style
        os.makedirs(output_dir, exist_ok=True)
        
        # Set style
        if MATPLOTLIB_AVAILABLE:
            if style == "seaborn" and SEABORN_AVAILABLE:
                sns.set_style("whitegrid")
            elif style == "dark":
                plt.style.use("dark_background")
    
    def visualize_scores(
        self,
        scores: Dict[str, float],
        title: str = "Response Quality Scores",
        save_path: Optional[str] = None,
        show: bool = False
    ) -> Optional[str]:
        """Visualize scoring metrics as bar chart.
        
        Args:
            scores: Dictionary of metric names to scores
            title: Plot title
            save_path: Path to save figure (optional)
            show: Whether to display plot
            
        Returns:
            Path to saved file or None
        """
        if not MATPLOTLIB_AVAILABLE:
            warnings.warn("matplotlib not available. Install with: pip install matplotlib")
            return None
        
        fig, ax = plt.subplots(figsize=(10, 6))
        
        metrics = list(scores.keys())
        values = list(scores.values())
        
        # Create color gradient based on scores
        colors = ['#2ecc71' if v >= 0.7 else '#f39c12' if v >= 0.5 else '#e74c3c' for v in values]
        
        bars = ax.bar(metrics, values, color=colors, alpha=0.8, edgecolor='black', linewidth=1.5)
        
        # Add value labels on bars
        for bar, value in zip(bars, values):
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{value:.3f}',
                   ha='center', va='bottom', fontsize=10, fontweight='bold')
        
        ax.set_ylabel('Score', fontsize=12, fontweight='bold')
        ax.set_xlabel('Metrics', fontsize=12, fontweight='bold')
        ax.set_title(title, fontsize=14, fontweight='bold', pad=20)
        ax.set_ylim(0, 1.1)
        ax.grid(axis='y', alpha=0.3, linestyle='--')
        ax.axhline(y=0.7, color='green', linestyle='--', alpha=0.5, label='Good Threshold')
        ax.axhline(y=0.5, color='orange', linestyle='--', alpha=0.5, label='Acceptable Threshold')
        ax.legend()
        
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        
        if save_path is None:
            save_path = os.path.join(self.output_dir, "scores.png")
        
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        if show:
            plt.show()
        else:
            plt.close()
        
        return save_path
    
    def visualize_context_boundaries(
        self,
        responses: List[str],
        context_manager: Any,
        title: str = "Context Boundary Analysis",
        save_path: Optional[str] = None,
        show: bool = False
    ) -> Optional[str]:
        """Visualize which responses are inside/outside context boundaries.
        
        Args:
            responses: List of response strings
            context_manager: ContextManager instance
            title: Plot title
            save_path: Path to save figure
            show: Whether to display plot
            
        Returns:
            Path to saved file or None
        """
        if not MATPLOTLIB_AVAILABLE:
            warnings.warn("matplotlib not available")
            return None
        
        # Check each response
        inside = []
        outside = []
        similarities = []
        
        for response in responses:
            is_valid = context_manager.check_context(response, threshold=0.7)
            if is_valid:
                inside.append(response)
            else:
                outside.append(response)
            
            # Calculate similarity scores
            if context_manager.contexts:
                max_sim = max(
                    context_manager.similarity_engine.cosine_similarity(response, ctx)
                    for ctx in context_manager.contexts
                )
                similarities.append(max_sim)
            else:
                similarities.append(0.0)
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
        
        # Pie chart: Inside vs Outside
        labels = ['Inside Wall', 'Outside Wall']
        sizes = [len(inside), len(outside)]
        colors = ['#2ecc71', '#e74c3c']
        explode = (0.05, 0.1) if len(outside) > 0 else (0, 0)
        
        ax1.pie(sizes, explode=explode, labels=labels, colors=colors,
                autopct='%1.1f%%', shadow=True, startangle=90,
                textprops={'fontsize': 12, 'fontweight': 'bold'})
        ax1.set_title('Responses: Inside vs Outside Context', fontsize=12, fontweight='bold')
        
        # Bar chart: Similarity scores
        indices = range(len(responses))
        bar_colors = ['#2ecc71' if s >= 0.7 else '#f39c12' if s >= 0.5 else '#e74c3c' for s in similarities]
        
        bars = ax2.bar(indices, similarities, color=bar_colors, alpha=0.8, edgecolor='black')
        ax2.axhline(y=0.7, color='green', linestyle='--', alpha=0.7, label='Threshold (0.7)')
        ax2.set_ylabel('Similarity Score', fontsize=11, fontweight='bold')
        ax2.set_xlabel('Response Index', fontsize=11, fontweight='bold')
        ax2.set_title('Context Similarity Scores', fontsize=12, fontweight='bold')
        ax2.set_ylim(0, 1.1)
        ax2.grid(axis='y', alpha=0.3)
        ax2.legend()
        
        plt.suptitle(title, fontsize=14, fontweight='bold', y=1.02)
        plt.tight_layout()
        
        if save_path is None:
            save_path = os.path.join(self.output_dir, "context_boundaries.png")
        
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        if show:
            plt.show()
        else:
            plt.close()
        
        return save_path
    
    def visualize_keywords(
        self,
        keywords: List[str],
        frequencies: Optional[Dict[str, int]] = None,
        title: str = "Keyword Analysis",
        save_path: Optional[str] = None,
        show: bool = False
    ) -> Optional[str]:
        """Visualize keywords with frequency.
        
        Args:
            keywords: List of keywords
            frequencies: Optional frequency dictionary
            title: Plot title
            save_path: Path to save figure
            show: Whether to display plot
            
        Returns:
            Path to saved file or None
        """
        if not MATPLOTLIB_AVAILABLE:
            warnings.warn("matplotlib not available")
            return None
        
        if frequencies is None:
            from collections import Counter
            frequencies = Counter(keywords)
        
        # Sort by frequency
        sorted_items = sorted(frequencies.items(), key=lambda x: x[1], reverse=True)
        top_n = min(20, len(sorted_items))  # Top 20
        words, counts = zip(*sorted_items[:top_n])
        
        fig, ax = plt.subplots(figsize=(12, 8))
        
        bars = ax.barh(range(len(words)), counts, color='#3498db', alpha=0.8, edgecolor='black')
        
        ax.set_yticks(range(len(words)))
        ax.set_yticklabels(words, fontsize=10)
        ax.set_xlabel('Frequency', fontsize=12, fontweight='bold')
        ax.set_title(title, fontsize=14, fontweight='bold', pad=20)
        ax.grid(axis='x', alpha=0.3, linestyle='--')
        
        # Add value labels
        for i, (bar, count) in enumerate(zip(bars, counts)):
            width = bar.get_width()
            ax.text(width, bar.get_y() + bar.get_height()/2.,
                   f' {count}',
                   ha='left', va='center', fontsize=9, fontweight='bold')
        
        plt.tight_layout()
        
        if save_path is None:
            save_path = os.path.join(self.output_dir, "keywords.png")
        
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        if show:
            plt.show()
        else:
            plt.close()
        
        return save_path
    
    def visualize_wordcloud(
        self,
        text: str,
        title: str = "Word Cloud",
        save_path: Optional[str] = None,
        show: bool = False,
        width: int = 800,
        height: int = 400
    ) -> Optional[str]:
        """Generate word cloud visualization.
        
        Args:
            text: Text to visualize
            title: Plot title
            save_path: Path to save figure
            show: Whether to display plot
            width: Image width
            height: Image height
            
        Returns:
            Path to saved file or None
        """
        if not WORDCLOUD_AVAILABLE:
            warnings.warn("wordcloud not available. Install with: pip install wordcloud")
            return None
        
        if not MATPLOTLIB_AVAILABLE:
            warnings.warn("matplotlib not available")
            return None
        
        # Generate word cloud
        wordcloud = WordCloud(
            width=width,
            height=height,
            background_color='white',
            colormap='viridis',
            max_words=100,
            relative_scaling=0.5,
            random_state=42
        ).generate(text)
        
        fig, ax = plt.subplots(figsize=(12, 6))
        ax.imshow(wordcloud, interpolation='bilinear')
        ax.axis('off')
        ax.set_title(title, fontsize=16, fontweight='bold', pad=20)
        
        plt.tight_layout()
        
        if save_path is None:
            save_path = os.path.join(self.output_dir, "wordcloud.png")
        
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        if show:
            plt.show()
        else:
            plt.close()
        
        return save_path
    
    def visualize_3d_embeddings(
        self,
        embeddings: List[List[float]],
        labels: Optional[List[str]] = None,
        title: str = "3D Embedding Visualization",
        save_path: Optional[str] = None,
        show: bool = False
    ) -> Optional[str]:
        """Visualize embeddings in 3D space.
        
        Args:
            embeddings: List of embedding vectors
            labels: Optional labels for points
            title: Plot title
            save_path: Path to save HTML file
            show: Whether to display plot
            
        Returns:
            Path to saved file or None
        """
        if not PLOTLY_AVAILABLE:
            warnings.warn("plotly not available. Install with: pip install plotly")
            return None
        
        if not NUMPY_AVAILABLE:
            warnings.warn("numpy not available")
            return None
        
        # Convert to numpy array
        embeddings_array = np.array(embeddings)
        
        # Reduce to 3D using PCA if needed
        if embeddings_array.shape[1] > 3:
            from sklearn.decomposition import PCA
            pca = PCA(n_components=3)
            embeddings_3d = pca.fit_transform(embeddings_array)
            explained_var = sum(pca.explained_variance_ratio_)
            title += f" (PCA: {explained_var:.1%} variance explained)"
        else:
            embeddings_3d = embeddings_array
        
        # Build detailed hover text if labels contain dictionaries
        hover_texts = []
        display_labels = []
        
        for i, label in enumerate(labels):
            if isinstance(label, dict):
                # Label is a dictionary with detailed info
                display_label = label.get('label') or label.get('text', f'Point {i+1}')
                if isinstance(display_label, str) and len(display_label) > 30:
                    display_label = display_label[:27] + "..."
                display_labels.append(display_label)
                
                hover_parts = [f"<b>{display_label}</b>"]
                
                # Add text/snippet
                text = label.get('text') or label.get('snippet', '')
                if text:
                    snippet = text[:100] + "..." if len(text) > 100 else text
                    hover_parts.append(f"<br><b>Text:</b> {snippet}")
                
                # Add keywords
                keywords = label.get('keywords', [])
                if keywords:
                    if isinstance(keywords, str):
                        keywords = [keywords]
                    keywords_str = ", ".join(keywords[:5])
                    hover_parts.append(f"<br><b>Keywords:</b> {keywords_str}")
                
                hover_parts.append(f"<br><b>X:</b> {embeddings_3d[i, 0]:.3f}")
                hover_parts.append(f"<br><b>Y:</b> {embeddings_3d[i, 1]:.3f}")
                hover_parts.append(f"<br><b>Z:</b> {embeddings_3d[i, 2]:.3f}")
                
                hover_texts.append("".join(hover_parts))
            else:
                # Label is a simple string
                display_labels.append(str(label))
                hover_texts.append(
                    f"<b>{label}</b><br>"
                    f"X: {embeddings_3d[i, 0]:.3f}<br>"
                    f"Y: {embeddings_3d[i, 1]:.3f}<br>"
                    f"Z: {embeddings_3d[i, 2]:.3f}"
                )
        
        # Create 3D scatter plot
        fig = go.Figure(data=go.Scatter3d(
            x=embeddings_3d[:, 0],
            y=embeddings_3d[:, 1],
            z=embeddings_3d[:, 2],
            mode='markers',
            marker=dict(
                size=8,
                color=embeddings_3d[:, 2],  # Color by z-axis
                colorscale='Viridis',
                showscale=True,
                line=dict(width=1, color='black')
            ),
            text=display_labels,
            hovertemplate='%{hovertext}<extra></extra>',
            hovertext=hover_texts
        ))
        
        fig.update_layout(
            title=dict(text=title, font=dict(size=16, color='black')),
            scene=dict(
                xaxis_title='Dimension 1',
                yaxis_title='Dimension 2',
                zaxis_title='Dimension 3',
                bgcolor='white',
                xaxis=dict(backgroundcolor='white', gridcolor='lightgray'),
                yaxis=dict(backgroundcolor='white', gridcolor='lightgray'),
                zaxis=dict(backgroundcolor='white', gridcolor='lightgray')
            ),
            width=900,
            height=700
        )
        
        if save_path is None:
            save_path = os.path.join(self.output_dir, "3d_embeddings.html")
        
        fig.write_html(save_path)
        if show:
            fig.show()
        
        return save_path
    
    def visualize_3d_scores(
        self,
        scores_data: List[Dict[str, Any]],
        x_metric: str = "CosineSimilarity",
        y_metric: str = "ROUGEMetric",
        z_metric: str = "BLEUMetric",
        title: str = "3D Score Visualization",
        save_path: Optional[str] = None,
        show: bool = False
    ) -> Optional[str]:
        """Visualize scores in 3D space.
        
        Args:
            scores_data: List of score dictionaries with optional 'text', 'keywords', 'snippet' fields
            x_metric: Metric for x-axis
            y_metric: Metric for y-axis
            z_metric: Metric for z-axis
            title: Plot title
            save_path: Path to save HTML file
            show: Whether to display plot
            
        Returns:
            Path to saved file or None
        """
        if not PLOTLY_AVAILABLE:
            warnings.warn("plotly not available")
            return None
        
        # Extract scores
        x_scores = [d.get(x_metric, 0) for d in scores_data]
        y_scores = [d.get(y_metric, 0) for d in scores_data]
        z_scores = [d.get(z_metric, 0) for d in scores_data]
        
        # Build detailed labels and hover text
        labels = []
        hover_texts = []
        
        for i, d in enumerate(scores_data):
            # Get label (prefer custom label, then text snippet, then default)
            label = d.get('label') or d.get('snippet') or d.get('text', f'Response {i+1}')
            if isinstance(label, str) and len(label) > 30:
                label = label[:27] + "..."
            labels.append(label)
            
            # Build detailed hover text
            hover_parts = [f"<b>{label}</b>"]
            
            # Add text/snippet if available
            text = d.get('text') or d.get('snippet', '')
            if text:
                snippet = text[:100] + "..." if len(text) > 100 else text
                hover_parts.append(f"<br><b>Text:</b> {snippet}")
            
            # Add keywords if available
            keywords = d.get('keywords', [])
            if keywords:
                if isinstance(keywords, str):
                    keywords = [keywords]
                keywords_str = ", ".join(keywords[:5])  # Top 5 keywords
                hover_parts.append(f"<br><b>Keywords:</b> {keywords_str}")
            
            # Add scores
            hover_parts.append(f"<br><b>{x_metric}:</b> {d.get(x_metric, 0):.3f}")
            hover_parts.append(f"<br><b>{y_metric}:</b> {d.get(y_metric, 0):.3f}")
            hover_parts.append(f"<br><b>{z_metric}:</b> {d.get(z_metric, 0):.3f}")
            
            # Add metadata if available
            metadata = d.get('metadata', {})
            if metadata:
                meta_str = ", ".join([f"{k}: {v}" for k, v in list(metadata.items())[:3]])
                hover_parts.append(f"<br><b>Metadata:</b> {meta_str}")
            
            hover_texts.append("".join(hover_parts))
        
        # Create 3D scatter plot
        fig = go.Figure(data=go.Scatter3d(
            x=x_scores,
            y=y_scores,
            z=z_scores,
            mode='markers+text',
            marker=dict(
                size=12,
                color=z_scores,  # Color by z-axis
                colorscale='RdYlGn',
                showscale=True,
                cmin=0,
                cmax=1,
                line=dict(width=2, color='black')
            ),
            text=labels,
            textposition='middle center',
            hovertemplate='%{hovertext}<extra></extra>',
            hovertext=hover_texts
        ))
        
        # Add threshold planes
        fig.add_trace(go.Mesh3d(
            x=[0, 1, 1, 0],
            y=[0, 0, 1, 1],
            z=[0.7, 0.7, 0.7, 0.7],
            opacity=0.2,
            color='green',
            name='Good Threshold (0.7)'
        ))
        
        fig.update_layout(
            title=dict(text=title, font=dict(size=16)),
            scene=dict(
                xaxis_title=x_metric,
                yaxis_title=y_metric,
                zaxis_title=z_metric,
                bgcolor='white',
                xaxis=dict(backgroundcolor='white', gridcolor='lightgray'),
                yaxis=dict(backgroundcolor='white', gridcolor='lightgray'),
                zaxis=dict(backgroundcolor='white', gridcolor='lightgray')
            ),
            width=1000,
            height=800
        )
        
        if save_path is None:
            save_path = os.path.join(self.output_dir, "3d_scores.html")
        
        fig.write_html(save_path)
        if show:
            fig.show()
        
        return save_path
    
    def visualize_validation_results(
        self,
        validation_results: List[Dict[str, Any]],
        title: str = "Validation Results Analysis",
        save_path: Optional[str] = None,
        show: bool = False
    ) -> Optional[str]:
        """Visualize validation results over time.
        
        Args:
            validation_results: List of validation result dictionaries
            title: Plot title
            save_path: Path to save figure
            show: Whether to display plot
            
        Returns:
            Path to saved file or None
        """
        if not MATPLOTLIB_AVAILABLE:
            warnings.warn("matplotlib not available")
            return None
        
        passed = [r.get('passed', False) for r in validation_results]
        timestamps = [r.get('timestamp', i) for i, r in enumerate(validation_results)]
        validator_names = [r.get('validator', 'Unknown') for r in validation_results]
        
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 10))
        
        # Timeline of pass/fail
        colors = ['#2ecc71' if p else '#e74c3c' for p in passed]
        ax1.scatter(timestamps, passed, c=colors, s=100, alpha=0.7, edgecolors='black', linewidth=1.5)
        ax1.set_ylabel('Validation Status', fontsize=11, fontweight='bold')
        ax1.set_xlabel('Time/Index', fontsize=11, fontweight='bold')
        ax1.set_title('Validation Results Over Time', fontsize=12, fontweight='bold')
        ax1.set_yticks([0, 1])
        ax1.set_yticklabels(['Failed', 'Passed'])
        ax1.grid(axis='y', alpha=0.3)
        
        # Validator performance
        from collections import Counter
        validator_counts = Counter(validator_names)
        validators = list(validator_counts.keys())
        counts = list(validator_counts.values())
        
        bars = ax2.bar(validators, counts, color='#3498db', alpha=0.8, edgecolor='black')
        ax2.set_ylabel('Number of Validations', fontsize=11, fontweight='bold')
        ax2.set_xlabel('Validator', fontsize=11, fontweight='bold')
        ax2.set_title('Validator Usage', fontsize=12, fontweight='bold')
        ax2.grid(axis='y', alpha=0.3)
        
        plt.xticks(rotation=45, ha='right')
        plt.suptitle(title, fontsize=14, fontweight='bold', y=0.995)
        plt.tight_layout()
        
        if save_path is None:
            save_path = os.path.join(self.output_dir, "validation_results.png")
        
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        if show:
            plt.show()
        else:
            plt.close()
        
        return save_path
    
    def visualize_rag_retrieval(
        self,
        retrieval_results: List[Dict[str, Any]],
        title: str = "RAG Retrieval Analysis",
        save_path: Optional[str] = None,
        show: bool = False
    ) -> Optional[str]:
        """Visualize RAG retrieval results.
        
        Args:
            retrieval_results: List of retrieval result dictionaries
            title: Plot title
            save_path: Path to save figure
            show: Whether to display plot
            
        Returns:
            Path to saved file or None
        """
        if not MATPLOTLIB_AVAILABLE:
            warnings.warn("matplotlib not available")
            return None
        
        scores = [r.get('score', 0) for r in retrieval_results]
        distances = [r.get('distance', 0) for r in retrieval_results]
        indices = range(len(retrieval_results))
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
        
        # Score distribution
        ax1.bar(indices, scores, color='#3498db', alpha=0.8, edgecolor='black')
        ax1.axhline(y=0.7, color='green', linestyle='--', alpha=0.7, label='Good Threshold')
        ax1.set_ylabel('Relevance Score', fontsize=11, fontweight='bold')
        ax1.set_xlabel('Retrieved Document Index', fontsize=11, fontweight='bold')
        ax1.set_title('Retrieval Scores', fontsize=12, fontweight='bold')
        ax1.grid(axis='y', alpha=0.3)
        ax1.legend()
        
        # Distance distribution
        ax2.bar(indices, distances, color='#e74c3c', alpha=0.8, edgecolor='black')
        ax2.set_ylabel('Distance', fontsize=11, fontweight='bold')
        ax2.set_xlabel('Retrieved Document Index', fontsize=11, fontweight='bold')
        ax2.set_title('Retrieval Distances', fontsize=12, fontweight='bold')
        ax2.grid(axis='y', alpha=0.3)
        
        plt.suptitle(title, fontsize=14, fontweight='bold', y=1.02)
        plt.tight_layout()
        
        if save_path is None:
            save_path = os.path.join(self.output_dir, "rag_retrieval.png")
        
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        if show:
            plt.show()
        else:
            plt.close()
        
        return save_path
    
    def visualize_monitoring_dashboard(
        self,
        monitor_data: Dict[str, Any],
        title: str = "Monitoring Dashboard",
        save_path: Optional[str] = None,
        show: bool = False
    ) -> Optional[str]:
        """Create comprehensive monitoring dashboard.
        
        Args:
            monitor_data: Dictionary with monitoring statistics
            title: Plot title
            save_path: Path to save figure
            show: Whether to display plot
            
        Returns:
            Path to saved file or None
        """
        if not MATPLOTLIB_AVAILABLE:
            warnings.warn("matplotlib not available")
            return None
        
        fig = plt.figure(figsize=(16, 10))
        gs = fig.add_gridspec(3, 3, hspace=0.3, wspace=0.3)
        
        # Total interactions
        ax1 = fig.add_subplot(gs[0, 0])
        total = monitor_data.get('total_interactions', 0)
        ax1.text(0.5, 0.5, str(total), ha='center', va='center', fontsize=48, fontweight='bold')
        ax1.set_title('Total Interactions', fontsize=12, fontweight='bold')
        ax1.axis('off')
        
        # Success rate
        ax2 = fig.add_subplot(gs[0, 1])
        success_rate = monitor_data.get('success_rate', 0)
        ax2.text(0.5, 0.5, f'{success_rate:.1%}', ha='center', va='center', fontsize=48, fontweight='bold', color='green')
        ax2.set_title('Success Rate', fontsize=12, fontweight='bold')
        ax2.axis('off')
        
        # Average latency
        ax3 = fig.add_subplot(gs[0, 2])
        avg_latency = monitor_data.get('avg_latency', 0)
        ax3.text(0.5, 0.5, f'{avg_latency:.2f}s', ha='center', va='center', fontsize=48, fontweight='bold')
        ax3.set_title('Avg Latency', fontsize=12, fontweight='bold')
        ax3.axis('off')
        
        # Latency over time (if available)
        ax4 = fig.add_subplot(gs[1, :])
        latencies = monitor_data.get('latencies', [])
        if latencies:
            ax4.plot(latencies, color='#3498db', linewidth=2, marker='o', markersize=4)
            ax4.set_ylabel('Latency (s)', fontsize=11, fontweight='bold')
            ax4.set_xlabel('Interaction Index', fontsize=11, fontweight='bold')
            ax4.set_title('Latency Over Time', fontsize=12, fontweight='bold')
            ax4.grid(alpha=0.3)
        
        # Error distribution (if available)
        ax5 = fig.add_subplot(gs[2, :2])
        errors = monitor_data.get('errors', {})
        if errors:
            error_types = list(errors.keys())
            error_counts = list(errors.values())
            ax5.bar(error_types, error_counts, color='#e74c3c', alpha=0.8, edgecolor='black')
            ax5.set_ylabel('Count', fontsize=11, fontweight='bold')
            ax5.set_xlabel('Error Type', fontsize=11, fontweight='bold')
            ax5.set_title('Error Distribution', fontsize=12, fontweight='bold')
            ax5.grid(axis='y', alpha=0.3)
            plt.setp(ax5.xaxis.get_majorticklabels(), rotation=45, ha='right')
        
        # Metrics summary (if available)
        ax6 = fig.add_subplot(gs[2, 2])
        metrics = monitor_data.get('metrics', {})
        if metrics:
            metric_names = list(metrics.keys())[:5]  # Top 5
            metric_values = [str(metrics.get(m, ''))[:20] for m in metric_names]
            ax6.axis('off')
            ax6.text(0.1, 0.5, '\n'.join([f'{n}: {v}' for n, v in zip(metric_names, metric_values)]),
                    fontsize=10, verticalalignment='center', family='monospace')
            ax6.set_title('Metrics Summary', fontsize=12, fontweight='bold')
        
        plt.suptitle(title, fontsize=16, fontweight='bold', y=0.995)
        
        if save_path is None:
            save_path = os.path.join(self.output_dir, "monitoring_dashboard.png")
        
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        if show:
            plt.show()
        else:
            plt.close()
        
        return save_path


# Convenience functions
def visualize_scores(scores: Dict[str, float], **kwargs) -> Optional[str]:
    """Visualize scores."""
    viz = WallVisualizer()
    return viz.visualize_scores(scores, **kwargs)

def visualize_context_boundaries(responses: List[str], context_manager: Any, **kwargs) -> Optional[str]:
    """Visualize context boundaries."""
    viz = WallVisualizer()
    return viz.visualize_context_boundaries(responses, context_manager, **kwargs)

def visualize_keywords(keywords: List[str], frequencies: Optional[Dict[str, int]] = None, **kwargs) -> Optional[str]:
    """Visualize keywords."""
    viz = WallVisualizer()
    return viz.visualize_keywords(keywords, frequencies, **kwargs)

def visualize_wordcloud(text: str, **kwargs) -> Optional[str]:
    """Generate word cloud."""
    viz = WallVisualizer()
    return viz.visualize_wordcloud(text, **kwargs)

def visualize_3d_embeddings(embeddings: List[List[float]], labels: Optional[List[str]] = None, **kwargs) -> Optional[str]:
    """Visualize embeddings in 3D."""
    viz = WallVisualizer()
    return viz.visualize_3d_embeddings(embeddings, labels, **kwargs)

def visualize_3d_scores(scores_data: List[Dict[str, Any]], **kwargs) -> Optional[str]:
    """Visualize scores in 3D."""
    viz = WallVisualizer()
    return viz.visualize_3d_scores(scores_data, **kwargs)

def visualize_validation_results(validation_results: List[Dict[str, Any]], **kwargs) -> Optional[str]:
    """Visualize validation results."""
    viz = WallVisualizer()
    return viz.visualize_validation_results(validation_results, **kwargs)

def visualize_rag_retrieval(retrieval_results: List[Dict[str, Any]], **kwargs) -> Optional[str]:
    """Visualize RAG retrieval."""
    viz = WallVisualizer()
    return viz.visualize_rag_retrieval(retrieval_results, **kwargs)

def visualize_monitoring_dashboard(monitor_data: Dict[str, Any], **kwargs) -> Optional[str]:
    """Create monitoring dashboard."""
    viz = WallVisualizer()
    return viz.visualize_monitoring_dashboard(monitor_data, **kwargs)

