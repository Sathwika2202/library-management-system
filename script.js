
"use strict";

// ==========================================
// 1. SINGLETON PATTERN - LIBRARY MANAGEMENT
// ==========================================

class Library {
    constructor(secret) {
        if (secret !== Library.secret) {
            throw new Error("Use Library.getInstance()");
        }

        this.books = [];
    }

    static secret = Symbol("Library");

    static getInstance() {
        if (!Library.instance) {
            Library.instance = new Library(Library.secret);
        }
        return Library.instance;
    }

    addBook(book) {
        if (this.books.some(b => b.id === book.id)) {
            return false;
        }

        this.books.push(book);
        return true;
    }

    removeBook(id) {
        const index = this.books.findIndex(b => b.id === id);

        if (index === -1) return false;

        this.books.splice(index, 1);
        return true;
    }

    searchBook(query) {
        const value = String(query).trim().toLowerCase();

        return this.books.filter(book =>
            String(book.id) === value ||
            book.title.toLowerCase().includes(value) ||
            book.author.toLowerCase().includes(value)
        );
    }

    getBooks() {
        return [...this.books];
    }
}

// One shared library object
const library = Library.getInstance();


// ==========================================
// 2. ADAPTER PATTERN - BOOK DATA CONVERSION
// ==========================================

// Old system uses bookCode, bookName and writer.
class LegacyBook {
    constructor(bookCode, bookName, writer) {
        this.bookCode = bookCode;
        this.bookName = bookName;
        this.writer = writer;
    }
}

// Adapter converts old data into the new format.
class BookAdapter {
    constructor(legacyBook) {
        this.legacyBook = legacyBook;
    }

    getBook() {
        return {
            id: Number(this.legacyBook.bookCode),
            title: this.legacyBook.bookName,
            author: this.legacyBook.writer
        };
    }
}

// Load sample legacy books through the adapter.
const legacyBooks = [
    new LegacyBook(101, "Java Programming", "James Gosling"),
    new LegacyBook(102, "Python Basics", "Guido van Rossum")
];

legacyBooks.forEach(oldBook => {
    const adapter = new BookAdapter(oldBook);
    library.addBook(adapter.getBook());
});


// ==========================================
// 3. COMMAND PATTERN - LIBRARY OPERATIONS
// ==========================================

class AddBookCommand {
    constructor(library, book) {
        this.library = library;
        this.book = book;
    }

    execute() {
        return this.library.addBook(this.book);
    }
}

class RemoveBookCommand {
    constructor(library, id) {
        this.library = library;
        this.id = id;
    }

    execute() {
        return this.library.removeBook(this.id);
    }
}

class SearchBookCommand {
    constructor(library, query) {
        this.library = library;
        this.query = query;
    }

    execute() {
        return this.library.searchBook(this.query);
    }
}

// Invoker executes commands without needing to know
// how the library performs each operation.
class LibraryInvoker {
    execute(command) {
        return command.execute();
    }
}

const invoker = new LibraryInvoker();


// ==========================================
// HELPER FUNCTIONS
// ==========================================

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function showMessage(elementId, message) {
    document.getElementById(elementId).textContent = message;
}

function showSection(sectionId) {
    document.getElementById("library").classList.toggle(
        "hidden", sectionId !== "library"
    );

    document.getElementById("rental").classList.toggle(
        "hidden", sectionId !== "rental"
    );
}

function getBookInput() {
    const idText = document.getElementById("bookId").value.trim();
    const title = document.getElementById("bookTitle").value.trim();
    const author = document.getElementById("bookAuthor").value.trim();
    const id = Number(idText);

    if (!idText || !Number.isSafeInteger(id) || id <= 0 ||
        !title || !author) {
        showMessage(
            "libraryMessage",
            "Enter a valid positive book ID, title and author."
        );
        return null;
    }

    return { id, title, author };
}


// ==========================================
// LIBRARY UI OPERATIONS
// ==========================================

function addBook() {
    const book = getBookInput();
    if (!book) return;

    const command = new AddBookCommand(library, book);
    const success = invoker.execute(command);

    if (success) {
        showMessage("libraryMessage", "Book added successfully!");
        document.getElementById("bookId").value = "";
        document.getElementById("bookTitle").value = "";
        document.getElementById("bookAuthor").value = "";
        displayBooks();
    } else {
        showMessage("libraryMessage", "Book ID already exists.");
    }
}

