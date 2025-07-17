import { Metadata } from "next";

interface ProtectedPageMetadata {
  title: string;
  description?: string;
  keywords?: string[];
}

export function createProtectedPageMetadata({
  title,
  description,
  keywords = [],
}: ProtectedPageMetadata): Metadata {
  const fullTitle = `${title} - 管理機能`;
  const defaultDescription = "管理者向けの機能です。";
  const defaultKeywords = ["管理", "管理機能", "admin"];

  return {
    title: fullTitle,
    description: description || defaultDescription,
    keywords: [...defaultKeywords, ...keywords].join(", "),
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: fullTitle,
      description: description || defaultDescription,
      type: "website",
    },
  };
}