import { Helmet } from "react-helmet-async";

const DEFAULT_KEYWORDS = [
  "James Patrick De Mesa",
  "James Patrick I. De Mesa",
  "James De Mesa",
  "SaucesCode",
  "Full-Stack Developer",
  "Software Engineer",
  "Web Developer Philippines",
  "React Developer",
  "Node.js Developer",
  "Portfolio",
].join(", ");

export default function SEO({
  title = "James Patrick De Mesa — Full-Stack Developer & Software Engineer",
  description = "Portfolio of James Patrick De Mesa (SaucesCode) — Full-Stack Developer specializing in React, Node.js, PostgreSQL, and modern web applications.",
  image = "/og-image.png",
  url = "",
  type = "website",
  keywords = DEFAULT_KEYWORDS,
  author = "James Patrick De Mesa",
  publishedTime,
  modifiedTime,
  tags = [],
  schema,
  noindex = false,
}) {
  const siteUrl =
    import.meta.env.VITE_SITE_URL || "https://jamespatrickdemesa.vercel.app";
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  const fullUrl = url ? `${siteUrl}${cleanUrl}` : siteUrl;
  const fullImage = image.startsWith("http") ? image : `${siteUrl}${image.startsWith("/") ? image : `/${image}`}`;

  return (
    <Helmet>
      {/* Basic meta */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={fullUrl} />

      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
      )}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="James Patrick De Mesa Portfolio" />

      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === "article" &&
        tags.map(tag => (
          <meta property="article:tag" content={tag} key={tag} />
        ))}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:creator" content="@SaucesCode" />

      {/* Optional Structured Data (JSON-LD) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}

