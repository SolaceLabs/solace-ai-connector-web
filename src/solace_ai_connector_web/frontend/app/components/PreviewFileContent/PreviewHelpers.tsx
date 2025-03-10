export function isHtmlFile(fileName: string): boolean {
    if (fileName.toLowerCase().endsWith('.html') || fileName.toLowerCase().endsWith('.htm')) {
        return true;
    }
    return false;
  }

export function isMermaidFile(fileName: string): boolean {
    if (fileName.toLowerCase().endsWith('.mermaid') || fileName.toLowerCase().endsWith('.mmd')) {
        return true;
    }
    return false;
}

export function isCsvFile(fileName: string): boolean {
    if (fileName.toLowerCase().endsWith('.csv')) {
        return true;
    }
    return false;
  }