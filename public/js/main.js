const env = require('dotenv')
env.config()

async function create5exs(word) {
    const examples5 = document.getElementById('examples5');

    examples5.innerHTML = '';
    
    if (!word) {
        alert('Please enter a word!');
        return;
    }
    
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': API_KEY, // Replace YOUR_API_KEY with your actual API key
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
                content: `First, do not provide any additional information. Second, comply with the following form: "applauded : The audience applauded. | 관객들이 박수쳤다." Keeping these rules, please provide 5 example sentences using the word: "${word}".`
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

function word(e){
    const word = document.getElementById('wordInput').value;
    const code = e.code;

    if(code == "Enter"){
        create5exs(word)
    }
}
