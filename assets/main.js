// Seleção de Elementos do DOM
const elements = {
  chatInput: document.getElementById('chat-input'),
  sendBtn: document.getElementById('send-btn'),
  chatContainer: document.querySelector('.chat-container'),
  themeBtn: document.getElementById('theme-btn'),
  githubIcon: document.querySelector('.github-link img'),
  deleteBtn: document.getElementById('delete-btn')
};

// Constantes
const apiUrl = 'https://botchains.vercel.app/api/openai';
const initialHeight = elements.chatInput.scrollHeight;

// Carrega dados do localStorage ao iniciar
const loadLocalStorageData = () => {
  const themeColor = localStorage.getItem('theme-color');
  const isLightMode = themeColor === 'light_mode';

  document.body.classList.toggle('light-mode', isLightMode);
  elements.themeBtn.textContent = isLightMode ? 'dark_mode' : 'light_mode';

  const defaultText = `<div class='default-text'>
                          <h1>⛓️ Bot<span class='destaque'>Chains</span> ⛓️</h1>
                          <p> Comece a conversar e explore o poder da AI.<br> O histórico do seu chat aparecerá aqui.<br>
                          Desenvolvido por <a href='https://github.com/trichains' target='_blank'>trichains</a></p>
                        </div>`;

  elements.chatContainer.innerHTML =
    localStorage.getItem('all-chats') || defaultText;
  elements.chatContainer.scrollTo(0, elements.chatContainer.scrollHeight);
};

// Chama a função para carregar dados do localStorage ao iniciar
loadLocalStorageData();

// Função de Criação de Elemento HTML
const createElement = (html, className) => {
  const chatDiv = document.createElement('div');
  chatDiv.classList.add('chat', className);
  chatDiv.innerHTML = html;
  return chatDiv;
};

// Função para Obter Resposta do Chat
const handleChatResponse = (chatEntry, response) => {
  const pElement = document.createElement('p');

  const handleInvalidResponse = () => {
    const errorMessage = 'Resposta inválida da API';
    console.error(errorMessage, response);
    pElement.classList.add('error');
    pElement.textContent = errorMessage;
    showError(errorMessage);
  };

  if (!response || !response.choices || response.choices.length === 0) {
    handleInvalidResponse();
    return;
  }

  const content = response.choices[0]?.message?.content;

  if (content !== undefined && content !== null) {
    pElement.textContent = content.trim();
  } else {
    handleInvalidResponse();
  }

  chatEntry.querySelector('.typing-animation').remove();
  chatEntry.querySelector('.chat-details').appendChild(pElement);
  elements.chatContainer.scrollTo(0, elements.chatContainer.scrollHeight);
  localStorage.setItem('all-chats', elements.chatContainer.innerHTML);
};

// Função para copiar resposta para a área de transferência
const copyResponse = (copyBtn) => {
  const responseTextElement = copyBtn.parentElement.querySelector('p');
  navigator.clipboard.writeText(responseTextElement.textContent);
  // Restaura o texto do botão após a cópia
  setTimeout(() => {
    copyBtn.textContent = 'content_copy';
  }, 2000);
};

// Animação de Digitação
const showTypingAnimation = async () => {
  const html = `<div class='chat-content'>
                  <div class='chat-details'>
                    <img src='./assets/imgs/botchains.svg' alt='Foto do Chat Bot' />
                    <div class='typing-animation'>
                      <div class='typing-dot' style='--delay: 0.2s'></div>
                      <div class='typing-dot' style='--delay: 0.3s'></div>
                      <div class='typing-dot' style='--delay: 0.4s'></div>
                    </div>
                  </div>
                  <span onclick='copyResponse(this)' class='material-symbols-rounded'>content_copy</span>
                </div>`;
  const chatEntry = createElement(html, 'entrada');
  elements.chatContainer.appendChild(chatEntry);
  elements.chatContainer.scrollTo(0, elements.chatContainer.scrollHeight);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userText: elements.chatInput.value.trim() })
    });

    if (!response.ok) {
      throw new Error('Erro ao chamar a API OpenAI');
    }

    const responseData = await response.json();
    // Chama a função para manipular a resposta
    handleChatResponse(chatEntry, responseData);
  } catch (error) {
    console.error('Erro ao obter resposta da API OpenAI', error);
    // Exibe mensagem de erro no chat
    showError('Erro ao obter resposta da API OpenAI');
  }
};

