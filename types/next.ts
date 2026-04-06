// Helper type for Next.js 16 async params
export type PageProps<TParams extends Record<string, string> = Record<string, string>> = {
  params: Promise<TParams>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};
