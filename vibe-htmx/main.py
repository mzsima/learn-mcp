import sqlite3
from flask import Flask, request, g, jsonify, make_response, send_from_directory # Added send_from_directory
import os # Added os module

DATABASE = 'instance/database.db'
STATIC_FOLDER = 'static' # Define static folder path relative to app root
TEMPLATE_FOLDER = 'templates' # Define template folder path (though we won't use render_template much)

app = Flask(__name__, static_folder=STATIC_FOLDER, template_folder=TEMPLATE_FOLDER) # Configure static/template folders
app.config['DATABASE'] = DATABASE

# --- Database Helper Functions (Unchanged) ---
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        # Ensure instance folder exists before connecting
        instance_path = os.path.join(app.root_path, 'instance')
        if not os.path.exists(instance_path):
             os.makedirs(instance_path)
        db = g._database = sqlite3.connect(app.config['DATABASE'])
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
     with app.app_context():
        db = get_db()
        schema_path = 'schema.sql'
        try:
            # schema.sql might be outside instance folder, look in app root
            with app.open_resource(schema_path, mode='r') as f:
                db.cursor().executescript(f.read())
        except FileNotFoundError:
             print(f"Error: Schema file not found at expected path: {schema_path}")
        db.commit()

@app.cli.command('init-db')
def init_db_command():
    """Clear the existing data and create new tables."""
    init_db()
    print('Initialized the database.')
# --- End Database Helpers ---


# --- HTML Generation Helper ---
def _generate_note_html(note):
    """Generates the HTML fragment for a single note."""
    # Ensure pos_x and pos_y are integers
    try:
        pos_x = int(note['pos_x'])
        pos_y = int(note['pos_y'])
    except (ValueError, TypeError, KeyError):
        pos_x = 10 # Default position if missing or invalid
        pos_y = 10

    # Basic escaping for content
    import html
    # Access content using key access, provide default if key might be missing
    # Although SELECT specifies columns, checking is safer
    content = note['content'] if 'content' in note.keys() else ''
    escaped_content = html.escape(content)

    # Ensure ID is present using key access
    note_id = note['id'] if 'id' in note.keys() else None
    if note_id is None:
        # Handle error or default? For now, maybe skip generation or log error
        # This shouldn't happen if called correctly after DB insert/fetch
        print(f"Warning: Generating HTML for note without ID.")
        return "" # Return empty string if ID is missing

    return f"""
    <div class="note" id="note-{note_id}" data-id="{note_id}" style="left: {pos_x}px; top: {pos_y}px;">
        <div class="note-content">{escaped_content}</div>
        <button class="delete-button"
                hx-delete="/api/notes/{note_id}"
                hx-target="#note-{note_id}"
                hx-swap="outerHTML"
                hx-confirm="本当に削除しますか？">
            X
        </button>
    </div>
    """
# --- End HTML Helper ---


# Serve the static index.html at the root URL
@app.route('/')
def index():
    # Use send_from_directory, specifying the TEMPLATE_FOLDER
    # Note: Usually static files are in 'static', but index.html is conceptually a template here
    try:
        # Use the imported send_from_directory function
        return send_from_directory(app.template_folder, 'index.html')
    except FileNotFoundError:
        return "Error: index.html not found.", 404


# API endpoint to get notes as HTML fragments
@app.route('/api/notes')
def get_notes():
    db = get_db()
    notes = db.execute('SELECT id, content, pos_x, pos_y FROM notes ORDER BY id').fetchall()
    
    # Generate HTML fragments using the helper function
    html_fragments = "".join(_generate_note_html(note) for note in notes)

    # Return the concatenated HTML fragments
    response = make_response(html_fragments)
    # Optional: Set content type if needed, though Flask might handle it
    # response.headers['Content-Type'] = 'text/html; charset=utf-8' 
    return response


# API endpoint to add a new note
@app.route('/api/notes', methods=['POST'])
def add_note():
    content = request.form.get('content')
    if not content:
        return jsonify({"error": "Content is required"}), 400 # Return JSON error

    db = get_db()
    try:
        # Insert new note with default position (e.g., 10, 10)
        # Using RETURNING id to get the new note's ID efficiently (SQLite 3.35+)
        # If using older SQLite, you might need cursor.lastrowid after INSERT
        cursor = db.execute(
            'INSERT INTO notes (content, pos_x, pos_y) VALUES (?, ?, ?) RETURNING id',
            (content, 10, 10) # Default position for new notes
        )
        new_note_id = cursor.fetchone()['id']
        db.commit()
        
        # Fetch the newly created note to generate its HTML
        new_note = db.execute(
            'SELECT id, content, pos_x, pos_y FROM notes WHERE id = ?', (new_note_id,)
        ).fetchone()

        if new_note:
            # Use the helper function to generate HTML for the new note
            new_note_html = _generate_note_html(new_note)
            response = make_response(new_note_html)
            return response
        else:
             # Should not happen if insert was successful, but handle just in case
             return jsonify({"error": "Failed to retrieve newly created note"}), 500

    except sqlite3.Error as e:
        db.rollback() # Rollback in case of error
        print(f"Database error: {e}") # Log the error server-side
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
         # Catch other potential errors
         print(f"An error occurred: {e}")
         return jsonify({"error": "An internal server error occurred"}), 500


