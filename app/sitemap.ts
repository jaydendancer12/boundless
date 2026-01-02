import { MetadataRoute } from 'next';
import { getBlogPosts } from '@/lib/api/blog';
import type { BlogPost } from '@/types/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch real blog posts from API
  let blogPosts: MetadataRoute.Sitemap = [];
  try {
    const response = await getBlogPosts({
      status: 'PUBLISHED',
      limit: 1000, // Fetch all published posts
    });
    blogPosts = response.data.map((post: BlogPost) => ({
      url: `https://boundlessfi.xyz/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch {
    // Silently fail if fetch fails, return empty array
  }

  const baseUrl = 'https://boundlessfi.xyz';
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/me`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...blogPosts,
  ];
}
