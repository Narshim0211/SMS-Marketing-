"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: (props) => <h1 className="mt-4 text-2xl font-semibold" {...props} />,
        h2: (props) => <h2 className="mt-4 text-xl font-semibold" {...props} />,
        h3: (props) => <h3 className="mt-3 text-lg font-semibold" {...props} />,
        p: (props) => <p className="mt-2 leading-7" {...props} />,
        ul: (props) => <ul className="mt-2 list-disc pl-6" {...props} />,
        ol: (props) => <ol className="mt-2 list-decimal pl-6" {...props} />,
        code: (props) => (
          <code className="rounded bg-gray-100 px-1 py-0.5 text-sm" {...props} />
        ),
        pre: (props) => (
          <pre className="mt-2 overflow-x-auto rounded bg-gray-900 p-3 text-gray-100" {...props} />
        ),
        table: (props) => (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse" {...props} />
          </div>
        ),
        th: (props) => (
          <th className="border-b p-2 text-left font-medium" {...props} />
        ),
        td: (props) => <td className="border-b p-2" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
