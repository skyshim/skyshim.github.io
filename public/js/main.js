import { insertWord, getWordCount, deleteWord } from "./firebase.js";
import { addWordbook, removeWordbook, getWordbooks } from "./firebase.js";


const word_input = document.getElementById('wordInput')
const chapter_input = document.getElementById('chapterInput')

const addword_btn = document.querySelector('.submit')
const wordtest_btn = document.querySelector('.wordtest')
const deleteword_btn = document.querySelector('.delete');

let cur_category  = ""
const examples = []

//단어장 추가
document.getElementById("addWordbook").addEventListener("click", async () => {
    const wordbookId = document.getElementById("wordbookIdInput").value.trim();
    const wordbookName = document.getElementById("wordbookNameInput").value.trim();

    if (!wordbookId || !wordbookName) {
        alert("단어장 ID와 이름을 입력해주세요.");
        return;
    }

    await addWordbook(wordbookId, wordbookName);
    alert("단어장이 추가되었습니다.");
    loadWordbooks(); // 단어장 목록 갱신
});

//단어장 삭제 
document.getElementById("removeWordbook").addEventListener("click", async () => {
    const wordbookId = document.getElementById("wordbookIdInput").value.trim();

    if (!wordbookId) {
        alert("삭제할 단어장의 ID를 입력해주세요.");
        return;
    }

    await removeWordbook(wordbookId);
    alert("단어장이 삭제되었습니다.");
    loadWordbooks(); // 단어장 목록 갱신
});

// 단어장 목록 불러오기
async function loadWordbooks() {
    const wordbooks = await getWordbooks();
    updateWordbookUI(wordbooks);
}

function updateWordbookUI(wordbooks) {
    const wordbookList = document.querySelector(".select-cat");
    wordbookList.innerHTML = "";

    Object.entries(wordbooks).forEach(([id, { name }]) => {
        const div = document.createElement("div");
        div.textContent = name;
        div.id = id;
        wordbookList.appendChild(div);
    });

    const categories = document.querySelectorAll('.select-cat div') //categories가 wordbook에 대응
    categories.forEach(div => {
        div.addEventListener("click", function() {
            categories.forEach(d => d.classList.remove("selected"))
            this.classList.add("selected")
            cur_category = div.id
            console.log(cur_category)
        })
    })
}
loadWordbooks();


//단어 추가
async function add_word() {
    const word = word_input.value;
    const chapter = chapter_input.value;

    if (cur_category !== "" && chapter !== "" && word !== "") {
        examples.splice(0);
        create5exs(word);
        setTimeout(async function() {
            const ex1 = examples[0];
            const ex2 = examples[1];
            const ex3 = examples[2];
            const ex4 = examples[3];
            const ex5 = examples[4];
            console.log(examples);

            insertWord(cur_category, chapter, word, ex1, ex2, ex3, ex4, ex5);
            
            const wordCount = await getWordCount(cur_category, chapter);
            alert(`Successfully added the word '${word}' in chapter ${chapter}. Total words in this chapter: ${wordCount}`);
            
            cur_category = "";
            categories.forEach(d => d.classList.remove("selected"));
            word_input.value = "";
            chapter_input.value = "";
        }, 4000);
    } else if (cur_category === "") {
        alert('Please select a wordbook.');
    } else if (chapter === "") {
        alert('Please select a chapter.');
    } else if (word === "") {
        alert('Please write a word.');
    }
}

deleteword_btn.addEventListener('click', async () => {
    
    const word = word_input.value;
    const chapter = chapter_input.value;

    if (cur_category !== "" && chapter !== "" && word !== "") {
        const confirmDelete = confirm(`Are you sure you want to delete the word '${word}' from chapter ${chapter}?`);
        if (confirmDelete) {
            await deleteWord(cur_category, chapter, word);
            alert(`Successfully deleted the word '${word}' from chapter ${chapter}.`);

            cur_category = "";
            categories.forEach(d => d.classList.remove("selected"));
            word_input.value = "";
            chapter_input.value = "";
        }
    } else if (cur_category === "") {
        alert('Please select a wordbook.');
    } else if (chapter === "") {
        alert('Please select a chapter.');
    } else if (word === "") {
        alert('Please write a word.');
    }
});

window.onkeydown = (e) => {
    const code = e.code;

    if (code === 'Enter') {
        add_word();
    }
}

addword_btn.addEventListener('click', function() {
    add_word();
})