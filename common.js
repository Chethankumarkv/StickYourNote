
//------using Same localStorageKey for  delete and Restore --////

class StickyNoteApp {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('stickyNotes')) || [];
        this.deletedNotes = JSON.parse(localStorage.getItem('stickyDeletedNotes')) || []
        this.noteId = this.notes.length > 0 ? this.notes[this.notes.length - 1].id + 1 : 1;

        this.addModal = document.getElementById('addModal');
        this.editModal = document.getElementById('editModal');
        this.stickyNotesContainer = document.getElementById('sticky-notes');
        this.addNoteBtn = document.getElementById('add-note-btn');
        this.addNoteButton = document.getElementById('add-note');
        this.updateNoteButton = document.getElementById('update-note');
        this.searchInput = document.querySelector('.search-bar input');
        this.viewAllNotesBtn = document.querySelector('#view-note');
        this.viewAllStarBtn = document.querySelector('#star-note');
        this.clearAllBtn = document.querySelector('#clear-All');
        this.closeModal = document.querySelector('.close')
        this.closeEditModal = document.querySelector('.closeEdit')
        this.Modal = document.querySelector('.modal')
        this.ModalEdit = document.querySelector('.modalEdit')
        this.deletedButton = document.querySelector('#deleted')
        this.clearRecycleButton = document.querySelector('#recycle')

        this.addNoteBtn.addEventListener('click', () => this.toggleAddModal());
        this.closeModal.addEventListener('click', () => this.toggleModal())
        this.closeEditModal.addEventListener('click', () => this.toggleEditModal())
        this.stickyNotesContainer.addEventListener('click', (event) => this.handleNoteActions(event));
        this.addNoteButton.addEventListener('click', () => this.addStickyNote());
        this.updateNoteButton.addEventListener('click', () => this.updateStickyNote());
        this.searchInput.addEventListener('input', () => this.searchNotes());
        this.viewAllNotesBtn.addEventListener('click', () => this.viewAllNotes());
        this.viewAllStarBtn.addEventListener('click', () => this.viewAllStarNotes());
        this.clearAllBtn.addEventListener('click', () => this.clearData())
        this.deletedButton.addEventListener('click', () => this.viewDeletedData());
        this.clearRecycleButton.addEventListener('click', () => this.clearDeletedData())
        this.loadNotes();

        window.addEventListener('beforeunload', () => this.cleanup());
    }

    clearData() {

        if (confirm("Are you sure?")) {
            this.notes.forEach(note => {
                note.deleted = true;

            });
            this.saveNotes();
            location.reload();
        }
    }
    clearDeletedData() {
        if (confirm("Are you sure?")) {
            this.notes = this.notes.filter(note => note.deleted === false)

            this.saveNotes();
            location.reload()
        }

    }

    toggleEditModal() {

        this.ModalEdit.classList.toggle('hidden')
    }
    toggleModal() {

        this.Modal.classList.toggle('hidden')
    }

    loadNotes() {

        this.notes.forEach(note => {

            this.renderNoteElement(note)

        });

    }

    toggleAddModal() {
        this.addModal.classList.toggle('hidden');
    }

    addStickyNote() {

        const title = document.getElementById('note-title').value.trim();
        const noteText = document.getElementById('note-text').value.trim();

        if (!title || !noteText) {
            alert('Please enter both title and note text to continue.');
            return;
        }

        const newNote = {
            id: this.noteId++,
            title: title,
            note: noteText,
            star: false,
            date: this.formatDate(new Date()),
            deleted: false
        };

        this.notes.push(newNote);
        this.saveNotes();

        this.renderNoteElement(newNote);
        this.addModal.classList.add('hidden');
        this.clearNoteInputFields();
        location.reload()
    }

    updateStickyNote() {
        const editTitle = document.getElementById('edit-note-title').value.trim();
        const editNoteText = document.getElementById('edit-note-text').value.trim();
        const noteId = this.editModal.dataset.noteId;

        const noteToUpdate = this.notes.find(note => note.id == noteId);

        if (!noteToUpdate) {
            console.error(`Note with ID ${noteId} not found.`);
            return;
        }

        noteToUpdate.title = editTitle;
        noteToUpdate.note = editNoteText;

        this.saveNotes();
        this.updateNoteElement(noteToUpdate);
        this.editModal.classList.add('hidden');
    }

    deleteStickyNote(noteId) {

        this.notes.forEach(note => {
            if (note.id == noteId) {
                note.deleted = true;
            }
        })
        this.saveNotes();
        const noteElement = document.getElementById(`note-${noteId}`);
        if (noteElement) {

            noteElement.remove();

        } else {
            console.error(`Note element not found for ID ${noteId}`);
        }
    }
    addToStar(noteId) {


        const noteToUpdate = this.notes.find(note => note.id == noteId);

        if (!noteToUpdate) {
            console.error(`Note with ID ${noteId} not found.`);
            return;
        }
        if (noteToUpdate.star) {
            noteToUpdate.star = false
            alert("Note Removed from Star")
            this.addBackground(noteId, noteToUpdate.star)

        }
        else {
            noteToUpdate.star = true
            alert("Note Added to Star")
            this.addBackground(noteId, noteToUpdate.star)


        }
        this.saveNotes(noteToUpdate);

    }
    addBackground(noteId, val = true) {

        this.container = document.querySelectorAll(".sticky")
        this.container.forEach(function (note) {
            if (noteId === note.dataset.noteId) {
                note.classList.toggle('starred', val)
            }
        })
    }

    handleNoteActions(event) {

        const target = event.target;
        if (target.classList.contains('edit-button')) {
            const noteId = target.closest('.sticky').dataset.noteId;
            this.openEditModal(noteId);
        } else if (target.classList.contains('delete-button')) {
            const noteId = target.closest('.sticky').dataset.noteId;
            if (confirm("Are you Sure!!!")) {
                this.deleteStickyNote(noteId);
            }
        }
        else if (target.classList.contains('star')) {
            const noteId = target.closest('.sticky').dataset.noteId;
            this.addToStar(noteId)
        }
        else if (target.classList.contains('restore')) {
            const noteId = target.closest('.sticky').dataset.noteId;

            this.restoreData(noteId)
        }
    }

    openEditModal(noteId) {
        const noteToUpdate = this.notes.find(note => note.id == noteId);

        if (!noteToUpdate) {
            console.error(`Note with ID ${noteId} not found.`);
            return;
        }

        document.getElementById('edit-note-title').value = noteToUpdate.title;
        document.getElementById('edit-note-text').value = noteToUpdate.note;
        this.editModal.dataset.noteId = noteId;
        this.editModal.classList.remove('hidden');
    }

    saveNotes() {
        localStorage.setItem('stickyNotes', JSON.stringify(this.notes));
    }

    viewAllNotes() {
        if (this.notes.length >= 1) {
            this.searchInput.value = '';
            this.clearStickyNotesContainer()
            this.notes.forEach(note => this.renderNoteElement(note));
        } else {
            alert("NO Notes Are Added!!!😒😒😒")
        }
    }
    viewAllStarNotes() {
        this.container = document.querySelectorAll(".sticky")
        const StarNotes = this.notes.filter(note => note.star === true)
        if (StarNotes.length >= 1) {
            this.clearStickyNotesContainer()
            StarNotes.forEach(note => this.renderNoteElement(note));
        }
        else {
            alert("NO Notes Are Starred!!!😒😒😒")
        }
    }
    viewDeletedData() {
        this.clearStickyNotesContainer()
        this.notes.forEach(note => {
            if (note.deleted) {
                this.renderDeletedNote(note)
            }
        })
    }

    renderNoteElement(note) {
        if (!note.deleted) {
            const stickyNoteHTML = `
            <div class="sticky ${note.star ? "starred" : ''}"  id="note-${note.id}" data-note-id="${note.id}">
                <div class="content">
                <h3 class="sticky-title">Title: ${note.title}</h3>
                <p>Note: ${note.note}</p>
               
                </div>
                 <div class="date">
                   <span>${note.date}</span>
                </div>
                  <div class="star-icon">
                  
                        <img id="star" class="star" src="/Images/starLogo.png" alt="Star Icon">
                   </div>
                <div class="sticky-buttons">
                
                    <button class="edit-button">Edit</button>
                    <button class="delete-button">Delete</button>
                  
                </div>
            </div>
        `;
            this.stickyNotesContainer.insertAdjacentHTML('beforeend', stickyNoteHTML);
        }
    }

    renderDeletedNote(note) {

        const stickyNoteHTML = `
            <div class="sticky"  id="note-${note.id}" data-note-id="${note.id}">
                <div class="content">
                <h3 class="sticky-title">Title: ${note.title}</h3>
                <p>Note: ${note.note}</p>
               
                </div>
                 <div class="date">
                   <span>${note.date}</span>
                </div>
                  
                <div class="sticky-buttons">
                
                    <button class="restore">Restore</button>
                    
                  
                </div>
                  
                
            </div>
        `;
        this.stickyNotesContainer.insertAdjacentHTML('beforeend', stickyNoteHTML);
    }

    updateNoteElement(note) {
        const noteElement = document.getElementById(`note-${note.id}`);
        if (noteElement) {
            noteElement.querySelector('.sticky-title').textContent = `Title: ${note.title}`;
            noteElement.querySelector('p').textContent = `Note: ${note.note}`;

            noteElement.classList.toggle('starred', note.star);
        } else {
            console.error(`Note element not found for ID ${note.id}`);
        }
    }
    searchNotes() {
        const searchQuery = this.searchInput.value.trim().toLowerCase();
        const filteredNotes = this.notes.filter(note =>
            note.title.toLowerCase().includes(searchQuery) ||
            note.note.toLowerCase().includes(searchQuery)
        );
        this.clearStickyNotesContainer();
        filteredNotes.forEach(note => this.renderNoteElement(note));
    }
    clearStickyNotesContainer() {
        this.stickyNotesContainer.innerHTML = '';
    }

    clearNoteInputFields() {
        document.getElementById('note-title').value = '';
        document.getElementById('note-text').value = '';
    }
    formatDate(date) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(date);
        return formattedDate;
    }
    restoreData(noteId) {
        this.notes.forEach(data => {
            if (data.id == noteId) {
                data.deleted = false;
            }
        })
        this.saveNotes();
        this.viewDeletedData()

    }
    cleanup() {

        this.addNoteBtn.removeEventListener('click', this.toggleAddModal);
        this.closeModal.removeEventListener('click', this.toggleModal);
        this.closeEditModal.removeEventListener('click', this.toggleEditModal);
        this.stickyNotesContainer.removeEventListener('click', this.handleNoteActions);
        this.addNoteButton.removeEventListener('click', this.addStickyNote);
        this.updateNoteButton.removeEventListener('click', this.updateStickyNote);
        this.searchInput.removeEventListener('input', this.searchNotes);
        this.viewAllNotesBtn.removeEventListener('click', this.viewAllNotes);
        this.viewAllStarBtn.removeEventListener('click', this.viewAllStarNotes);
        this.clearAllBtn.removeEventListener('click', this.clearData);
        this.deletedButton.removeEventListener('click', this.viewDeletedData);
        this.clearRecycleButton.removeEventListener('click', this.clearDeletedData);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    new StickyNoteApp();
});





