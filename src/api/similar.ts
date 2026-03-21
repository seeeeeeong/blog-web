import axios from "axios";

const DEVLOG_ARCHIVE_URL =
  import.meta.env.VITE_DEVLOG_ARCHIVE_URL ?? "http://localhost:8082";

const TOPIC_HINT_LIMIT = 8;
const HEADING_LIMIT = 6;
const PARAGRAPH_LIMIT = 6;
const REQUEST_CONTENT_LIMIT = 4000;

export interface SimilarArticle {
  articleId: number;
  title: string;
  company: string;
  url: string;
  summary: string | null;
  publishedAt: string | null;
  similarity: number;
}

interface SimilarRequestPayload {
  title: string;
  content: string;
  topicHints: string[];
  topK: number;
}

export async function fetchSimilarArticles(
  title: string,
  content: string,
  topicHints: string[] = [],
  topK = 5,
  signal?: AbortSignal
): Promise<SimilarArticle[]> {
  const payload = buildSimilarRequestPayload(title, content, topicHints, topK);
  const res = await axios.post<{ items: SimilarArticle[] }>(
    `${DEVLOG_ARCHIVE_URL}/api/v1/similar`,
    payload,
    {
      timeout: 5000,
      signal,
    }
  );
  return res.data.items;
}

function buildSimilarRequestPayload(
  title: string,
  content: string,
  topicHints: string[],
  topK: number
): SimilarRequestPayload {
  const normalizedTopicHints = normalizeTopicHints(topicHints);
  const headings = extractMarkdownHeadings(content);
  const cleanedContent = stripMarkdownNoise(content);
  const keyParagraphs = selectKeyParagraphs(cleanedContent, normalizedTopicHints);
  const contentForEmbedding = [
    `title: ${title}`,
    normalizedTopicHints.length > 0
      ? `topics: ${normalizedTopicHints.join(", ")}`
      : null,
    headings.length > 0 ? `headings: ${headings.join(" | ")}` : null,
    keyParagraphs.join("\n\n"),
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, REQUEST_CONTENT_LIMIT);

  return {
    title,
    content: contentForEmbedding,
    topicHints: normalizedTopicHints,
    topK,
  };
}

function normalizeTopicHints(topicHints: string[]): string[] {
  return topicHints
    .map((topic) => topic.trim())
    .filter((topic) => topic.length > 0)
    .filter((topic, index, array) => array.indexOf(topic) === index)
    .slice(0, TOPIC_HINT_LIMIT);
}

function extractMarkdownHeadings(markdown: string): string[] {
  const matches = markdown.matchAll(/^#{1,3}\s+(.+)$/gm);
  const headings: string[] = [];

  for (const match of matches) {
    const heading = stripMarkdownNoise(match[1] ?? "").trim();
    if (heading.length >= 4) {
      headings.push(heading);
    }
  }

  return headings.slice(0, HEADING_LIMIT);
}

function stripMarkdownNoise(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[*_>#-]/g, " ")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function selectKeyParagraphs(
  cleanedContent: string,
  topicHints: string[]
): string[] {
  const paragraphs = cleanedContent
    .split(/\n{2,}|\.\s+/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length >= 40);

  const topicParagraphs = paragraphs
    .filter((paragraph) =>
      topicHints.some((topic) =>
        paragraph.toLowerCase().includes(topic.toLowerCase())
      )
    )
    .slice(0, PARAGRAPH_LIMIT);

  if (topicParagraphs.length >= 3) {
    return topicParagraphs;
  }

  return [...new Set([...topicParagraphs, ...paragraphs])]
    .slice(0, PARAGRAPH_LIMIT);
}
