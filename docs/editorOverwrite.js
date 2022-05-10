import {TILE_EMPTY} from "./constants.js";

export function setToOverwrite(editor, parseData = (x) => x) {
    const width = editor.cols;
    const height = editor.rows;
    document.addEventListener('selectionchange', (event) => {
        if (event.target === editor) {
            const start = editor.selectionStart;
            if (start % (width + 1) < width) {
                editor.setSelectionRange(start, start + 1);
            } else {
                editor.setSelectionRange(start - 1, start);
            }
        }
    });
    editor.addEventListener('keydown', (event) => {
        let arrow = true;
        let start = editor.selectionStart;
        switch (event.code) {
            case 'ArrowUp':
                if (start > width) {
                    start -= width + 1;
                }
                break;
            case 'ArrowDown':
                if (start < (width + 1) * (height - 1)) {
                    start += width + 1;
                }
                break;
            case 'ArrowLeft':
                if (start % (width + 1) > 0) {
                    start -= 1;
                }
                break;
            case 'ArrowRight':
                if (start % (width + 1) < width) {
                    start += 1;
                }
                break;
            case 'Backspace':
                if (start % (width + 1) > 0) {
                    start -= 1;
                }
            case 'Delete':
                editor.value = `${editor.value.substring(0, start)}${TILE_EMPTY}${editor.value.substring(start + 1)}`;
                break;
            default:
                arrow = false;
                break;
        }
        if (arrow) {
            event.preventDefault();
            editor.setSelectionRange(start, start + 1);
        }
    });
    editor.addEventListener('copy', (event) => {
        event.preventDefault();
        event.clipboardData.setData('text/plain', editor.value);
    });
    editor.addEventListener('paste', (event) => {
        event.preventDefault();
        const data = event.clipboardData.getData('text/plain');
        if (data !== '') {
            editor.value = parseData(data);
        }
    });
}