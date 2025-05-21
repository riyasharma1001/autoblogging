// pages/testEditor.js
import { useRef } from "react";
import dynamic from "next/dynamic";

// Dynamically import EditorJs and extract its default export
const EditorJs = dynamic(
  () => import("react-editor-js").then((mod) => mod.default),
  { ssr: false }
);

// Import Paragraph tool
import Paragraph from "@editorjs/paragraph";

const EDITOR_JS_TOOLS = {
  paragraph: {
    class: Paragraph,
    inlineToolbar: true,
    config: {
      placeholder: "Start typing here...",
    },
  },
};

export default function TestEditor() {
  const editorCore = useRef(null);
  const defaultData = {
    blocks: [
      {
        type: "paragraph",
        data: { text: "Start typing here..." },
      },
    ],
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20, border: "1px solid #ccc" }}>
      <h1>Editor.js Test</h1>
      <EditorJs
        instanceRef={(instance) => (editorCore.current = instance)}
        tools={EDITOR_JS_TOOLS}
        data={defaultData}
      />
      <style jsx global>{`
        .codex-editor__redactor {
          min-height: 150px;
        }
      `}</style>
    </div>
  );
}
