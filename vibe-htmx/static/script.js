// static/script.js
// Make notes draggable
let activeNote = null;
let offsetX = 0;
let offsetY = 0;

// Use event delegation on the whiteboard container
const whiteboard = document.getElementById('whiteboard');

if (whiteboard) { // Ensure whiteboard exists before adding listeners
    whiteboard.addEventListener('mousedown', (e) => {
        // Only start drag if the target is a note itself, not its content/buttons, and not editing
        if (e.target.classList.contains('note') && !e.target.dataset.editing) {
            activeNote = e.target;
            // Calculate offset from the top-left corner of the note
            const rect = activeNote.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            activeNote.style.cursor = 'grabbing'; // Change cursor
            activeNote.style.zIndex = 1000; // Bring to front
            activeNote.classList.add('dragging'); // Add dragging class for visual feedback
        }
    });

    // --- Edit Functionality ---
    whiteboard.addEventListener('dblclick', (e) => {
        // Only allow edit on the note content area if defined, or the note itself
        // Check if the target is the note's content div or the note itself (if no specific content div)
        const targetElement = e.target;
        const noteElement = targetElement.closest('.note'); // Find the parent note

        if (noteElement && !noteElement.querySelector('textarea') && !noteElement.dataset.editing) {
             // Prefer editing the .note-content if it exists and was clicked,
             // otherwise allow editing if the note div itself was clicked.
            if (targetElement.classList.contains('note-content') || targetElement === noteElement) {
                // Prevent drag from starting on dblclick
                if (activeNote === noteElement) {
                    activeNote = null;
                }
                makeNoteEditable(noteElement);
            }
        }
    });
} // End of if (whiteboard) check

// Moved mousemove and mouseup listeners to document to handle dragging outside whiteboard
document.addEventListener('mousemove', (e) => {
    if (!activeNote) return;

    // Prevent default text selection behavior during drag
    e.preventDefault();

    // Calculate new position relative to the viewport initially
    const newX = e.clientX - offsetX;
    const newY = e.clientY - offsetY;

    // Get whiteboard bounds IF we want to constrain movement within it
    // const whiteboardRect = whiteboard.getBoundingClientRect();
    // Adjust position calculation if relative to whiteboard:
    // const newX = e.clientX - whiteboardRect.left - offsetX;
    // const newY = e.clientY - whiteboardRect.top - offsetY;

    // Update style based on viewport coordinates for simplicity now
    activeNote.style.left = `${newX}px`;
    activeNote.style.top = `${newY}px`;
});

document.addEventListener('mouseup', (e) => {
    if (!activeNote) return;

    activeNote.classList.remove('dragging'); // Remove dragging class
    activeNote.style.cursor = 'grab'; // Restore cursor
    activeNote.style.zIndex = ''; // Restore z-index

    const noteId = activeNote.dataset.id;
    // Read position relative to the viewport's top-left
    const finalX = parseInt(activeNote.style.left, 10);
    const finalY = parseInt(activeNote.style.top, 10);

    // Send position update to server using htmx.ajax
    if (noteId && !isNaN(finalX) && !isNaN(finalY)) {
        htmx.ajax('PUT', `/api/notes/${noteId}/position`, {
            values: {
                pos_x: finalX,
                pos_y: finalY
            },
        }).catch(error => {
            console.error("Error updating note position:", error);
            // Optionally revert position visually on error
            alert(`メモの位置更新に失敗しました: ${error.message || error}`); // Add user feedback
        });
    } else {
        console.error("Could not update position: Invalid ID or coordinates.", {noteId, finalX, finalY});
        alert('メモの位置情報の取得または送信に失敗しました。'); // Add user feedback
    }

    activeNote = null; // Stop tracking the note
});


function makeNoteEditable(noteElement) {
    if (!noteElement) return; // Add check for noteElement
    const noteId = noteElement.dataset.id;
    const contentDiv = noteElement.querySelector('.note-content');
    if (!contentDiv) {
        console.error("Could not find .note-content to edit in note:", noteElement);
        alert('メモの内容領域が見つかりませんでした。'); // Add user feedback
        return; // Don't proceed if content area isn't found
    }
    const currentContent = contentDiv.innerText; // Use innerText to get displayed text

    // Create textarea
    const textarea = document.createElement('textarea');
    textarea.value = currentContent;
    // Basic styling - maybe inherit from CSS?
    textarea.style.width = '95%'; // Adjust styling as needed
    textarea.style.height = 'calc(100% - 25px)'; // Adjust height considering button/padding
    textarea.style.boxSizing = 'border-box';
    textarea.style.resize = 'none'; // Prevent manual resizing
    textarea.style.border = '1px solid #ccc';
    textarea.style.fontFamily = 'inherit';
    textarea.style.fontSize = 'inherit';
    textarea.setAttribute('hx-put', `/api/notes/${noteId}`);
    textarea.setAttribute('hx-trigger', 'blur, keydown[key==\'Enter\']');
    textarea.setAttribute('hx-target', `#note-${noteId}`); // Target the note div itself
    textarea.setAttribute('hx-swap', 'outerHTML'); // Replace the note div with the response
    textarea.setAttribute('name', 'content'); // Name for form submission

    // Replace note content div with textarea
    contentDiv.replaceWith(textarea);

    // Apply htmx processing to the new textarea
    htmx.process(textarea);

    // Focus the textarea and select text
    textarea.focus();
    textarea.select();

    // Prevent drag while editing
    noteElement.style.cursor = 'text'; // Change cursor to text input
    noteElement.dataset.editing = 'true'; // Set editing flag
}

// --- End Edit Functionality ---


// Initial cursor style for notes & re-binding events if necessary
htmx.onLoad(function(elt) {
    // Find all notes within the newly loaded element (or the whole document initially)
    // Improved targeting: Look within the element 'elt' that htmx loaded content into
    // Convert NodeList to Array using Array.from()
    const notes = elt.querySelectorAll ? Array.from(elt.querySelectorAll('.note')) : [];

     // Also handle the case where elt itself is the note being swapped
    if (elt.classList && elt.classList.contains('note')) {
        notes.push(elt);
    }


    notes.forEach(note => {
         // Cleanup editing state if a note was replaced (textarea removed)
        if (note.dataset.editing && !note.querySelector('textarea')) {
             delete note.dataset.editing;
        }

        // Only apply grab cursor if not currently editing
        if (!note.dataset.editing) {
             note.style.cursor = 'grab';
        } else {
            note.style.cursor = 'text'; // Ensure text cursor if somehow still editing
        }
    });

    // Reset cursor on the form after adding a note
    const addForm = document.getElementById('add-note-form');
    if (addForm && elt.contains(addForm)) { // Check if the loaded content includes the form area (or initially)
        // No specific cursor reset needed for the form itself generally
    }

});
