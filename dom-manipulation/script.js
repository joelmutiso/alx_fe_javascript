const quotes = [
    { text: "Journey of a thousand miles starts", category: "moving" },
    { text: "a smile a day keeps trouble away", category: "happy" },
    { text: "seeing the light", category: "enlightened" },
];

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

    quoteTextElement = document.createElement('p');
    quoteTextElement.id = 'quoteText';
    quoteDisplayDiv.appendChild(quoteTextElement);

    quoteCategoryElement = document.createElement('p');
    quoteCategoryElement.id = 'quoteCategory';
    quoteDisplayDiv.appendChild(quoteCategoryElement);

    showRandomQuote();

    newQuoteButton.addEventListener('click', showRandomQuote);
});

function showRandomQuote() {
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
    }
}

function addQuote() {
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

    newQuoteTextInput.value = '';
    newQuoteCategoryInput.value = '';

    showRandomQuote();
    console.log("New quote added:", newQuote);
}
