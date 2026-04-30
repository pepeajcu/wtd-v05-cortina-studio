import type { CodegenConfig } from '@graphql-codegen/cli';
import fs from 'fs';

// codegen runs outside Next.js, so .env.local is not loaded automatically
if (fs.existsSync('.env.local')) {
  const lines = fs.readFileSync('.env.local', 'utf-8').split('\n');
  for (const line of lines) {
    const match = line.match(/^([^#=\s][^=]*)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
}

const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

if (!endpoint) {
  throw new Error(
    'NEXT_PUBLIC_WORDPRESS_API_URL is not set. Create .env.local from .env.example before running codegen.',
  );
}

const config: CodegenConfig = {
  schema: 'lib/graphql/schema.json',
  documents: ['lib/graphql/queries/**/*.graphql'],
  generates: {
    'lib/graphql/generated/index.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: {
        avoidOptionals: false,
        maybeValue: 'T | null | undefined',
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
