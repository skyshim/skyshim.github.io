import { OPENAI_API_KEY, insertWord} from "./firebase.js"

const word_input = document.getElementById('wordInput')
const chapter_input = document.getElementById('chapterInput')
const categories = document.querySelectorAll('.select-cat div')

const addword_btn = document.querySelector('.submit')
const wordtest_btn = document.querySelector('.wordtest')

let cur_category

categories.forEach(div => {
    div.addEventListener("click", function() {
        categories.forEach(d => d.classList.remove("selected"))
        this.classList.add("selected")
        cur_category = div.id
        console.log(cur_category)
    })
})

function add_word() {
    const word = word_input.value;
    const chapter = chapter_input.value

    if (chapter != "" && word != "") {
        // create5exs(word)
        insertWord(cur_category, chapter, word, '1', '2', '3', '4','5')
        alert(`Successfully added the word '${word}' in chapter ${chapter}`)
        word_input.value = ""
        chapter_input.value = ""
    } else if (chapter == "") {
        alert('Please select a chapter.')
    } else if (word == "") {
        alert('Please write a word.')
    }
}

window.onkeydown = (e) => {
    const code = e.code;

    if (code === 'Enter') {
        add_word()
    }
}

addword_btn.addEventListener('click', function() {
    add_word()
})

wordtest_btn.addEventListener('click', function() {
    window.open('../wordtest.html', '_self')
})


async function create5exs(word) {
    const examples5 = document.getElementById('examples5')

    examples5.innerHTML = ''
    
    if (!word) {
        alert('Please enter a word!')
        return;
    }
    
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`, // Replace YOUR_API_KEY with your actual API key
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
            {
                role: 'system',
                content: 'You are an assistant that provides English example sentences.'
            },
            {
                role: 'user',
                content: `First, do not provide additional information. Second, comply with the following form: "applauded:The audience applauded.|관객들이 박수쳤다." Keeping these rules, provide 5 example sentences using the word: "${word}".`
            }
        ]
        })
    });
    
    const data = await response.json();
    
    if (response.ok) {
        const examples = data.choices[0].message.content;
        const examplesList = examples.split('\n').filter(line => line.trim());
    
        examplesList.forEach(example => {
            const p = document.createElement('p');
            p.textContent = example;
            examples5.appendChild(p);
        });
    } else {
        console.error(data);
        alert('Error: Could not generate examples. Check the console for details.');
    }
    } catch (error) {
        console.error(error);
        alert('Error: Unable to connect to the API.');
    }
}
