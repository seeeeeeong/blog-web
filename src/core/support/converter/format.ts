const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_DAY = 86400;
const SECONDS_IN_WEEK = 604800;

export const formatDate = (date: string): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < SECONDS_IN_MINUTE) return "just now";
  if (diff < SECONDS_IN_HOUR) return `${Math.floor(diff / SECONDS_IN_MINUTE)}m ago`;
  if (diff < SECONDS_IN_DAY) return `${Math.floor(diff / SECONDS_IN_HOUR)}h ago`;
  if (diff < SECONDS_IN_WEEK) return `${Math.floor(diff / SECONDS_IN_DAY)}d ago`;

  return formatDate(dateString);
};

export const extractPreview = (content: string, maxLength: number = 150): string => {
  return content
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/[#*`>-]/g, "")
    .replaceAll("[", "")
    .replaceAll("]", "")
    .trim()
    .substring(0, maxLength);
};

export const stripMarkdownSyntax = (markdown: string): string => {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[#>*_~-]/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const calculateWordCount = (markdown: string): number => {
  const plainText = stripMarkdownSyntax(markdown);
  return plainText ? plainText.split(" ").length : 0;
};