//------using different localStorageKey  and differnt array for  delete and Restore --////


// class StickyNoteApp {
//     constructor() {
//         this.notes = JSON.parse(localStorage.getItem('stickyNotes')) || [];
//         this.deletedNotes = JSON.parse(localStorage.getItem('stickyDeletedNotes')) || []
//         this.noteId = this.notes.length > 0 ? this.notes[this.notes.length - 1].id + 1 : 1;

//         this.addModal = document.getElementById('addModal');
//         this.editModal = document.getElementById('editModal');
//         this.stickyNotesContainer = document.getElementById('sticky-notes');
//         this.addNoteBtn = document.getElementById('add-note-btn');
//         this.addNoteButton = document.getElementById('add-note');
//         this.updateNoteButton = document.getElementById('update-note');
//         this.searchInput = document.querySelector('.search-bar input');
//         this.viewAllNotesBtn = document.querySelector('#view-note');
//         this.viewAllStarBtn = document.querySelector('#star-note');
//         this.clearAllBtn = document.querySelector('#clear-All');
//         this.closeModal = document.querySelector('.close')
//         this.closeEditModal = document.querySelector('.closeEdit')
//         this.Modal = document.querySelector('.modal')
//         this.ModalEdit = document.querySelector('.modalEdit')
//         this.deletedButton = document.querySelector('#deleted')
//         this.clearRecycleButton = document.querySelector('#recycle')

