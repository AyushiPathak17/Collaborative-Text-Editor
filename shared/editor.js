// shared/editor.js
const { TextDocument } = require('monaco-editor');

let documentText = ''; // Initial document text

const applyTextUpdate = (textUpdate) => {
  // Apply text update to the document
  documentText = textUpdate;
};

const applyHighlightUpdate = (highlightUpdate) => {
  // Apply highlight update to the document (if needed)
};

module.exports = {
  getDocumentText: () => documentText,
  applyTextUpdate,
  applyHighlightUpdate,
};