// Função para exibir uma mensagem de erro no chat
const showError = (errorMessage) => {
  const html = `<div class="chat-content">
                  <div class="chat-details">
                    <img src="./assets/imgs/botchains.svg" alt="Foto do Chat Bot" />
                    <p class="error">${errorMessage}</p>
                 </div>
                </div>`;
  const errorChatEntry = createElement(html, 'saida');
  elements.chatContainer.appendChild(errorChatEntry);
  elements.chatContainer.scrollTo(0, elements.chatContainer.scrollHeight);
  localStorage.setItem('all-chats', elements.chatContainer.innerHTML);
};

document.addEventListener('DOMContentLoaded', function () {
  var jsDisabledMessage = document.querySelector('.js-disable');
  jsDisabledMessage.style.display = 'block'; // Exibe a mensagem inicialmente

  // Adiciona a classe js-enabled ao body para estilizar elementos quando o JavaScript está habilitado
  document.body.classList.add('js-enabled');

  // Remove a mensagem se o JavaScript estiver habilitado
  jsDisabledMessage.style.display = 'none';
});

// Manipulação da Saída do Chat
const handleChatOutput = () => {
  const userText = elements.chatInput.value.trim();
  if (!userText) return;

  elements.chatInput.value = '';
  elements.chatInput.style.height = `${initialHeight}px`;
  const html = `<div class="chat-content">
                  <div class="chat-details">
                    <img src="./assets/imgs/user.svg" alt="Foto do usuário" />
                    <p>${userText}</p>
                 </div>
                </div>`;
  // Cria um div de chat de saída com a mensagem do usuário e anexa ao contêiner de chat
  const outputChatEntry = createElement(html, 'saida');
  elements.chatContainer.appendChild(outputChatEntry);
  elements.chatContainer.scrollTo(0, elements.chatContainer.scrollHeight);

  // Após criar a entrada do usuário, você pode chamar a função para obter a resposta (showTypingAnimation)
  showTypingAnimation();
};

// Função para trocar o ícone do GitHub com base no tema atual
const toggleGithubIcon = () => {
  const isLightMode = document.body.classList.contains('light-mode');
  const iconPath = isLightMode
    ? './assets/imgs/github-dark.svg' // Caminho para o ícone escuro
    : './assets/imgs/github.svg'; // Caminho para o ícone claro
  elements.githubIcon.setAttribute('src', iconPath);
};

// Adiciona um ouvinte de evento para o clique no botão de tema
elements.themeBtn.addEventListener('click', () => {
  // Muda o tema do site
  document.body.classList.toggle('light-mode');
  localStorage.setItem('theme-color', elements.themeBtn.textContent);
  elements.themeBtn.textContent = document.body.classList.contains('light-mode')
    ? 'dark_mode'
    : 'light_mode';

  // Chama a função para trocar o ícone do GitHub
  toggleGithubIcon();
});

// Adiciona um ouvinte de evento para o clique no botão de apagar
elements.deleteBtn.addEventListener('click', () => {
  // Remove todas as conversas do localStorage e chama a função loadLocalStorageData para atualizar o conteúdo do chat
  if (confirm('Deseja apagar todo o histórico da conversa?')) {
    localStorage.removeItem('all-chats');
    elements.chatContainer.innerHTML = '';
    loadLocalStorageData();
  }
});

// Adiciona um ouvinte de evento para o evento de entrada no campo de texto
elements.chatInput.addEventListener('input', () => {
  // Ajusta a altura do input de acordo com o conteúdo
  elements.chatInput.style.height = `${initialHeight}px`;
  elements.chatInput.style.height = `${elements.chatInput.scrollHeight}px`;
});

// Adiciona um ouvinte de evento para o pressionamento de tecla no campo de texto
elements.chatInput.addEventListener('keydown', (e) => {
  // Se o botão Enter for pressionado com shift pressionado e a largura da janela for maior que 768, aciona a manipulação da saída do chat
  if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 768) {
    e.preventDefault();
    handleChatOutput();
  }
});

// Adiciona um ouvinte de evento para o clique no botão de envio, que aciona a manipulação da saída do chat
elements.sendBtn.addEventListener('click', handleChatOutput);

toggleGithubIcon();
