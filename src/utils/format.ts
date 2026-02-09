export const formatDate = (date: string): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

export const formatShortDate = (date: string): string => {
  return formatDate(date);
};

export const extractPreview = (content: string, maxLength: number = 150): string => {
  return content
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/[#*`>\-\[\]]/g, "")
    .trim()
    .substring(0, maxLength);
};
