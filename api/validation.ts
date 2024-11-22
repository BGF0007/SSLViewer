export { validateHostname };

function validateHostname(hostname: string): string | null {
  if (!hostname) {
    return 'Hostname is required';
  }

  const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  if (!hostnameRegex.test(hostname)) {
    return 'Invalid hostname format';
  }

  return null;
}
