import type { NextConfig } from "next";

function supabaseHost(url: string | undefined) {
  try {
    return url ? [new URL(url).hostname] : [];
  } catch {
    return [];
  }
}

const imageHosts = Array.from(
  new Set([
    "cqlivuuvnqiojkwjdslf.supabase.co",
    "scdppqcuddvghfupcwhj.supabase.co",
    ...supabaseHost(process.env.NEXT_PUBLIC_SUPABASE_URL),
  ])
);

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_IMAGE_HOSTS: imageHosts.join(","),
  },
  images: {
    remotePatterns: imageHosts.map((hostname) => ({
      protocol: "https" as const,
      hostname,
      port: "",
      pathname: "/storage/v1/object/public/**",
      search: "",
    })),
    qualities: [60, 75],
    // Uploaded file names are unique, so a replaced photo always gets a new URL.
    minimumCacheTTL: 2678400,
  },
};

export default nextConfig;
