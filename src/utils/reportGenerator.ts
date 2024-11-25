import { Certificate } from '../types';

interface BatchResult {
  domain: string;
  port: number;
  certificates: Certificate[];
  error?: string;
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(date);
};

const getDaysUntilExpiry = (validTo: string): number => {
  const expiryDate = new Date(validTo);
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getExpiryStatus = (daysUntilExpiry: number): string => {
  if (daysUntilExpiry < 0) return 'Expired';
  if (daysUntilExpiry < 30) return 'Critical';
  if (daysUntilExpiry < 90) return 'Warning';
  return 'Valid';
};

export const generateCSVReport = (results: BatchResult[]): string => {
  const headers = [
    'Domain',
    'Port',
    'Status',
    'Subject',
    'Issuer',
    'Valid From',
    'Valid Until',
    'Days Until Expiry',
    'Expiry Status',
    'Serial Number',
    'Error'
  ].join(',');

  const rows = results.map((result) => {
    if (result.error) {
      return `${result.domain},${result.port},"Error",,,,,,,"",${result.error}`;
    }

    const mainCert = result.certificates[0];
    if (!mainCert) {
      return `${result.domain},${result.port},"No Certificate",,,,,,,"",No certificate found`;
    }

    const daysUntilExpiry = mainCert.validTo ? getDaysUntilExpiry(mainCert.validTo) : 0;
    const expiryStatus = getExpiryStatus(daysUntilExpiry);

    return [
      result.domain,
      result.port,
      'Success',
      mainCert.subject ?? '',  // Use ?? to default to empty string if undefined
      mainCert.issuer ?? '',
      mainCert.validFrom ? formatDate(new Date(mainCert.validFrom)) : '',
      mainCert.validTo ? formatDate(new Date(mainCert.validTo)) : '',
      daysUntilExpiry,
      expiryStatus,
      mainCert.serialNumber ?? '',
      ''
    ].map(field => `"${field}"`).join(',');
  });

  return [headers, ...rows].join('\n');
};

export const generateHTMLReport = (results: BatchResult[]): string => {
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const header = `
    <!DOCTYPE html>
    <html lang="en" class="dark">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SSL Certificate Report</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        tailwind.config = {
          darkMode: 'class',
          theme: {
            extend: {
              colors: {
                dark: {
                  50: '#171923',
                  100: '#1A202C',
                  200: '#2D3748',
                  300: '#4A5568',
                  400: '#718096',
                  500: '#A0AEC0',
                  600: '#CBD5E0',
                  700: '#E2E8F0',
                }
              }
            }
          }
        }
      </script>
      <script src="https://unpkg.com/alpinejs" defer></script>
      <style>
        [x-cloak] { display: none !important; }
        .transition-expand {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 200ms;
        }
      </style>
    </head>
    <body class="bg-dark-50 text-dark-600 p-8" x-data="{ activeRow: null }">
      <div class="max-w-7xl mx-auto">
        <!-- Header Section -->
        <div class="bg-dark-100 rounded-lg shadow-xl border border-dark-200 p-6 mb-6">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-dark-600 mb-2">SSL Certificate Report</h1>
              <p class="text-dark-400">Generated on ${reportDate}</p>
            </div>
            <div class="flex gap-4">
              <div class="bg-dark-200 rounded-lg p-4 text-center">
                <p class="text-sm text-dark-400 mb-1">Valid</p>
                <p class="text-2xl font-bold text-green-400">
                  ${results.filter(r => r.certificates?.[0]?.validTo && getDaysUntilExpiry(r.certificates[0].validTo) > 30).length}
                </p>
              </div>
              <div class="bg-dark-200 rounded-lg p-4 text-center">
                <p class="text-sm text-dark-400 mb-1">Warning</p>
                <p class="text-2xl font-bold text-yellow-400">
                  ${results.filter(r => {
                    const cert = r.certificates?.[0];
                    if (!cert?.validTo) return false;
                    const days = getDaysUntilExpiry(cert.validTo);
                    return days > 0 && days <= 30;
                  }).length}
                </p>
              </div>
              <div class="bg-dark-200 rounded-lg p-4 text-center">
                <p class="text-sm text-dark-400 mb-1">Expired</p>
                <p class="text-2xl font-bold text-red-400">
                  ${results.filter(r => r.certificates?.[0]?.validTo && getDaysUntilExpiry(r.certificates[0].validTo) <= 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Table Section -->
        <div class="bg-dark-100 rounded-lg shadow-xl border border-dark-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-dark-200">
              <thead>
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider bg-dark-200">
                    <div class="flex items-center cursor-pointer" @click="$store.sort.toggle('domain')">
                      Domain
                      <svg class="w-4 h-4 ml-1" :class="{ 'rotate-180': $store.sort.direction === 'desc' }" 
                           x-show="$store.sort.field === 'domain'" fill="none" viewBox="0 0 24 24" 
                           stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider bg-dark-200">Port</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider bg-dark-200">
                    <div class="flex items-center cursor-pointer" @click="$store.sort.toggle('expiry')">
                      Status
                      <svg class="w-4 h-4 ml-1" :class="{ 'rotate-180': $store.sort.direction === 'desc' }" 
                           x-show="$store.sort.field === 'expiry'" fill="none" viewBox="0 0 24 24" 
                           stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider bg-dark-200">Validity</th>
                  <th class="w-10 px-4 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider bg-dark-200"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-dark-200">
  `;

  const getStatusStyles = (status: string) => {
    const styles = {
      'Expired': {
        row: 'hover:bg-red-900/20',
        text: 'text-red-400',
        badge: 'bg-red-900/50 text-red-400'
      },
      'Critical': {
        row: 'hover:bg-orange-900/20',
        text: 'text-orange-400',
        badge: 'bg-orange-900/50 text-orange-400'
      },
      'Warning': {
        row: 'hover:bg-yellow-900/20',
        text: 'text-yellow-400',
        badge: 'bg-yellow-900/50 text-yellow-400'
      },
      'Valid': {
        row: 'hover:bg-green-900/20',
        text: 'text-green-400',
        badge: 'bg-green-900/50 text-green-400'
      }
    };
    return styles[status as keyof typeof styles] || styles['Valid'];
  };

  const tableRows = results.map((result, index) => {
    if (result.error) {
      return `
        <tr class="bg-dark-100 hover:bg-dark-200 transition-colors">
          <td class="px-4 py-3 font-medium text-red-400">${result.domain}</td>
          <td class="px-4 py-3 text-dark-500">${result.port}</td>
          <td class="px-4 py-3" colspan="3">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-400">
              Error: ${result.error}
            </span>
          </td>
        </tr>
      `;
    }

    const cert = result.certificates[0];
    if (!cert) {
      return `
        <tr class="bg-dark-100 hover:bg-dark-200 transition-colors">
          <td class="px-4 py-3 text-dark-500">${result.domain}</td>
          <td class="px-4 py-3 text-dark-500">${result.port}</td>
          <td class="px-4 py-3" colspan="3">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-dark-200 text-dark-400">
              No certificate found
            </span>
          </td>
        </tr>
      `;
    }

    const daysUntilExpiry = cert.validTo ? getDaysUntilExpiry(cert.validTo) : 0;
    const status = getExpiryStatus(daysUntilExpiry);
    const styles = getStatusStyles(status);

    return `
      <tr class="bg-dark-100 ${styles.row} transition-colors cursor-pointer group"
          @click="activeRow = activeRow === ${index} ? null : ${index}">
        <td class="px-4 py-3 font-medium ${styles.text}">${result.domain}</td>
        <td class="px-4 py-3 text-dark-500">${result.port}</td>
        <td class="px-4 py-3">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles.badge}">
            ${status} (${daysUntilExpiry} days)
          </span>
        </td>
        <td class="px-4 py-3 text-sm text-dark-500">
          <div class="flex flex-col">
            <span>From: ${cert.validFrom ? formatDate(new Date(cert.validFrom)) : ''}</span>
            <span>To: ${cert.validTo ? formatDate(new Date(cert.validTo)) : ''}</span>
          </div>
        </td>
        <td class="px-4 py-3 text-center">
          <svg class="w-5 h-5 transition-transform duration-200 text-dark-400 group-hover:text-dark-300" 
               :class="{ 'rotate-180': activeRow === ${index} }"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </td>
      </tr>
      <tr x-show="activeRow === ${index}" 
          x-cloak
          x-transition:enter="transition ease-out duration-200"
          x-transition:enter-start="opacity-0 transform -translate-y-2"
          x-transition:enter-end="opacity-100 transform translate-y-0"
          x-transition:leave="transition ease-in duration-200"
          x-transition:leave-start="opacity-100 transform translate-y-0"
          x-transition:leave-end="opacity-0 transform -translate-y-2">
        <td colspan="5" class="bg-dark-200 px-6 py-4">
          <div class="grid grid-cols-2 gap-6">
            <div>
              <h3 class="text-sm font-medium text-dark-400 mb-4">Certificate Details</h3>
              <dl class="space-y-3">
                <div>
                  <dt class="text-sm font-medium text-dark-500">Subject</dt>
                  <dd class="mt-1 text-sm text-dark-400">${cert.subject || ''}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-dark-500">Issuer</dt>
                  <dd class="mt-1 text-sm text-dark-400">${cert.issuer || ''}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-dark-500">Serial Number</dt>
                  <dd class="mt-1 text-sm font-mono text-dark-400">${cert.serialNumber || ''}</dd>
                </div>
                ${cert.fingerprint ? `
                  <div>
                    <dt class="text-sm font-medium text-dark-500">Fingerprint</dt>
                    <dd class="mt-1 text-sm font-mono text-dark-400">${cert.fingerprint}</dd>
                  </div>
                ` : ''}
                ${cert.bits ? `
                  <div>
                    <dt class="text-sm font-medium text-dark-500">Key Size</dt>
                    <dd class="mt-1 text-sm text-dark-400">${cert.bits} bits</dd>
                  </div>
                ` : ''}
              </dl>
            </div>
            ${(cert.sans || cert.ext_key_usage) ? `
              <div>
                <h3 class="text-sm font-medium text-dark-400 mb-4">Extended Information</h3>
                <dl class="space-y-3">
                  ${cert.sans ? `
                    <div>
                      <dt class="text-sm font-medium text-dark-500">Subject Alternative Names</dt>
                      <dd class="mt-1 text-sm text-dark-400">
                        <ul class="list-disc pl-4 space-y-1">
                          ${cert.sans.map(san => `<li>${san}</li>`).join('')}
                        </ul>
                      </dd>
                    </div>
                  ` : ''}
                  ${cert.ext_key_usage ? `
                    <div>
                      <dt class="text-sm font-medium text-dark-500">Extended Key Usage</dt>
                      <dd class="mt-1 text-sm text-dark-400">
                        <ul class="list-disc pl-4 space-y-1">
                          ${cert.ext_key_usage.map(usage => `<li>${usage}</li>`).join('')}
                        </ul>
                      </dd>
                    </div>
                  ` : ''}
                </dl>
              </div>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  const footer = `
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="mt-6 text-center text-sm text-dark-400">
            <p>Generated by SSL Certificate Checker</p>
          </div>
        </div>

        <script>
          document.addEventListener('alpine:init', () => {
            Alpine.store('sort', {
              field: null,
              direction: 'asc',
              toggle(newField) {
                if (this.field === newField) {
                  this.direction = this.direction === 'asc' ? 'desc' : 'asc';
                } else {
                  this.field = newField;
                  this.direction = 'asc';
                }
                this.applySort();
              },
              applySort() {
                const rows = document.querySelectorAll('tbody tr:not([x-show])');
                const sortedRows = Array.from(rows).sort((a, b) => {
                  let aVal, bVal;
                  
                  if (this.field === 'domain') {
                    aVal = a.querySelector('td:first-child').textContent;
                    bVal = b.querySelector('td:first-child').textContent;
                    return this.direction === 'asc' ? 
                      aVal.localeCompare(bVal) : 
                      bVal.localeCompare(aVal);
                  }
                  
                  if (this.field === 'expiry') {
                    const getDays = (row) => {
                      const statusText = row.querySelector('td:nth-child(3)').textContent;
                      const match = statusText.match(/\((-?\d+) days\)/);
                      return match ? parseInt(match[1]) : -999999;
                    };
                    aVal = getDays(a);
                    bVal = getDays(b);
                    return this.direction === 'asc' ? aVal - bVal : bVal - aVal;
                  }
                  
                  return 0;
                });
                
                const tbody = document.querySelector('tbody');
                sortedRows.forEach(row => {
                  const details = row.nextElementSibling;
                  tbody.appendChild(row);
                  if (details && details.hasAttribute('x-show')) {
                    tbody.appendChild(details);
                  }
                });
              }
            });
          });
        </script>
      </body>
      </html>
    `;

  return header + tableRows + footer;
};