//         this.addNoteBtn.addEventListener('click', () => this.toggleAddModal());
//         this.closeModal.addEventListener('click', () => this.toggleModal())
//         this.closeEditModal.addEventListener('click', () => this.toggleEditModal())
//         this.stickyNotesContainer.addEventListener('click', (event) => this.handleNoteActions(event));
//         this.addNoteButton.addEventListener('click', () => this.addStickyNote());
//         this.updateNoteButton.addEventListener('click', () => this.updateStickyNote());
//         this.searchInput.addEventListener('input', () => this.searchNotes());
//         this.viewAllNotesBtn.addEventListener('click', () => this.viewAllNotes());
//         this.viewAllStarBtn.addEventListener('click', () => this.viewAllStarNotes());
//         this.clearAllBtn.addEventListener('click', () => this.clearData())
//         this.deletedButton.addEventListener('click', () => this.viewDeletedData());
//         this.clearRecycleButton.addEventListener('click', () => this.clearDeletedData())
//         this.loadNotes();
//     }
//     clearData() {

//         if (confirm("Are you sure?")) {

//             this.notes.forEach(note => {
//                 this.deletedNotes.push(note);
//                 console.log(this.deletedNotes);
//             });

//             this.saveDeletedNotes();
//             localStorage.removeItem('stickyNotes');


