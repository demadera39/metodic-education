'use client';

import Link from 'next/link';

interface PrintToolbarProps {
  backHref: string;
  downloadHref?: string;
}

export function PrintToolbar({ backHref, downloadHref }: PrintToolbarProps) {
  return (
    <div className="toolbar">
      <Link href={backHref}>Back to Playbook</Link>
      {downloadHref && (
        <a href={downloadHref}>Download PDF</a>
      )}
    </div>
  );
}
