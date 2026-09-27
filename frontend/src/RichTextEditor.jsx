import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Youtube from '@tiptap/extension-youtube';
import { useTranslation } from 'react-i18next';
import './RichTextEditor.css';
import API_BASE from './config';

function MenuBar({ editor }) {
  const { t } = useTranslation();
  if (!editor) return null;

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const data = new FormData();
      data.append('file', file);
      try {
        const res = await fetch(`${API_BASE}/api/team-members/upload`, { method: 'POST', body: data });
        const { imagePath } = await res.json();
        editor.chain().focus().setImage({ src: `${API_BASE}${imagePath}` }).run();
      } catch (err) {
        console.error('Image upload failed:', err);
      }
    };
    input.click();
  };

  const setLink = () => {
    const url = window.prompt(t('adminDashboard.editor.linkPrompt'));
    if (!url) return;
    editor.chain().focus().setLink({ href: url }).run();
  };

  const addYoutube = () => {
    const url = window.prompt(t('adminDashboard.editor.youtubePrompt'));
    if (!url) return;
    editor.chain().focus().setYoutubeVideo({ src: url }).run();
  };

  return (
    <div className="rte-menubar">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'active' : ''}>B</button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'active' : ''}><i>I</i></button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'active' : ''}><s>S</s></button>
      <div className="rte-divider" />
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}>H2</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'active' : ''}>H3</button>
      <div className="rte-divider" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'active' : ''}>• {t('adminDashboard.editor.bulletList')}</button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'active' : ''}>1. {t('adminDashboard.editor.orderedList')}</button>
      <div className="rte-divider" />
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'active' : ''}>" {t('adminDashboard.editor.quote')}</button>
      <div className="rte-divider" />
      <button type="button" onClick={setLink} className={editor.isActive('link') ? 'active' : ''}>{t('adminDashboard.editor.link')}</button>
      <button type="button" onClick={addImage}>{t('adminDashboard.editor.image')}</button>
      <button type="button" onClick={addYoutube}>YouTube</button>
    </div>
  );
}

function RichTextEditor({ content, onChange }) {
  const { t } = useTranslation();
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: () => t('adminDashboard.editor.placeholder') }),
      Youtube.configure({ width: 640, height: 360, nocookie: true }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="rte-wrapper">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="rte-content" />
    </div>
  );
}

export default RichTextEditor;