//             location.reload();
//         }
//     }
//     clearDeletedData() {
//         if (confirm("Are you sure?")) {
//             localStorage.removeItem('stickyDeletedNotes');
//             location.reload();
//         }

//     }

//     toggleEditModal() {

//         this.ModalEdit.classList.toggle('hidden')
//     }
//     toggleModal() {

//         this.Modal.classList.toggle('hidden')
//     }

//     loadNotes() {

//         this.notes.forEach(note => this.renderNoteElement(note));

//     }

//     toggleAddModal() {
//         this.addModal.classList.toggle('hidden');
//     }

//     addStickyNote() {

//         const title = document.getElementById('note-title').value.trim();
//         const noteText = document.getElementById('note-text').value.trim();

//         if (!title || !noteText) {
//             alert('Please enter both title and note text to continue.');
//             return;
//         }

//         const newNote = {
//             id: this.noteId++,
//             title: title,
//             note: noteText,
//             star: false,
//             date: this.formatDate(new Date())
//         };

//         this.notes.push(newNote);
//         this.saveNotes();

//         this.renderNoteElement(newNote);
//         this.addModal.classList.add('hidden');
//         this.clearNoteInputFields();
//         location.reload()
//     }

//     updateStickyNote() {
//         const editTitle = document.getElementById('edit-note-title').value.trim();
//         const editNoteText = document.getElementById('edit-note-text').value.trim();
//         const noteId = this.editModal.dataset.noteId;

