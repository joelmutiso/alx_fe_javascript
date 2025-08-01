let quotes = [];
let quoteTextElement;
let quoteCategoryElement;
let newQuoteTextInput;
let newQuoteCategoryInput;
let newQuoteButton;

document.addEventListener('DOMContentLoaded', function() {
    const quoteDisplayDiv = document.getElementById('quoteDisplay');
    newQuoteButton = document.getElementById('newQuote');
    newQuoteTextInput = document.getElementById('newQuoteText');
    newQuoteCategoryInput = document.getElementById('newQuoteCategory');
    const exportButton = document.getElementById('exportQuotes');

    loadQuotes();

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
        displayRandomQuote();
    }

    newQuoteButton.addEventListener('click', displayRandomQuote);
    exportButton.addEventListener('click', exportQuotes);
});

function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    } else {
        quotes = [
            { text: "The only way to do great work is to love what you do.", category: "Steve Jobs" },
            { text: "Innovation distinguishes between a leader and a follower.", category: "Steve Jobs" },
            { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Eleanor Roosevelt" },
            { text: "Strive not to be a success, but rather to be of value.", category: "Albert Einstein" },
            { text: "The mind is everything. What you think you become.", category: "Buddha" }
        ];
    }
}

function displayRandomQuote() {
    if (quotes.length === 0) {
        if (quoteTextElement) {
            quoteTextElement.innerHTML = "No quotes available. Add some!";
            quoteCategoryElement.innerHTML = "";
        }
        return;
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];

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
    newQuoteTextInput.value = '';
    newQuoteCategoryInput.value = '';

    displayRandomQuote();
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
        displayRandomQuote();
    };
    fileReader.readAsText(event.target.files[0]);
}

