import React, { useMemo, useCallback, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./editor.css";

export default function Editor({ value, onChange }) {
  const quillRef = useRef(null);

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const quill = quillRef.current?.getEditor();
        const range = quill?.getSelection();
        const position = range ? range.index : quill.getLength();
        quill?.insertEmbed(position, "image", reader.result);
        quill?.setSelection(position + 1);
      };
      reader.readAsDataURL(file);
    };
  }, []);

  // 🎨 === không gọi inline trong JSX nữa ===
  const editorStyles = useMemo(() => ({
    editorHeight: "280px",
    bubbleEmployeeText: "white",
  }), []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ font: [] }, { size: [] }],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ color: [] }, { background: [] }],
          [{ align: [] }, { indent: "-1" }, { indent: "+1" }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: { image: imageHandler },
      },
      clipboard: { matchVisual: false },
    }),
    [imageHandler]
  );

  const formats = useMemo(
    () => [
      "header","font","size","bold","italic","underline","strike",
      "blockquote","color","background","list","bullet","align",
      "indent","link","image","video",
    ], []
  );

  return (
    <div style={{ width: "100%", height: editorStyles.editorHeight }}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder="Write the blog content here..."
        style={{
          height: "100%",
          borderRadius: "12px",
          boxSizing: "border-box", /* ✅ chặn đội chiều cao */
        }}
      />
    </div>
  );
}