//         const noteToUpdate = this.notes.find(note => note.id == noteId);

//         if (!noteToUpdate) {
//             console.error(`Note with ID ${noteId} not found.`);
//             return;
//         }

//         noteToUpdate.title = editTitle;
//         noteToUpdate.note = editNoteText;

//         this.saveNotes();
//         this.updateNoteElement(noteToUpdate);
//         this.editModal.classList.add('hidden');
//     }

//     deleteStickyNote(noteId) {
//         const deleted = this.notes.find(note => note.id == noteId)

//         this.deletedNotes.push(deleted)
//         this.saveDeletedNotes()
//         this.notes = this.notes.filter(note => note.id != noteId);
//         this.saveNotes();
//         const noteElement = document.getElementById(`note-${noteId}`);
//         if (noteElement) {

//             noteElement.remove();

//         } else {
//             console.error(`Note element not found for ID ${noteId}`);
//         }
//     }
//     addToStar(noteId) {


//         const noteToUpdate = this.notes.find(note => note.id == noteId);

//         if (!noteToUpdate) {
//             console.error(`Note with ID ${noteId} not found.`);
//             return;
//         }
//         if (noteToUpdate.star) {
//             noteToUpdate.star = false
//             alert("Note Removed from Star")
//             this.addBackground(noteId, noteToUpdate.star)

//         }
//         else {
//             noteToUpdate.star = true
//             alert("Note Added to Star")
//             this.addBackground(noteId, noteToUpdate.star)


//         }
//         this.saveNotes(noteToUpdate);

//     }
//     addBackground(noteId, val = true) {

//         this.container = document.querySelectorAll(".sticky")
//         this.container.forEach(function (note) {
//             if (noteId === note.dataset.noteId) {
//                 note.classList.toggle('starred', val)
//             }
//         })
//     }

//     handleNoteActions(event) {

//         const target = event.target;
//         if (target.classList.contains('edit-button')) {
//             const noteId = target.closest('.sticky').dataset.noteId;
//             this.openEditModal(noteId);
//         } else if (target.classList.contains('delete-button')) {
//             const noteId = target.closest('.sticky').dataset.noteId;
//             if (confirm("Are you Sure!!!")) {
//                 this.deleteStickyNote(noteId);
//             }
//         }
//         else if (target.classList.contains('star')) {
//             const noteId = target.closest('.sticky').dataset.noteId;
//             this.addToStar(noteId)
//         }
//         else if (target.classList.contains('restore')) {
//             const noteId = target.closest('.sticky').dataset.noteId;

//             this.restoreData(noteId)
//         }
//     }

//     openEditModal(noteId) {
//         const noteToUpdate = this.notes.find(note => note.id == noteId);

//         if (!noteToUpdate) {
//             console.error(`Note with ID ${noteId} not found.`);
//             return;
//         }

//         document.getElementById('edit-note-title').value = noteToUpdate.title;
//         document.getElementById('edit-note-text').value = noteToUpdate.note;
//         this.editModal.dataset.noteId = noteId;
//         this.editModal.classList.remove('hidden');
//     }

//     saveNotes() {
//         localStorage.setItem('stickyNotes', JSON.stringify(this.notes));
//     }
//     saveDeletedNotes() {
//         localStorage.setItem('stickyDeletedNotes', JSON.stringify(this.deletedNotes));
//     }
//     viewAllNotes() {
//         if (this.notes.length >= 1) {
//             this.searchInput.value = '';
//             this.clearStickyNotesContainer()
//             this.notes.forEach(note => this.renderNoteElement(note));
//         } else {
//             alert("NO Notes Are Added!!!😒😒😒")
//         }

