function sortByAuthor(toSort=Storage.getBooks()){
    return toSort.sort((a, b)=>(a.author > b.author) ? 1 : ((b.author > a.author) ? -1 : 0))
}
function sortByTitle(toSort=Storage.getBooks()){
    return toSort.sort((a, b)=>(a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0))
}
const helpFilter = (elem, searched, byWhat)=>{
    if(byWhat === "isbn") elem.isbn = elem.isbn.toString();
    return elem[byWhat].toLowerCase().includes(searched)
}

class Book {
    constructor(title, author, isbn){
        this.title = title;
        this.author = author;
        this.isbn = isbn;
    }
}

class UI {
    static displayBooks(){
        const books = sortByTitle();
        books.forEach(book=>UI.addBookToList(book));
    }
    static addBookToList(book){
        const list = document.querySelector("#book-list");
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.isbn}</td>
            <td align="right"><a href="#" class="btn btn-danger btn-sm delete btn-danger">X</a></td>
        `;

        row.querySelector(".delete").addEventListener("click", (e)=>{
            UI.deleteBook(e.target);
            Storage.removeBook(1*e.target.parentElement.previousElementSibling.textContent);
            UI.showAlert("Book has been removed from the list.", "info", 2000)
        })

        list.appendChild(row);
    }

    static clearFields(){
        document.querySelector("#title").value = "";
        document.querySelector("#author").value ="";
        document.querySelector("#isbn").value = "";
    }

    static deleteBook(elem){
        if(elem.classList.contains("delete")){
            elem.parentElement.parentElement.remove();
        }
    }

    static showAlert(message, className, time){
        const div = document.createElement("div");
        div.className = `alert alert-${className}`;
        div.appendChild(document.createTextNode(message));
        const container = document.querySelector(".container");
        const form = document.querySelector("#book-form");
        container.insertBefore(div, form);

        setTimeout(()=>{
            document.querySelector(".alert").remove();
        },time)
    }
    static searchBook(){
        const all = document.querySelector("#all-check").checked
        const title = document.querySelector("#title-check").checked
        const author = document.querySelector("#author-check").checked
        const isbn = document.querySelector("#isbn-check").checked
        const searchedText = document.querySelector("#search-input").value.toLowerCase();
        
        const bookList = document.querySelector("#book-list");
        bookList.innerHTML = "";
        
        //its terrible, need a better way
        if(all) {
            sortByTitle().filter((book)=>{
                if(helpFilter(book, searchedText, "title")||helpFilter(book, searchedText, "author")||helpFilter(book, searchedText, "isbn")) {
                    return UI.addBookToList(book)
                }
            })
        } else if (title&&author) {
            sortByAuthor().filter((book)=>{
                if(helpFilter(book, searchedText, "title")||helpFilter(book, searchedText, "author")) {
                    return UI.addBookToList(book)
                }
            })
        } else if(title&&isbn) {
            sortByTitle().filter((book)=>{
                if(helpFilter(book, searchedText, "title")||helpFilter(book, searchedText, "isbn")) {
                    return UI.addBookToList(book)
                }
            })
        } else if(author&&isbn){
            sortByAuthor().filter((book)=>{
                if(helpFilter(book, searchedText, "author")||helpFilter(book, searchedText, "isbn")) {
                    return UI.addBookToList(book)
                }
            })
        } else if(title){
            sortByTitle().filter((book)=>{
                if(helpFilter(book, searchedText, "title")) {
                    return UI.addBookToList(book)
                }
            })
        } else if(author){
            sortByAuthor().filter((book)=>{
                if(helpFilter(book, searchedText, "author")) {
                    return UI.addBookToList(book)
                } 
            })
        } else if(isbn) {
            sortByAuthor().filter((book)=>{
                if(helpFilter(book, searchedText, "isbn")) 
                {
                    UI.addBookToList(book)
                }
            })
        }
    }
}

class Storage{
    static getBooks(){
        let books
        if(localStorage.getItem("books")===null){
            books = [];
        } else {
            books = JSON.parse(localStorage.getItem("books"));
        }

        return books;
    }
    static addBook(book){
        const books = Storage.getBooks();

        books.push(book);
        localStorage.setItem("books", JSON.stringify(books));

    }
    static removeBook(isbn){
        const books = Storage.getBooks();
        books.forEach((book, index)=>{
            if(book.isbn === isbn){
                books.splice(index, 1);
            }
        });

        localStorage.setItem("books", JSON.stringify(books))
    }
}

document.addEventListener("DOMContentLoaded", UI.displayBooks);

document.querySelector("#add-book").addEventListener("click", (e)=>{
    e.preventDefault();
    const title = document.querySelector("#title").value;
    const author = document.querySelector("#author").value;
    const isbn = 1*document.querySelector("#isbn").value;
    if((typeof isbn)==="number"&& isFinite(isbn)&&!isNaN(isbn)){
        if(!Storage.getBooks().find(book => book['isbn']===isbn)){ 
            if(title ===""||author ===""||isbn ===""){
                UI.showAlert("Fill in all fields.", "danger", 2500);
            } else {
                const book = new Book(title, author, isbn);

                Storage.addBook(book);
                UI.addBookToList(book);
                UI.showAlert("Book added successfully.","success", 2000)
                UI.clearFields();
            }
        } else {
            UI.showAlert("Book with this ISBN already exists. ISBN must be unique.", "danger", 3000)
        }
    }else {
        UI.showAlert("Wrong ISBN! ISBN can only contain numbers.", "danger", 3000)
    }
});

const checkboxes = [...document.querySelectorAll("input[type='checkbox']")];
checkboxes[0].addEventListener("change", (e)=>{
    if(e.target.checked) checkboxes.slice(1).forEach((box)=>{box.checked=false})
    if(!e.target.checked) e.target.checked = true
    UI.searchBook();
})
checkboxes.slice(1).forEach((box)=>{
    box.addEventListener("click", (e)=>{
        if(e.target.checked) checkboxes[0].checked= false;
        if(checkboxes[1].checked&&checkboxes[2].checked&checkboxes[3].checked) {
            checkboxes[0].checked = true
            checkboxes.slice(1).forEach((box)=>{box.checked=false})
        };
        if(!checkboxes[1].checked&&!checkboxes[2].checked&!checkboxes[3].checked) checkboxes[0].checked = true
        UI.searchBook();
    })
})

document.querySelector("#search-input").addEventListener("input", UI.searchBook)