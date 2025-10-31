// Load styles for module federation
export function loadStyles() {
  const cssId = 'admin-dashboard-styles';
  
  // Check if styles are already loaded
  if (document.getElementById(cssId)) {
    return;
  }

  // In production (module federation), load from the admin dashboard server
  const baseUrl = 'http://localhost:1003';
  
  // Try to find the CSS file by checking the manifest
  fetch(`${baseUrl}/assets/manifest.json`)
    .then(res => res.json())
    .then(manifest => {
      // Find the CSS file
      const cssFile = Object.values(manifest).find((entry: any) => 
        entry.file && entry.file.endsWith('.css')
      ) as any;
      
      if (cssFile) {
        const link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.href = `${baseUrl}/${cssFile.file}`;
        document.head.appendChild(link);
      }
    })
    .catch(() => {
      // Fallback: load index.css directly if manifest fails
      // This will work in development mode
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = `${baseUrl}/src/index.css`;
      document.head.appendChild(link);
    });
}
