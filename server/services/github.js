require("dotenv").config();

// Headers that is send with every GitHub API request
const GITHUB_HEADERS = {
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  "Content-Type": "application/json",
};

const GITHUB_USERNAME = process.env.GITHUB_USERNAME;


// Fetches data for one specific repo by name
// Example: fetchRepo('my-portfolio') hits:
// GET https://api.github.com/repos/yourusername/my-portfolio
async function fetchRepo(repoName) {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}`,
    { headers: GITHUB_HEADERS }
  );

  // If GitHub returns an error (repo not found, rate limited, etc.)
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = await response.json();

  // Only return the fields that are actually needed
  return {
    stars: data.stargazers_count,
    forks: data.forks_count,
    language: data.language,
    description: data.description,
  };
}

// Fetches pinned repos using GitHub's GraphQL API
// GraphQL lets ask for exactly the fields need in one request
async function fetchPinnedRepos() {
  // This is a GraphQL query — think of it as describing
  // exactly what data shape you want back
  const query = `
    {
      user(login: "${GITHUB_USERNAME}") {
        pinnedItems(first: 6, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name
              description
              url
              stargazerCount
              forkCount
              primaryLanguage {
                name
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: GITHUB_HEADERS,
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL error: ${response.status}`);
  }

  const data = await response.json();

  // Navigate into the nested response and reshape it
  // into a clean flat array
  const nodes = data.data.user.pinnedItems.nodes;

  return nodes.map(repo => ({
    name: repo.name,
    description: repo.description,
    url: repo.url,
    stars: repo.stargazerCount,
    forks: repo.forkCount,
    language: repo.primaryLanguage?.name || null,
  }));
}

module.exports = { fetchRepo, fetchPinnedRepos };