# API endpoint to update note position
@app.route('/api/notes/<int:note_id>/position', methods=['PUT'])
def update_note_position(note_id):
    db = get_db()
    pos_x = request.form.get('pos_x', type=int) # Get pos_x as integer
    pos_y = request.form.get('pos_y', type=int) # Get pos_y as integer

    if pos_x is None or pos_y is None:
        return jsonify({"error": "pos_x and pos_y are required"}), 400

    try:
        # Check if the note exists first (optional but good practice)
        note = db.execute('SELECT id FROM notes WHERE id = ?', (note_id,)).fetchone()
        if note is None:
            return jsonify({"error": "Note not found"}), 404

        # Update the position
        db.execute(
            'UPDATE notes SET pos_x = ?, pos_y = ? WHERE id = ?',
            (pos_x, pos_y, note_id)
        )
        db.commit()
        # Return success - 204 No Content is suitable for successful updates with no body
        return '', 204

    except sqlite3.Error as e:
        db.rollback()
        print(f"Database error updating position for note {note_id}: {e}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        print(f"An error occurred updating position for note {note_id}: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500


# API endpoint to update note content
@app.route('/api/notes/<int:note_id>', methods=['PUT'])
def update_note_content(note_id):
    db = get_db()
    new_content = request.form.get('content')

    if new_content is None: # Check if content is provided
        return jsonify({"error": "Content is required"}), 400
    if not new_content.strip(): # Check if content is not just whitespace
        # Decide if empty notes are allowed. If not, return error.
        # If allowed, proceed with the update. For now, let's require non-empty.
        return jsonify({"error": "Content cannot be empty"}), 400

    try:
        # Check if the note exists
        note = db.execute('SELECT id, pos_x, pos_y FROM notes WHERE id = ?', (note_id,)).fetchone()
        if note is None:
            return jsonify({"error": "Note not found"}), 404

        # Update the content
        db.execute(
            'UPDATE notes SET content = ? WHERE id = ?',
            (new_content, note_id)
        )
        db.commit()

        # Return the updated note's HTML fragment
        # Fetch the full updated note row for the helper function
        updated_note_row = db.execute(
            'SELECT id, content, pos_x, pos_y FROM notes WHERE id = ?', (note_id,)
        ).fetchone()

        if updated_note_row:
             # Use the helper function with the fetched Row object
            updated_note_html = _generate_note_html(updated_note_row)
            response = make_response(updated_note_html)
            return response
        else:
            # Should ideally not happen after successful update
            return jsonify({"error": "Failed to retrieve updated note data"}), 500

    except sqlite3.Error as e:
        db.rollback()
        print(f"Database error updating content for note {note_id}: {e}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        print(f"An error occurred updating content for note {note_id}: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500


# API endpoint to delete a note
@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    db = get_db()
    try:
        # Check if the note exists first (optional but good practice)
        note = db.execute('SELECT id FROM notes WHERE id = ?', (note_id,)).fetchone()
        if note is None:
            # If htmx expects an empty response on success, maybe return 404 differently
            # For now, standard 404
            return jsonify({"error": "Note not found"}), 404

        # Delete the note
        db.execute('DELETE FROM notes WHERE id = ?', (note_id,))
        db.commit()

        # Return an empty response with 200 OK, htmx will remove the element
        return '', 200 # Or 204 No Content, but 200 is often fine for DELETE with htmx swap

    except sqlite3.Error as e:
        db.rollback()
        print(f"Database error deleting note {note_id}: {e}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        print(f"An error occurred deleting note {note_id}: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500


if __name__ == '__main__':
    # Use Flask's run command via `flask run` for development
    # This block is less common now but kept for potential direct execution testing
     # Ensure instance folder exists on direct run too
    instance_path = os.path.join(app.root_path, 'instance')
    if not os.path.exists(instance_path):
        os.makedirs(instance_path)
        print(f"Created instance folder at {instance_path}")
    # Check if DB exists, if not, initialize it (useful for first direct run)
    db_path = os.path.join(instance_path, os.path.basename(DATABASE))
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}, initializing...")
        init_db()
        
    app.run(debug=True, host='0.0.0.0', port=5001)
