import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from './Config/firebaseconfig';

const Notebook = ({ user }) => {
    const [notebooks, setNotebooks] = useState([]);
    const [selectedNotebook, setSelectedNotebook] = useState(null);
    const [notes, setNotes] = useState([]);
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [newNoteContent, setNewNoteContent] = useState('');
    const [newNotebookName, setNewNotebookName] = useState('');
    const createNotebook = async () => {
        if (newNotebookName) {
            try {
                await addDoc(collection(db, 'notebooks'), { name: newNotebookName });
                setNewNotebookName(''); // Clear the input field after creating the notebook
                fetchNotebooks(); // Refresh the list of notebooks
            } catch (error) {
                console.error('Error creating notebook:', error);
            }
        } else {
            alert('Please enter a notebook name.');
        }
    };


    const fetchNotebooks = async () => {
        try {
            const notebooksQuery = query(collection(db, 'notebooks'));
            const querySnapshot = await getDocs(notebooksQuery);
            const notebookData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setNotebooks(notebookData);
        } catch (error) {
            console.error('Error fetching notebooks:', error);
        }
    };

    const selectNotebook = async (notebookName) => {
        setSelectedNotebook(notebookName);

        const notebookRef = doc(db, 'notebooks', notebookName);

        const notesRef = collection(notebookRef, 'notes');

        const notesQuery = query(notesRef);
        const notesSnapshot = await getDocs(notesQuery);
        const notesData = notesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setNotes(notesData);
    };


    const createNote = async () => {
        if (selectedNotebook && newNoteTitle && newNoteContent) {
            try {
                const notebookRef = doc(db, 'notebooks', selectedNotebook);

                const notesRef = collection(notebookRef, 'notes');

                await addDoc(notesRef, { title: newNoteTitle, content: newNoteContent, createdBy: user.displayName }); // Include createdBy field
                setNewNoteTitle('');
                setNewNoteContent('');
                fetchNotes(selectedNotebook); // Refresh the notes
            } catch (error) {
                console.error('Error creating note:', error);
            }
        } else {
            alert('Please fill in both note title and content.');
        }
    };

    const deleteNote = async (noteId) => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            try {
                const notebookRef = doc(db, 'notebooks', selectedNotebook);
                const notesRef = collection(notebookRef, 'notes');
                await deleteDoc(doc(notesRef, noteId));
                fetchNotes(selectedNotebook); // Refresh the notes
            } catch (error) {
                console.error('Error deleting note:', error);
            }
        }
    };

    const fetchNotes = async (notebookName) => {
        const notebookRef = doc(db, 'notebooks', notebookName);
        const notesRef = collection(notebookRef, 'notes');
        const notesQuery = query(notesRef);
        const notesSnapshot = await getDocs(notesQuery);
        const notesData = notesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setNotes(notesData);
    };

    useEffect(() => {
        fetchNotebooks();
    }, []);

    return (
        <div className="flex">
            <div className="w-5/12 p-4 border-r">
                <h1 className="text-xl font-semibold mb-4">Notebooks</h1>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="New Note"
                        value={newNotebookName}
                        onChange={(e) => setNewNotebookName(e.target.value)}
                        className="w-full border-b border-gray-300 pb-2 focus:outline-none"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                createNotebook();
                            }
                        }}
                    />
                    <button
                        onClick={createNotebook}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded"
                    >
                        New Note
                    </button>
                </div>
                <ul>
                    {notebooks.map((notebook) => (
                        <li
                            key={notebook.id}
                            onClick={() => selectNotebook(notebook.name)}
                            className={`cursor-pointer hover:bg-gray-200 p-2 rounded ${selectedNotebook === notebook.name ? 'bg-gray-200' : ''
                                }`}
                        >
                            {notebook.name}
                        </li>
                    ))}
                </ul>
            </div>

            {selectedNotebook && (
                <div className="w-3/4 p-4 " style={{ overflowY: 'auto', maxHeight: '300px' }}>
                    <h2 className="text-lg font-semibold mb-2 ml-4"> Notebook: {selectedNotebook}</h2>
                    <div className="space-y-4">
                        <div className="bg-white p-4 border rounded-lg">
                            <input
                                type="text"
                                placeholder="Note Title"
                                value={newNoteTitle}
                                onChange={(e) => setNewNoteTitle(e.target.value)}
                                className="w-full border-b border-gray-300 pb-2 focus:outline-none"
                            />
                            <textarea
                                placeholder="Note Content"
                                value={newNoteContent}
                                onChange={(e) => setNewNoteContent(e.target.value)}
                                className="w-full h-40 border border-gray-300 rounded p-2 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <button
                            onClick={createNote}
                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                        >
                            Add note
                        </button>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-xl font-semibold mb-2">Notes</h3>
                        <ul className="space-y-4">
                            {notes.map((note) => (
                                <li key={note.id} className="border border-gray-300 rounded p-4">
                                    <div className="flex justify-between">
                                        <h4 className="text-lg font-semibold">{note.title}</h4>
                                        {user.displayName === note.createdBy && (
                                            <button
                                                onClick={() => deleteNote(note.id)}
                                                className="text-red-600"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-gray-600">Created by: {note.createdBy}</p>
                                    <p className="text-gray-600">{note.content}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notebook;
