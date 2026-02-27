import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'markdown', standalone: true })
export class MarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';

    const lines = value.split('\n');
    let html = '';
    let inList = false;

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();

      if (line.trim() === '') {
        if (inList) { html += '</ul>'; inList = false; }
        html += '<br>';
        continue;
      }

      if (line.startsWith('### ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h3>${this.inline(line.slice(4))}</h3>`;
        continue;
      }
      if (line.startsWith('## ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h2>${this.inline(line.slice(3))}</h2>`;
        continue;
      }
      if (line.startsWith('# ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h1>${this.inline(line.slice(2))}</h1>`;
        continue;
      }

      if (line.startsWith('- ') || line.startsWith('* ')) {
        if (!inList) { html += '<ul>'; inList = true; }
        html += `<li>${this.inline(line.slice(2))}</li>`;
        continue;
      }

      if (/^\d+\. /.test(line)) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<ol><li>${this.inline(line.replace(/^\d+\. /, ''))}</li></ol>`;
        continue;
      }

      if (inList) { html += '</ul>'; inList = false; }
      html += `<p>${this.inline(line)}</p>`;
    }

    if (inList) html += '</ul>';

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private inline(text: string): string {
    return text
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>');
  }
}
