export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD);
}

export function getBasicAuthHeaderValue(username: string, password: string) {
  const credentials = `${username}:${password}`;
  const encoded =
    typeof btoa === "function"
      ? btoa(credentials)
      : Buffer.from(credentials).toString("base64");

  return `Basic ${encoded}`;
}
