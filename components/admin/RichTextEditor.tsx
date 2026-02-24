"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
} from "lucide-react";

type Props = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export function RichTextEditor({ content, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: placeholder ?? "Write..." }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "min-h-[200px] px-4 py-3 focus:outline-none",
      },
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  const btn = (active: boolean) =>
    cn(
      "p-1.5 rounded-lg transition-colors",
      active
        ? "bg-white/15 text-white"
        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/8"
    );

  return (
    <div className="bg-surface-2">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-0.5 p-2 border-b border-white/8">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btn(editor.isActive("bold"))}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btn(editor.isActive("italic"))}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={btn(editor.isActive("underline"))}
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <div className="w-px bg-white/8 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={btn(editor.isActive("heading", { level: 2 }))}
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={btn(editor.isActive("heading", { level: 3 }))}
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <div className="w-px bg-white/8 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btn(editor.isActive("bulletList"))}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btn(editor.isActive("orderedList"))}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={btn(editor.isActive("blockquote"))}
        >
          <Quote className="w-4 h-4" />
        </button>
        <div className="w-px bg-white/8 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={btn(editor.isActive({ textAlign: "left" }))}
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={btn(editor.isActive({ textAlign: "center" }))}
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={btn(editor.isActive({ textAlign: "right" }))}
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <div className="w-px bg-white/8 mx-1" />
        <button
          type="button"
          onClick={() => {
            const url = prompt("Enter URL:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          className={btn(editor.isActive("link"))}
        >
          <Link2 className="w-4 h-4" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