//     }
//     viewAllStarNotes() {
//         this.container = document.querySelectorAll(".sticky")
//         const StarNotes = this.notes.filter(note => note.star === true)
//         if (StarNotes.length >= 1) {
//             this.clearStickyNotesContainer()
//             StarNotes.forEach(note => this.renderNoteElement(note));
//         }
//         else {
//             alert("NO Notes Are Starred!!!😒😒😒")
//         }


//     }
//     viewDeletedData() {
//         this.clearStickyNotesContainer()
//         this.deletedNotes.forEach(note => this.renderDeletedNote(note))
//     }

//     renderNoteElement(note) {

//         const stickyNoteHTML = `
//             <div class="sticky ${note.star ? "starred" : ''}"  id="note-${note.id}" data-note-id="${note.id}">
//                 <div class="content">
//                 <h3 class="sticky-title">Title: ${note.title}</h3>
//                 <p>Note: ${note.note}</p>

//                 </div>
//                  <div class="date">
//                    <span>${note.date}</span>
//                 </div>
//                   <div class="star-icon">

//                         <img id="star" class="star" src="/Images/starLogo.png" alt="Star Icon">
//                    </div>
//                 <div class="sticky-buttons">

//                     <button class="edit-button">Edit</button>
//                     <button class="delete-button">Delete</button>

//                 </div>
//             </div>
//         `;
//         this.stickyNotesContainer.insertAdjacentHTML('beforeend', stickyNoteHTML);
//     }

//     renderDeletedNote(note) {

//         const stickyNoteHTML = `
//             <div class="sticky"  id="note-${note.id}" data-note-id="${note.id}">
//                 <div class="content">
//                 <h3 class="sticky-title">Title: ${note.title}</h3>
//                 <p>Note: ${note.note}</p>

//                 </div>
//                  <div class="date">
//                    <span>${note.date}</span>
//                 </div>

//                 <div class="sticky-buttons">

//                     <button class="restore">Restore</button>


//                 </div>


//             </div>
//         `;
//         this.stickyNotesContainer.insertAdjacentHTML('beforeend', stickyNoteHTML);
//     }

//     updateNoteElement(note) {
//         const noteElement = document.getElementById(`note-${note.id}`);
//         if (noteElement) {
//             noteElement.querySelector('.sticky-title').textContent = `Title: ${note.title}`;
//             noteElement.querySelector('p').textContent = `Note: ${note.note}`;

//             noteElement.classList.toggle('starred', note.star);
//         } else {
//             console.error(`Note element not found for ID ${note.id}`);
//         }
//     }
//     searchNotes() {
//         const searchQuery = this.searchInput.value.trim().toLowerCase();
//         const filteredNotes = this.notes.filter(note =>
//             note.title.toLowerCase().includes(searchQuery) ||
//             note.note.toLowerCase().includes(searchQuery)
//         );
//         this.clearStickyNotesContainer();
//         filteredNotes.forEach(note => this.renderNoteElement(note));
//     }
//     clearStickyNotesContainer() {
//         this.stickyNotesContainer.innerHTML = '';
//     }

//     clearNoteInputFields() {
//         document.getElementById('note-title').value = '';
//         document.getElementById('note-text').value = '';
//     }
//     formatDate(date) {
//         const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
//         const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(date);
//         return formattedDate;
//     }
//     restoreData(noteId) {
//         const data = JSON.parse(localStorage.getItem('stickyDeletedNotes'))
//         let cur = (this.notes.length - 1) + 100

//         const item = data.find(item => item.id == noteId)
//         this.deletedNotes = this.deletedNotes.filter(i => i.id != noteId)
//         const newObj = {
//             id: cur++,
//             title: item.title,
//             note: item.note,
//             star: item.star,
//             date: item.date
//         }
//         this.notes.push(newObj)


//         this.saveNotes();
//         this.saveDeletedNotes();
//         this.viewDeletedData()

//     }



// }


// document.addEventListener('DOMContentLoaded', () => {
//     new StickyNoteApp();
// });


