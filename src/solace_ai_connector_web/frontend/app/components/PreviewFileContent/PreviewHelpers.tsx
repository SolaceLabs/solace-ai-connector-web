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

export function decodeBase64Content(content: string): string {
    try {
        return new TextDecoder().decode(
            Uint8Array.from(atob(content), (c) => c.charCodeAt(0))
        );
    } catch (error) {
        return atob(content);
    }
}