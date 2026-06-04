const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const normalizeMediaEntries = ({
  entries,
  type,
  fallbackAlt,
  fallbackThumbnail,
}) => {
  if (!Array.isArray(entries)) return [];

  return entries.reduce((items, entry, index) => {
    const src =
      typeof entry === "string"
        ? entry
        : entry?.url || entry?.src || entry?.image || null;

    if (!isNonEmptyString(src)) {
      return items;
    }

    const alt =
      (typeof entry === "object" && isNonEmptyString(entry?.alt) && entry.alt) ||
      `${fallbackAlt} ${index + 1}`;

    const thumbnail =
      type === "video"
        ? typeof entry === "object" && isNonEmptyString(entry?.thumbnail)
          ? entry.thumbnail
          : fallbackThumbnail
        : undefined;

    items.push({
      type,
      src: src.trim(),
      alt,
      ...(thumbnail ? { thumbnail } : {}),
    });

    return items;
  }, []);
};

export const buildDrawingMedia = (drawing, fallbackTitle = "Tekening media") => {
  if (!drawing || typeof drawing !== "object") return [];

  const title = isNonEmptyString(drawing.title) ? drawing.title : fallbackTitle;
  const fallbackThumbnail = isNonEmptyString(drawing.thumbnail)
    ? drawing.thumbnail
    : undefined;

  return [
    ...normalizeMediaEntries({
      entries: drawing.images,
      type: "image",
      fallbackAlt: title,
    }),
    ...normalizeMediaEntries({
      entries: drawing.video,
      type: "video",
      fallbackAlt: title,
      fallbackThumbnail,
    }),
  ];
};

export const getDisplayValue = (value, fallback = "-") => {
  if (isNonEmptyString(value)) return value.trim();
  return fallback;
};
