import { insertWord, getWordCount, deleteWord, loadFirebaseData, getChaptersFromFirebase } from "./firebase.js"; // firebase.js import 추가

// =====================
// 변수 선언
// =====================

const word_input = document.getElementById("wordInput");
const chapter_select = document.getElementById("chapterDropdown");
const categories = document.querySelectorAll(".select-cat div");
const addword_btn = document.querySelector(".submit");
const wordtest_btn = document.querySelector(".wordtest");
const wordTableBody = document.querySelector("#wordTable tbody");

let cur_category = "";
let cur_chapter = "";

// =====================
// 카테고리 관련 함수들
// =====================

// 카테고리 클릭 시 이벤트 처리
categories.forEach(div => {
    div.addEventListener("click", function () {
        categories.forEach(d => d.classList.remove("selected"));
        this.classList.add("selected");
        cur_category = div.id;

        console.log("Selected category:", cur_category);
        loadChapters(cur_category);
        loadFirstChapterForCategory(cur_category);
    });
});

// 카테고리에 해당하는 챕터를 로드
async function loadChapters(category) {
    try {
        const chapterDropdown = document.getElementById("chapterDropdown");
        if (!chapterDropdown) {
            console.error("Dropdown element not found");
            return;
        }

        chapterDropdown.innerHTML = ""; // 에러 발생 지점

        const chapters = await getChaptersFromFirebase(category); // Firebase에서 챕터 로드
        if (!chapters || Object.keys(chapters).length === 0) {
            console.log("No chapters found for category:", category);
            return;
        }

        Object.keys(chapters).forEach(chapterName => {
            const option = document.createElement("option");
            option.value = chapterName;
            option.textContent = chapterName;
            chapterDropdown.appendChild(option);
        });
    } catch (err) {
        console.error("Error loading chapters:", err);
    }
}

// Firebase에서 첫 번째 챕터를 불러와서 선택
async function loadFirstChapterForCategory(category) {
    try {
        const data = await loadFirebaseData();
        const firstChapter = Object.keys(data[category])[0];
        if (firstChapter) {
            chapter_select.value = firstChapter;
            chapter_select.dispatchEvent(new Event('change')); // 자동으로 데이터 로드
        }
    } catch (error) {
        console.error("Error loading category data:", error);
    }
}

// =====================
// 챕터 관련 함수들
// =====================

// 챕터 변경 시 데이터 로드
chapter_select.addEventListener("change", () => {
    cur_chapter = chapter_select.value;
    if (cur_chapter) {
        loadWordTable(cur_category, cur_chapter);
    } else {
        wordTableBody.innerHTML = "<tr><td colspan='3'>Select a chapter to view words.</td></tr>";
    }
});

// 단어 테이블 로드
async function loadWordTable(category, chapter) {
    wordTableBody.innerHTML = "<tr><td colspan='3'>Loading...</td></tr>";
    try {
        const firebaseData = await loadFirebaseData();
        const chapterData = firebaseData[category][chapter];

        if (chapterData) {
            wordTableBody.innerHTML = "";
            chapterData.forEach((wordData) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${chapter}</td>
                    <td>${wordData.word}</td>
                    <td>${wordData.examples[0]?.english || "No example"}</td>
                    <td>
                        <button class="delete-word" data-word="${wordData.word}">
                            삭제
                        </button>
                    </td>
                `;
                wordTableBody.appendChild(row);
            });

            addDeleteButtonEventListeners();
        } else {
            wordTableBody.innerHTML = "<tr><td colspan='3'>No words found in this chapter.</td></tr>";
        }
    } catch (error) {
        console.error("Error loading word table:", error);
        wordTableBody.innerHTML = "<tr><td colspan='3'>Error loading data.</td></tr>";
    }
}

// 삭제 버튼 이벤트 리스너 추가
function addDeleteButtonEventListeners() {
    const deleteButtons = document.querySelectorAll(".delete-word");
    deleteButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            const word = e.target.dataset.word;
            confirmDeleteWord(cur_category, cur_chapter, word);
        });
    });
}

// 단어 삭제 확인 및 처리
async function confirmDeleteWord(category, chapter, word) {
    const confirmDelete = confirm(`Are you sure you want to delete '${word}' from chapter '${chapter}'?`);
    if (confirmDelete) {
        try {
            await deleteWord(category, chapter, word);
            alert(`Successfully deleted '${word}' from chapter '${chapter}'.`);
            loadWordTable(category, chapter);
        } catch (error) {
            console.error("Error deleting word:", error);
            alert("Failed to delete the word.");
        }
    }
}

// =====================
// 단어 관련 함수들
// =====================

// 단어 추가 함수
async function add_word() {
    const word = word_input.value;

    if (cur_category && cur_chapter && word) {
        const examples = await create5exs(word);
        insertWord(cur_category, cur_chapter, word, ...examples);
        alert(`Successfully added '${word}' to ${cur_chapter}.`);
        word_input.value = "";
        loadWordTable(cur_category, cur_chapter);
    } else {
        alert("Please select a category, chapter, and enter a word.");
    }
}

// 단어 예문 생성
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
                    { role: 'user', content: `provide 5 example sentences and korean meanings using the word: ${word}. Do not show index. Do not change the singular/pluarl and tense of the word. Comply with the form: "example sentence.|korean meanings."`},
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

    return ["ex1", "ex2", "ex3", "ex4", "ex5"]; // 예제 반환
}

// =====================
// 이벤트 처리
// =====================

// 단어 추가 이벤트
addword_btn.addEventListener("click", add_word);

// 단어 테스트 페이지로 이동 이벤트
wordtest_btn.addEventListener("click", () => window.open("../wordtest", "_self"));
