export function formatDate(unix) {
    if (!unix) return 'N/A';
    const date = new Date(unix * 1000);
    return date.toLocaleString();
  }
  
  export function truncateHash(hash, length = 10) {
    if (!hash) return '';
    return `${hash.substring(0, length)}...`;
  }
  