function removeBook() {
    const idText = document.getElementById("bookId").value.trim();
    const id = Number(idText);

    if (!idText || !Number.isSafeInteger(id) || id <= 0) {
        showMessage("libraryMessage", "Enter a valid Book ID to remove.");
        return;
    }

    const command = new RemoveBookCommand(library, id);
    const success = invoker.execute(command);

    showMessage(
        "libraryMessage",
        success ? "Book removed successfully!" : "Book ID not found."
    );

    displayBooks();
}

function searchBook() {
    const idText = document.getElementById("bookId").value.trim();
    const title = document.getElementById("bookTitle").value.trim();
    const query = idText || title;

    if (!query) {
        showMessage("libraryMessage", "Enter a book ID or title to search.");
        return;
    }

    const command = new SearchBookCommand(library, query);
    const results = invoker.execute(command);

    showMessage(
        "libraryMessage",
        results.length ? `${results.length} matching book(s) found.` :
            "No matching books found."
    );

    renderBooks(results);
}

function displayBooks() {
    renderBooks(library.getBooks());
}

function renderBooks(books) {
    const container = document.getElementById("bookList");

    if (books.length === 0) {
        container.innerHTML = "<p>No books available.</p>";
        return;
    }

    container.innerHTML = books.map(book => `
        <div class="item">
            <h4>${escapeHTML(book.title)}</h4>
            <p><strong>Book ID:</strong> ${escapeHTML(book.id)}</p>
            <p><strong>Author:</strong> ${escapeHTML(book.author)}</p>
        </div>
    `).join("");
}


// ==========================================
// 4. FACTORY METHOD - VEHICLE RENTAL SYSTEM
// ==========================================

// Product classes
class Vehicle {
    constructor(name, dailyRate) {
        this.name = name;
        this.dailyRate = dailyRate;
    }

    calculateCost(days) {
        return this.dailyRate * days;
    }
}

class Car extends Vehicle {
    constructor() {
        super("Car", 2000);
    }
}

class Bike extends Vehicle {
    constructor() {
        super("Bike", 500);
    }
}

class Truck extends Vehicle {
    constructor() {
        super("Truck", 4000);
    }
}

// Creator classes define the vehicle creation method.
class VehicleFactory {
    createVehicle() {
        throw new Error("Subclasses must implement createVehicle()");
    }
}

class CarFactory extends VehicleFactory {
    createVehicle() {
        return new Car();
    }
}

class BikeFactory extends VehicleFactory {
    createVehicle() {
        return new Bike();
    }
}

class TruckFactory extends VehicleFactory {
    createVehicle() {
        return new Truck();
    }
}

const vehicleFactories = {
    car: new CarFactory(),
    bike: new BikeFactory(),
    truck: new TruckFactory()
};

let rentalCount = 0;

function rentVehicle() {
    const type = document.getElementById("vehicleType").value;
    const daysText = document.getElementById("vehicleDays").value;
    const days = Number(daysText);

    if (!daysText || !Number.isSafeInteger(days) || days < 1) {
        showMessage(
            "rentalMessage",
            "Enter a valid rental duration of at least one day."
        );
        return;
    }

    const factory = vehicleFactories[type];

    if (!factory) {
        showMessage("rentalMessage", "Please select a valid vehicle.");
        return;
    }

    // Factory creates the appropriate vehicle.
    const vehicle = factory.createVehicle();
    const cost = vehicle.calculateCost(days);

    rentalCount++;

    const container = document.getElementById("rentalList");
    const item = document.createElement("div");
    item.className = "item";

    item.innerHTML = `
        <h4>${escapeHTML(vehicle.name)} Rental</h4>
        <p><strong>Rental ID:</strong> R${rentalCount}</p>
        <p><strong>Duration:</strong> ${days} day(s)</p>
        <p><strong>Daily Rate:</strong> ₹${vehicle.dailyRate.toLocaleString("en-IN")}</p>
        <p><strong>Total Cost:</strong> ₹${cost.toLocaleString("en-IN")}</p>
    `;

    container.prepend(item);

    showMessage(
        "rentalMessage",
        `${vehicle.name} rental created successfully!`
    );
}


// ==========================================
// INITIAL DISPLAY
// ==========================================

displayBooks();
