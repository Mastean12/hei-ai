import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element){
    element.textContent ='';
 
    loadInterval = setInterval(() => {
        element.textContent +='*';

        if(element.textContent === `*LOADING*`) {
            element.textContent =''; 
        }
    },300)
}

function typeText(element, text) {
    let index = 0;

    let interval = setInterval (() => {
        if(index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 20);
}

function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe (isAi, value, uniqueId) {
    return (
        `
         <div class="wrapper ${isAi && 'ai'}">
          <div class="chat">
             <div class="profile">
             <img
                src="${isAi ? bot : user}"
                alt="${isAi ? 'bot' : 'user'}"
             />
             </div>
             <div class="message" id="${uniqueId}">${value}</div>
          </div>
         </div>
        `
    )
}

const handlesubmit = async (e) => {
    e.preventDefault();

    const data = new FormData(form);

    //user's chatstripe
    const userChatStripe = document.createElement('div');
    userChatStripe.innerHTML = chatStripe(false, data.get('prompt'));
    chatContainer.appendChild(userChatStripe);

    form.reset();

    //bot chat stripe
    const uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

    chatContainer.scrollTop = chatContainer.scrollHeight;
    clearInterval(loadInterval);

    const messageDiv =  document.getElementById(uniqueId);

    loader(messageDiv);

    //fetch data from ther serever -> bot response

    const response = await fetch('https://heiai.onrender.com', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }, 
        body: JSON.stringify({
         prompt: data.get('prompt')
        })
    })

    clearInterval(loadInterval);
    messageDiv.innerHTML = '';

    if(response.ok){
        const data = await response.json();
        const parsedData = data.bot.trim();

        typeText(messageDiv, parsedData);
    } else {
        const err = await response.text();

        messageDiv.innerHTML = "Something Went Wrong";

        alert(err);
    }
}

form.addEventListener('submit',handlesubmit);
form.addEventListener('keyup', (e) => {
    if(e.keyCode === 13) {
        handlesubmit(e);
    }
})