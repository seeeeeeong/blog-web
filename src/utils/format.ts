export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatShortDate = (date: string): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const extractPreview = (content: string, maxLength: number = 150): string => {
  return content
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/[#*`>\-\[\]]/g, "")
    .trim()
    .substring(0, maxLength);
};
