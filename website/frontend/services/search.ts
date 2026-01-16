
interface SearchResult {
    readme: string;
    code: string;
}

// Map keywords to documentation JSON files
const KEYWORD_MAP: Record<string, string> = {
    'hallucination': 'wall-guard',
    'validator': 'validators',
    'rag': 'rag-retriever',
    'monitor': 'llm-monitor',
    'start': 'quick-start',
    'install': 'installation',
    'image': 'image-context-manager',
    'context': 'context-manager',
    'scorer': 'response-scorer',
    'logger': 'wall-logger',
};

export const searchService = {
    async searchDocumentation(query: string): Promise<SearchResult> {
        const lowerQuery = query.toLowerCase();
        let docId = 'overview'; // Default

        // Simple keyword matching
        for (const [key, id] of Object.entries(KEYWORD_MAP)) {
            if (lowerQuery.includes(key)) {
                docId = id;
                break;
            }
        }

        try {
            const response = await fetch(`/documentation/${docId}.json`);
            if (!response.ok) return { readme: "Documentation not found.", code: "" };

            const data = await response.json();

            let readme = `## ${data.title}\n\n${data.description}\n\n`;
            let code = "";

            // Aggregate content
            data.content.forEach((section: any) => {
                if (section.type === 'text') {
                    readme += `${section.content}\n\n`;
                } else if (section.type === 'section') {
                    readme += `### ${section.title}\n\n`;
                    section.subsections?.forEach((sub: any) => {
                        if (sub.type === 'text') readme += `${sub.content}\n\n`;
                        if (sub.type === 'code') code += `# ${sub.title}\n${sub.code}\n\n`;
                    });
                } else if (section.type === 'code') {
                    code += `# ${section.title}\n${section.code}\n\n`;
                }
            });

            return { readme, code };

        } catch (error) {
            console.error("Search failed", error);
            return { readme: "Error searching documentation.", code: "" };
        }
    }
};
