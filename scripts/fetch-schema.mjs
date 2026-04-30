/**
 * Fetches the GraphQL schema from WordPress and saves it locally.
 * Strips BOM that some PHP/WordPress setups add to JSON responses.
 * Run via: npm run schema:fetch
 */
import { writeFileSync, existsSync, readFileSync } from 'fs';

let endpoint = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

if (!endpoint && existsSync('.env.local')) {
  const lines = readFileSync('.env.local', 'utf-8').split('\n');
  for (const line of lines) {
    const match = line.match(/^NEXT_PUBLIC_WORDPRESS_API_URL=(.+)$/);
    if (match) endpoint = match[1].trim();
  }
}

if (!endpoint) {
  console.error('[fetch-schema] NEXT_PUBLIC_WORDPRESS_API_URL is not set.');
  process.exit(1);
}

console.log(`[fetch-schema] Fetching schema from ${endpoint}…`);

const response = await fetch(endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify({ query: '{ __schema { queryType { name } } }' }),
});

if (!response.ok) {
  console.error(`[fetch-schema] HTTP ${response.status}: ${await response.text()}`);
  process.exit(1);
}

// Use the full introspection query
const introspectionQuery = `
  query IntrospectionQuery {
    __schema {
      queryType { name }
      mutationType { name }
      subscriptionType { name }
      types {
        kind name description
        fields(includeDeprecated: true) {
          name description
          args { name description type { ...TypeRef } defaultValue }
          type { ...TypeRef }
          isDeprecated deprecationReason
        }
        inputFields { name description type { ...TypeRef } defaultValue }
        interfaces { ...TypeRef }
        enumValues(includeDeprecated: true) { name description isDeprecated deprecationReason }
        possibleTypes { ...TypeRef }
      }
      directives {
        name description locations
        args { name description type { ...TypeRef } defaultValue }
      }
    }
  }
  fragment TypeRef on __Type {
    kind name ofType {
      kind name ofType {
        kind name ofType {
          kind name ofType {
            kind name ofType {
              kind name ofType { kind name }
            }
          }
        }
      }
    }
  }
`;

const fullResponse = await fetch(endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify({ query: introspectionQuery }),
});

if (!fullResponse.ok) {
  console.error(`[fetch-schema] HTTP ${fullResponse.status}`);
  process.exit(1);
}

let text = await fullResponse.text();
// Strip UTF-8 BOM (U+FEFF) that some PHP servers add
text = text.replace(/^﻿/, '');

let json;
try {
  json = JSON.parse(text);
} catch {
  console.error('[fetch-schema] Failed to parse JSON response.');
  console.error(text.slice(0, 300));
  process.exit(1);
}

if (json.errors) {
  console.error('[fetch-schema] GraphQL errors:', json.errors);
  process.exit(1);
}

writeFileSync('lib/graphql/schema.json', JSON.stringify(json, null, 2), 'utf-8');
console.log('[fetch-schema] ✔ Schema saved to lib/graphql/schema.json');
