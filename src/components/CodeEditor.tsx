import React from 'react';
import { TEXTAREA_ROWS, TEXTAREA_COLS } from '../config/constants';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange }) => {
  return (
    <textarea
      value={code}
      onChange={(e) => onChange(e.target.value)}
      rows={TEXTAREA_ROWS}
      cols={TEXTAREA_COLS}
      placeholder="Paste your Arduino code here..."
      style={{
        fontFamily: 'monospace',
        width: '100%',
        height: '100%',
        resize: 'none',
        border: '1px solid #ccc',
        padding: '10px',
      }}
    />
  );
};

export default CodeEditor;
