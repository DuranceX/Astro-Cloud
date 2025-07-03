import { getPosts } from './collections';

export interface SearchResult {
  post: any;
  score: number;
  matchedFields: string[];
}

export async function searchPosts(query: string): Promise<SearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  console.log('begin search:', query);

  const posts = await getPosts();
  const results: SearchResult[] = [];
  const searchTerm = query.toLowerCase().trim();

  posts.forEach((post) => {
    let score = 0;
    const matchedFields: string[] = [];

    // 搜索标题 (权重最高)
    if (post.data.title.toLowerCase().includes(searchTerm)) {
      score += 10;
      matchedFields.push('title');
    }

    // 搜索标签 (权重较高)
    if (post.data.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))) {
      score += 5;
      matchedFields.push('tags');
    }

    // 搜索描述 (中等权重)
    if (post.data.description && post.data.description.toLowerCase().includes(searchTerm)) {
      score += 3;
      matchedFields.push('description');
    }

    // 搜索内容 (权重较低)
    if (post.body.toLowerCase().includes(searchTerm)) {
      score += 1;
      matchedFields.push('content');
    }

    // 如果有匹配，添加到结果中
    if (score > 0) {
      results.push({
        post,
        score,
        matchedFields
      });
    }
  });

  // 按分数排序，分数越高越靠前
  return results.sort((a, b) => b.score - a.score);
}

// 高亮搜索词
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-600">$1</mark>');
}

// 截取内容片段，显示搜索词上下文
export function getContentSnippet(content: string, searchTerm: string, maxLength: number = 150): string {
  if (!searchTerm.trim()) return content.slice(0, maxLength);
  
  const lowerContent = content.toLowerCase();
  const lowerTerm = searchTerm.toLowerCase();
  const index = lowerContent.indexOf(lowerTerm);
  
  if (index === -1) return content.slice(0, maxLength);
  
  const start = Math.max(0, index - 50);
  const end = Math.min(content.length, index + searchTerm.length + 80);
  
  let snippet = content.slice(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';
  
  return snippet;
}
