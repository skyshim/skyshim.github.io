import { insertWord, getWordCount, deleteWord } from "./firebase.js";

const word_input = document.getElementById('wordInput')
const chapter_input = document.getElementById('chapterInput')
const categories = document.querySelectorAll('.select-cat div')

const addword_btn = document.querySelector('.submit')
const wordtest_btn = document.querySelector('.wordtest')
const deleteword_btn = document.querySelector('.delete');

let cur_category
const examples = []

categories.forEach(div => {
    div.addEventListener("click", function() {
        categories.forEach(d => d.classList.remove("selected"))
        this.classList.add("selected")
        cur_category = div.id
        console.log(cur_category)
    })
})

async function add_word() {
    const word = word_input.value;
    const chapter = chapter_input.value

    if (chapter != "" && word != "") {
        examples.splice(0);
        create5exs(word)
        setTimeout(async function() {
            const ex1 = examples[0]
            const ex2 = examples[1]
            const ex3 = examples[2]
            const ex4 = examples[3]
            const ex5 = examples[4]
            console.log(examples)
    
            insertWord(cur_category, chapter, word, ex1, ex2, ex3, ex4, ex5)
            // insertWord(cur_category, chapter, word, '1', '2', '3', '4', '5') //테스트용
    
            const wordCount = await getWordCount(cur_category, chapter);
            alert(`Successfully added the word '${word}' in chapter ${chapter}. Total words in this chapter: ${wordCount}`)
    
            word_input.value = ""
            chapter_input.value = ""
        }, 4000);
    } else if (chapter == "") {
        alert('Please select a chapter.')
    } else if (word == "") {
        alert('Please write a word.')
    }
}

// 단어 삭제 버튼 이벤트 추가
deleteword_btn.addEventListener('click', async () => {
    const word = word_input.value;
    const chapter = chapter_input.value;

    if (chapter !== "" && word !== "") {
        const confirmDelete = confirm(`Are you sure you want to delete the word '${word}' from chapter ${chapter}?`);
        if (confirmDelete) {
            await deleteWord(cur_category, chapter, word);
            alert(`Successfully deleted the word '${word}' from chapter ${chapter}.`);
            word_input.value = "";
            chapter_input.value = "";
        }
    } else if (chapter === "") {
        alert('Please select a chapter.');
    } else if (word === "") {
        alert('Please write a word.');
    }
});

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

    examples.splice(0) //examples 초기화
    examples5.innerHTML = ''
    
    if (!word) {
        alert('Please enter a word!')
        return;
    }
    
    try {
        const response = await fetch('https://skyshim-github-io.onrender.com/api/openai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are an assistant that provides English example sentences.' },
                    { role: 'user', content: `provide 5 example sentences and korean meanings using the word: "${word}", without index. Comply with the following form: "example sentence.|korean meanings."`},
                ],
            }),
        });

        const data = await response.json();

        if (response.ok) {
            const examplesList = data.choices[0].message.content.split('\n').filter(line => line.trim());
            examplesList.forEach(example => {
                examples.push(example);
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