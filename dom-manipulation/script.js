let quotes = [];
let serverQuotes = [
    { text: "The only way to do great work is to love what you do.", category: "Steve Jobs" },
    { text: "Innovation distinguishes between a leader and a follower.", category: "Steve Jobs" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Eleanor Roosevelt" },
    { text: "Strive not to be a success, but rather to be of value.", category: "Albert Einstein" },
    { text: "The mind is everything. What you think you become.", category: "Buddha" }
];
let quoteTextElement;
let quoteCategoryElement;
let newQuoteTextInput;
let newQuoteCategoryInput;
let newQuoteButton;
let categoryFilterElement;

document.addEventListener('DOMContentLoaded', function() {
    const quoteDisplayDiv = document.getElementById('quoteDisplay');
    newQuoteButton = document.getElementById('newQuote');
    newQuoteTextInput = document.getElementById('newQuoteText');
    newQuoteCategoryInput = document.getElementById('newQuoteCategory');
    const exportButton = document.getElementById('exportQuotes');
    categoryFilterElement = document.getElementById('categoryFilter');
    const syncButton = document.getElementById('syncQuotes');

    loadQuotes();
    syncQuotes();

    quoteTextElement = document.createElement('p');
    quoteTextElement.id = 'quoteText';
    quoteDisplayDiv.appendChild(quoteTextElement);

    quoteCategoryElement = document.createElement('p');
    quoteCategoryElement.id = 'quoteCategory';
    quoteDisplayDiv.appendChild(quoteCategoryElement);

    const lastViewedQuote = JSON.parse(sessionStorage.getItem('lastViewedQuote'));
    if (lastViewedQuote) {
        quoteTextElement.innerHTML = lastViewedQuote.text;
        quoteCategoryElement.innerHTML = `- ${lastViewedQuote.category}`;
    } else {
        displayRandomQuote(quotes);
    }

    const lastSelectedCategory = localStorage.getItem('lastCategoryFilter');
    if (lastSelectedCategory) {
        categoryFilterElement.value = lastSelectedCategory;
    }

    filterQuotes();

    newQuoteButton.addEventListener('click', () => displayRandomQuote(quotes));
    exportButton.addEventListener('click', exportQuotes);
    categoryFilterElement.addEventListener('change', filterQuotes);
    syncButton.addEventListener('click', syncQuotes);
});

function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    } else {
        quotes = [];
    }
}

function populateCategories() {
    const categories = [...new Set(quotes.map(quote => quote.category))];
    categoryFilterElement.innerHTML = '';
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All Categories';
    categoryFilterElement.appendChild(allOption);

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilterElement.appendChild(option);
    });
}

function filterQuotes() {
    const selectedCategory = categoryFilterElement.value;
    localStorage.setItem('lastCategoryFilter', selectedCategory);

    let filteredQuotes = quotes;
    if (selectedCategory !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }

    displayRandomQuote(filteredQuotes);
}

function displayRandomQuote(quotesToDisplay) {
    if (quotesToDisplay.length === 0) {
        if (quoteTextElement) {
            quoteTextElement.innerHTML = "No quotes available for this category. Add some!";
            quoteCategoryElement.innerHTML = "";
        }
        return;
    }

    const randomIndex = Math.floor(Math.random() * quotesToDisplay.length);
    const randomQuote = quotesToDisplay[randomIndex];

    if (quoteTextElement && quoteCategoryElement) {
        quoteTextElement.innerHTML = randomQuote.text;
        quoteCategoryElement.innerHTML = `- ${randomQuote.category}`;
        sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
    }
}

function createAddQuoteForm() {
    if (!newQuoteTextInput || !newQuoteCategoryInput) {
        console.error("Input elements not found. DOM not fully loaded or IDs are incorrect.");
        return;
    }

    const newText = newQuoteTextInput.value.trim();
    const newCategory = newQuoteCategoryInput.value.trim();

    if (newText === '' || newCategory === '') {
        alert('Please enter both a quote and a category.');
        return;
    }

    const newQuote = {
        text: newText,
        category: newCategory
    };

    quotes.push(newQuote);
    saveQuotes();
    addQuoteToServer(newQuote);
    newQuoteTextInput.value = '';
    newQuoteCategoryInput.value = '';

    populateCategories();
    filterQuotes();
    console.log("New quote added:", newQuote);
}

function exportQuotes() {
    const quotesJson = JSON.stringify(quotes, null, 2);
    const blob = new Blob([quotesJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        saveQuotes();
        alert('Quotes imported successfully!');
        
        populateCategories();
        filterQuotes();
    };
    fileReader.readAsText(event.target.files[0]);
}

function syncQuotes() {
    let newQuotesCount = 0;
    let conflictsResolved = 0;

    const localQuotesTexts = new Set(quotes.map(q => q.text));
    serverQuotes.forEach(serverQuote => {
        if (!localQuotesTexts.has(serverQuote.text)) {
            quotes.push(serverQuote);
            newQuotesCount++;
        }
    });

    const serverQuotesTexts = new Set(serverQuotes.map(q => q.text));
    quotes.forEach(localQuote => {
        if (!serverQuotesTexts.has(localQuote.text)) {
            serverQuotes.push(localQuote);
        }
    });

    quotes.forEach((localQuote, index) => {
        const serverQuote = serverQuotes.find(sq => sq.text === localQuote.text);
        if (serverQuote && localQuote.category !== serverQuote.category) {
            quotes[index].category = serverQuote.category;
            conflictsResolved++;
        }
    });

    saveQuotes();
    populateCategories();
    filterQuotes();

    if (newQuotesCount > 0 || conflictsResolved > 0) {
        let message = '';
        if (newQuotesCount > 0) {
            message += `${newQuotesCount} new quotes added from server. `;
        }
        if (conflictsResolved > 0) {
            message += `${conflictsResolved} conflict(s) resolved. Server data took precedence.`;
        }
        console.log(message);
    } else {
        console.log('Data is already up to date!');
    }
}

function addQuoteToServer(newQuote) {
    serverQuotes.push(newQuote);
    console.log("Quote added to simulated server:", newQuote);
}
