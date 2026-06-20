// ==========================================================================
// ARQUITETURA MVC - CLIENT-SIDE CONTROLLER & DJANGO INTEGRATION SERVICE
// Este ficheiro contém toda a lógica comportamental e reativa do Front-end.
// ==========================================================================

// 1. CONFIGURAÇÃO DE COMUNICAÇÃO DA API (BAIXO ACOPLAMENTO)
const CONFIG = {
    usarMock: true,          // Altere para 'false' assim que as Views do Django estiverem prontas!
    apiUrl: '/gerenciador/gerar-ficha/',     
    recalcUrl: '/gerenciador/recalcular-ficha/' 
};

// Estado global do lado do cliente (VIEWSTATE)
const state = {
    currentScreen: 'home',
    selectedSystem: '',
    currentQuestionIndex: 0,
    answers: [],
    calculatedCharacter: null,
    tempStats: {}
};

// Função utilitária para capturar o token de segurança contra ataques cruzados (CSRF) exigido pelo Django
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// ==========================================================================
// 2. REPOSITÓRIO DO MODELO (MOCK CLIENT-SIDE PERFEITAMENTE ALINHADO AO BANCO)
// ==========================================================================
const dndAndTormentaQuestions = [
    {
        text: "O vosso grupo está perdido numa masmorra e encontra um prisioneiro ferido numa cela trancada. Como reage?",
        options: [
            { text: "Uso as minhas gazuas para arrombar a fechadura silenciosamente e libertá-lo.", value: "DEX", trait: "Sorrateiro" },
            { text: "Derrubo a porta de ferro com um golpe de ombro forte e imponente.", value: "STR", trait: "Impulsivo" },
            { text: "Procuro padrões na parede de pedra que possam revelar o esconderijo da chave.", value: "INT", trait: "Intelectual" },
            { text: "Converso com o prisioneiro para garantir que ele é de confiança antes de agir.", value: "CHA", trait: "Cauteloso" }
        ]
    },
    {
        text: "Um mercador desonesto recusa-se a vender-vous mantimentos necessários sem cobrar o triplo do preço. Qual a vossa ação?",
        options: [
            { text: "Encaro o mercador firmemente nos olhos, prometendo consequências graves caso insista na extorsão.", value: "CON", trait: "Intimidador" },
            { text: "Uso do meu carisma natural e de mentiras criativas para o convencer de que sou um lorde disfarçado.", value: "CHA", trait: "Manipulador" },
            { text: "Analiso as mercadorias dele para encontrar falhas ou itens roubados e barganhar com essa informação.", value: "WIS", trait: "Perspicaz" },
            { text: "Pago o valor abusivo sem criar atritos, guardando rancor para o futuro.", value: "CON", trait: "Pacifista" }
        ]
    },
    {
        text: "Durante a vigília da noite, ouve um estalar de ramos vindo da escuridão da floresta. O que faz?",
        options: [
            { text: "Acordo o grupo de imediato com um sussurro silencioso, preparando o meu arco.", value: "DEX", trait: "Sentinela" },
            { text: "Sigo furtivamente em direção ao som para emboscar qualquer criatura espreitadora.", value: "WIS", trait: "Caçador" },
            { text: "Lanço uma pedra acesa com magia de luz no meio da escuridão para expor o intruso.", value: "INT", trait: "Erudito" },
            { text: "Grito desafiadoramente para afugentar qualquer predador selvagem.", value: "STR", trait: "Ousado" }
        ]
    },
    {
        text: "O rei pede-vos para liderar um ataque direto contra uma fortaleza de orcs. Qual o vosso plano tático?",
        options: [
            { text: "Exijo comandar a linha da frente, usando a minha armadura para absorver o impacto.", value: "STR", trait: "Combatente" },
            { text: "Desenho uma infiltração noturna escalando as muralhas pelas traseiras.", value: "DEX", trait: "Estrategista" },
            { text: "Proponho uma trégua temporária ou negociação diplomática para evitar baixas desnecessárias.", value: "CHA", trait: "Diplomático" },
            { text: "Estudo as rotas de abastecimento de água do forte inimigo para envenenar ou cortar os recursos.", value: "INT", trait: "Calculista" }
        ]
    },
    {
        text: "Uma ponte de cordas velha começa a ceder sobre um desfiladeiro de lava enquanto foge de gárgulas. O que faz?",
        options: [
            { text: "Calculo o ponto exato de equilíbrio de peso para saltar nas vigas que ainda resistem.", value: "INT", trait: "Racional" },
            { text: "Corro com fé absoluta na minha agilidade física, sem olhar para trás.", value: "DEX", trait: "Focado" },
            { text: "Ofereço o meu escudo de proteção para ajudar o aliado que ficou para trás.", value: "CON", trait: "Protetor" },
            { text: "Corto as cordas da gárgula que nos persegue, mesmo correndo o risco de cair.", value: "STR", trait: "Destemido" }
        ]
    }
];

const ordemParanormalQuestions = [
    {
        text: "A vossa equipa entra num sanatório abandonado e ouve um choro sofrido vindo da cave escura. Qual a vossa postura?",
        options: [
            { text: "Entro silenciosamente com a lanterna desligada e óculos de visão noturna.", value: "AGI", trait: "Infiltrador" },
            { text: "Chamo pela pessoa com uma voz firme e empática, tentando acalmar os ânimos.", value: "PRE", trait: "Psicólogo" },
            { text: "Analiso a poeira e os rastros na porta da cave para ver se há vestígios de sangue.", value: "INT", trait: "Perito" },
            { text: "Arrombo a porta trancada de uma vez e fico à frente da equipa como barreira.", value: "FOR", trait: "Escudo" }
        ]
    },
    {
        text: "Uma criatura distorcida com olhos de sangue salta das sombras das árvores! Como reage?",
        options: [
            { text: "Suporto o choque inicial do ataque físico para desferir um tiro certeiro à queima-roupa.", value: "VIG", trait: "Resistente" },
            { text: "Esquivo-me rapidamente pelas laterais, procurando uma cobertura segura.", value: "AGI", trait: "Ágil" },
            { text: "Procuro compreender a fraqueza biológica ou paranormal do monstro analisando a sua aura.", value: "INT", trait: "Ocultista" },
            { text: "Grito comandos de autoridade para guiar e organizar a linha de fogo da minha equipa.", value: "PRE", trait: "Líder" }
        ]
    },
    {
        text: "Encontra um computador encriptado pertencente a um cientista desaparecido da Ordem. Qual o vosso método?",
        options: [
            { text: "Uso as minhas competências de hacking para quebrar a palavra-passe por brute force.", value: "INT", trait: "Especialista" },
            { text: "Tento sintonizar a minha presença com a membrana para detetar impressões digitais paranormais.", value: "PRE", trait: "Sensitivo" },
            { text: "Destruo a carcaça de metal para retirar o disco rígido fisicamente e analisar os chips.", value: "FOR", trait: "Prático" },
            { text: "Examino a divisão física à procura de papéis com anotações de palavras-passe escondidas.", value: "AGI", trait: "Detetive" }
        ]
    },
    {
        text: "Gás tóxico começa a invadir o complexo e as portas de segurança fecharam-se. Como resolve o problema?",
        options: [
            { text: "Prendo a respiração e uso a minha vitalidade para operar a alavanca manual emperrada.", value: "VIG", trait: "Obstinado" },
            { text: "Reconfiguro a fiação elétrica do painel de controlo usando engenharia rápida.", value: "INT", trait: "Engenheiro" },
            { text: "Mantenho a compostura verbal da equipa para evitar que o pânico acelere o consumo de oxigénio.", value: "PRE", tracking: "Calmo" },
            { text: "Escalo o duto de ventilação do teto para escapar e puxar os outros de cima.", value: "AGI", trait: "Atlético" }
        ]
    },
    {
        text: "Um espelho antigo no corredor mostra o vosso reflexo a mover-se com segundos de atraso. Como lida?",
        options: [
            { text: "Encaro o reflexo nos olhos, tentando decifrar qual entidade está presa no Outro Lado.", value: "PRE", trait: "Clarividente" },
            { text: "Examino o espelho fisicamente, procurando projetores ou efeitos de ilusão modernos.", value: "INT", trait: "Cético" },
            { text: "Mantenho a frieza psicológica, ignorando o reflexo e seguindo o corredor.", value: "VIG", trait: "Firmeza" },
            { text: "Parto o espelho com um golpe rápido usando a coronha da minha pistola.", value: "AGI", trait: "Reativo" }
        ]
    }
];

// ==========================================================================
// 3. MOCK API SERVICE (MOCK SINCRONIZADO AOS CAMPOS EXATOS DOS REQUISITOS DJANGO)
// ==========================================================================
class MockApiService {
    static async processQuizResults(system, answers) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let stats = {};
                let traits = answers.map(a => a.trait);

                if (system === 'Ordem Paranormal') {
                    // Mapeado de acordo com 'OrdemCharacterSpecs' do back-end
                    stats = { 'strength': 1, 'agility': 1, 'intelligence': 1, 'presence': 1, 'constitution': 1 };
                    answers.forEach(ans => {
                        const val = ans.value;
                        if (val === 'FOR') stats['strength'] += 1;
                        if (val === 'AGI') stats['agility'] += 1;
                        if (val === 'INT') stats['intelligence'] += 1;
                        if (val === 'PRE') stats['presence'] += 1;
                        if (val === 'VIG') stats['constitution'] += 1;
                    });
                } else {
                    // Mapeado de acordo com 'DeDCharacterSpecs/TormentaCharacterSpecs' do back-end
                    stats = { 'strength': 10, 'dextery': 10, 'constitution': 10, 'intelligence': 10, 'wisdom': 10, 'charisma': 10 };
                    answers.forEach(ans => {
                        const v = ans.value;
                        if (v === 'STR') stats['strength'] += 2;
                        if (v === 'DEX') stats['dextery'] += 2;
                        if (v === 'CON') stats['constitution'] += 2;
                        if (v === 'INT') stats['intelligence'] += 2;
                        if (v === 'WIS') stats['wisdom'] += 2;
                        if (v === 'CHA') stats['charisma'] += 2;
                    });
                }

                const narrative = this._calculateNarrative(system, stats);
                resolve({
                    name: traits[0] ? `${traits[0]} da Aliança` : "Explorador da Aliança",
                    system: system,
                    stats: stats,
                    classSugerida: narrative.classSugerida,
                    background: narrative.background,
                    tips: narrative.tips,
                    quote: narrative.quote,
                    traits: traits
                });
            }, 1800);
        });
    }

    static async recalculateFromStats(system, stats, originalTraits) {
        return new Promise((resolve) => {
            const narrative = this._calculateNarrative(system, stats);
            resolve({
                name: originalTraits[0] ? `${originalTraits[0]} da Aliança` : "Explorador da Aliança",
                system: system,
                stats: stats,
                classSugerida: narrative.classSugerida,
                background: narrative.background,
                tips: narrative.tips,
                quote: narrative.quote,
                traits: originalTraits
            });
        });
    }

    static _calculateNarrative(system, stats) {
        let classSugerida = "Explorador";
        let background = "";
        let tips = [];
        let quote = "";

        const highestStat = Object.keys(stats).reduce((a, b) => stats[a] > stats[b] ? a : b);

        if (system === 'Ordem Paranormal') {
            if (highestStat === 'intelligence') {
                classSugerida = "Especialista Paranormal (Técnico)";
                background = "Trabalhou como analista de sistemas na polícia judiciária. Um mistério com marcas ocultas invadiu os vossos terminais e a Ordem recrutou-o devido à sua mente lógica de dedução.";
                tips = [
                    "Mantenha um bloco de notas digital para catalogar cada rasto, runa e comportamento bizarro detetado na cena do mistério.",
                    "Mantenha um tom clínico e calmo ao falar. Se a vossa equipa entrar em pânico, calcule as probabilidades exatas de sobrevivência em voz alta.",
                    "Evite o perigo físico direto. Mantenha-se na retaguarda, oferecendo dicas de posicionamento tático e suporte de mira de longo alcance."
                ];
                quote = "Os dados matemáticos não mentem. Se a realidade está a falhar, é porque a membrana está fraca neste setor.";
            } else if (highestStat === 'agility' || highestStat === 'strength') {
                classSugerida = "Combatente (Aniquilador)";
                background = "Ex-operacional das forças especiais de elite. Após sobreviver a uma chacina sobrenatural causada por rituais de Sangue, jurou caçar cada criatura do Outro Lado.";
                tips = [
                    "Mantenha o tique dramático de verificar as munições e limpar a faca tática constantemente em momentos de silêncio ou tensão.",
                    "Fique sempre à frente da equipa. Use o vosso corpo e armamento para proteger os membros intelectuais ou sensitivos do grupo.",
                    "Desconfie de portas destrancadas ou silêncio excessivo. Descreva a vossa movimentação de forma militar e tática."
                ];
                quote = "Se essa monstruosidade paranormal consegue sangrar no nosso mundo, nós conseguimos eliminá-la.";
            } else { 
                classSugerida = "Ocultista (Graduado)";
                background = "Um brilhante académico de línguas clássicas e runas herméticas. Ao ler em voz alta uma passagem proibida num manuscrito antigo, a membrana rasgou-se para si.";
                tips = [
                    "Fale de forma sussurrada e misteriosa. Descreva o vosso herói a segurar talismãs antigos ou a desenhar runas de Conhecimento nas mãos.",
                    "Mostre um fascínio bizarro e assustador por coisas bizarras que aterrorizam os outros, querendo desenhar e catalogar as anomalias.",
                    "Assuma a vossa fragilidade física. No início do combate, recue imediatamente para trás de coberturas enquanto se concentra em canalizar rituais."
                ];
                quote = "O horror que vocês chamam de loucura incompreensível, eu chamo de física dimensional avançada.";
            }
        } else {
            if (highestStat === 'strength' || highestStat === 'constitution') {
                classSugerida = system === 'Tormenta 20' ? "Guerreiro de Valkaria" : "Guerreiro da Retaguarda";
                background = "Um veterano de infantaria imperial que desertou do exército ao perceber que lutava pela ganância de generais, preferindo proteger pessoas simples.";
                tips = [
                    "Limpe o vosso escudo ou afie a vossa espada antes dos confrontos. Isso demonstra foco mental e preparação psicológica.",
                    "Adote um código de proteção rígido: coloque-se sempre à frente de aliados fisicamente mais fracos ou feiticeiros vulneráveis.",
                    "Seja direto e prático nas vossas interações. Prefira atos e demonstrações físicas de valor a reuniões de conselho entediantes."
                ];
                quote = "O aço da minha lâmina não verga perante tiranos. E eu nunca quebro uma promessa de escudo.";
            } else if (highestStat === 'dextery' || highestStat === 'charisma') {
                classSugerida = system === 'Tormenta 20' ? "Ladino de Sszzaas" : "Bardo / Ladino Audaz";
                background = "Um talentoso artista de rua que descobriu que desvendar segredos e cofres na calada da noite rende muito mais do que os aplausos da praça municipal.";
                tips = [
                    "Brinque de forma ágil com uma moeda ou um pequeno dado pelos dedos enquanto fala com NPCs, demonstrando agilidade e carisma.",
                    "Tente resolver dilemas através do humor sarcástico ou de lábia refinada, especialmente perante lordes ou figuras de autoridade arrogantes.",
                    "Deixe sempre uma aura de dúvida no ar: o vosso herói nunca revela as suas verdadeiras intenções ou quanto ouro tem guardado nos bolsos."
                ];
                quote = "Um sorriso sincero e duas moedas de ouro bem colocadas abrem mais masmorras do que qualquer martelo de combate.";
            } else { 
                classSugerida = system === 'Tormenta 20' ? "Mago de Wynlla" : "Mago / Clérigo Erudito";
                background = "Estudante banido de uma prestigiada universidade arcana por aceder a manuscritos proibidos sobre transmutação e viagem entre planos planares.";
                tips = [
                    "Fale de forma ponderada e rica, corrigindo ligeiramente a gramática de aliados de forma cómica ou citando provérbios antigos nas fogueiras.",
                    "Consulte um livro de anotações gasto e antigo constantemente, sussurrando fórmulas matemáticas e esboçando glifos arcanos sob pressão.",
                    "Mostre um entusiasmo gigante perante ruínas antigas ou arquiteturas invulgares, parando para estudá-las mesmo sob risco de emboscada."
                ];
                quote = "A sabedoria pura é o maior feitiço deste mundo. A ignorância é o único verdadeiro abismo.";
            }
        }

        return { classSugerida, background, tips, quote };
    }
}

// ==========================================================================
// 4. VIEWS (MANIPULAÇÃO DO DOM E ELEMENTOS VISUAIS)
// ==========================================================================
class QuizView {
    static render(system, currentQuestionIndex, questions, onSelectOption) {
        const currentQuestion = questions[currentQuestionIndex];
        
        document.getElementById('quiz-system-badge').innerText = `Sistema: ${system}`;
        const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;
        document.getElementById('quiz-progress-bar').style.width = `${progressPercent}%`;
        document.getElementById('quiz-progress-text').innerText = `Pergunta ${currentQuestionIndex + 1} de ${questions.length}`;
        
        document.getElementById('quiz-question-title').innerText = currentQuestion.text;
        
        const container = document.getElementById('quiz-options-container');
        container.innerHTML = '';
        
        currentQuestion.options.forEach((option, idx) => {
            const btn = document.createElement('button');
            btn.className = "w-full text-left rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 transition-all duration-200 hover:border-amber-500/40 hover:bg-zinc-900/60 active:scale-[0.99] flex items-center justify-between group";
            btn.innerHTML = `
                <span class="text-stone-300 group-hover:text-amber-100 text-sm md:text-base pr-4 leading-relaxed">${option.text}</span>
                <span class="flex-shrink-0 w-6 h-6 rounded-full border border-zinc-700 group-hover:border-amber-500/40 flex items-center justify-center text-[10px] text-zinc-500 group-hover:text-amber-400 font-mono">${idx + 1}</span>
            `;
            btn.onclick = () => onSelectOption(option);
            container.appendChild(btn);
        });
    }
}

class ResultView {
    static renderCharacterSheet(character) {
        document.getElementById('char-name').innerText = character.name;
        document.getElementById('char-class').innerText = `Sugestão: ${character.classSugerida}`;
        document.getElementById('char-system-badge').innerText = character.system;
        document.getElementById('char-background').innerText = character.background;
        document.getElementById('char-quote').innerText = `"${character.quote}"`;

        this._renderStatsCircular(character.stats, character.system);

        const tipsContainer = document.getElementById('roleplay-tips-container');
        tipsContainer.innerHTML = '';
        character.tips.forEach((tip, idx) => {
            const tipDiv = document.createElement('div');
            tipDiv.className = "flex gap-3 items-start bg-zinc-950/40 border border-zinc-850 p-4 rounded-xl animate-fade-in";
            tipDiv.innerHTML = `
                <span class="flex items-center justify-center w-5 h-5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-mono font-bold mt-0.5">${idx + 1}</span>
                <p class="text-xs md:text-sm text-zinc-300 leading-relaxed">${tip}</p>
            `;
            tipsContainer.appendChild(tipDiv);
        });
    }

    static _renderStatsCircular(stats, system) {
        const container = document.getElementById('attributes-container');
        container.innerHTML = '';

        const keys = Object.keys(stats);
        const totalStats = keys.length;
        const radius = 80;

        // Dicionário para encurtar visualmente os rótulos do banco no gráfico circular
        const labelMap = {
            'strength': 'FOR', 'dextery': 'DES', 'agility': 'AGI',
            'constitution': 'CON', 'intelligence': 'INT', 'wisdom': 'SAB',
            'charisma': 'CAR', 'presence': 'PRE'
        };

        keys.forEach((statName, index) => {
            const angle = (index * (360 / totalStats)) * (Math.PI / 180);
            const x = Math.round(radius * Math.cos(angle));
            const y = Math.round(radius * Math.sin(angle));

            const statDiv = document.createElement('div');
            statDiv.className = "absolute flex flex-col items-center justify-center rounded-full bg-zinc-950 border-2 border-zinc-700 hover:border-amber-500 w-14 h-14 transition-all duration-300 shadow-lg group select-none cursor-help";
            statDiv.style.transform = `translate(${x}px, ${y}px)`;
            
            const displayLabel = labelMap[statName] || statName;

            statDiv.innerHTML = `
                <span class="text-[14px] font-extrabold text-stone-100 group-hover:text-amber-400 font-mono">${stats[statName]}</span>
                <span class="text-[8px] text-zinc-500 group-hover:text-amber-500 uppercase tracking-widest font-semibold">${displayLabel}</span>
            `;
            container.appendChild(statDiv);
        });

        const centerLabel = document.createElement('div');
        centerLabel.className = "absolute text-center select-none pointer-events-none";
        centerLabel.innerHTML = `
            <div class="text-[9px] text-zinc-600 font-mono uppercase tracking-widest">Atributos</div>
            <div class="text-xs font-semibold text-zinc-400">${system === 'Ordem Paranormal' ? 'NEX 5%' : 'Nível 1'}</div>
        `;
        container.appendChild(centerLabel);
    }
}

class EditStatsModalView {
    static open(tempStats, isOrdem, onAdjustStat) {
        const listContainer = document.getElementById('edit-stats-list');
        listContainer.innerHTML = '';
        
        Object.keys(tempStats).forEach(key => {
            const itemDiv = document.createElement('div');
            itemDiv.className = "flex items-center justify-between bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/80";
            
            const minVal = isOrdem ? 0 : 3;
            const maxVal = isOrdem ? 3 : 20;

            itemDiv.innerHTML = `
                <div class="flex flex-col">
                    <span class="text-sm font-bold text-stone-200 font-mono">${key.toUpperCase()}</span>
                    <span class="text-[10px] text-zinc-500 font-mono uppercase">Atributo</span>
                </div>
                <div class="flex items-center gap-3">
                    <button onclick="EditStatsModalView.triggerAdjustment('${key}', -1, ${minVal}, ${maxVal}, ${onAdjustStat})" class="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center font-bold text-lg select-none transition-colors">-</button>
                    <span id="temp-val-${key}" class="w-8 text-center text-base font-extrabold text-amber-400 font-mono">${tempStats[key]}</span>
                    <button onclick="EditStatsModalView.triggerAdjustment('${key}', 1, ${minVal}, ${maxVal}, ${onAdjustStat})" class="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center font-bold text-lg select-none transition-colors">+</button>
                </div>
            `;
            listContainer.appendChild(itemDiv);
        });

        document.getElementById('edit-stats-modal').classList.remove('hidden');
    }

    static triggerAdjustment(statKey, delta, min, max, callback) {
        const span = document.getElementById(`temp-val-${statKey}`);
        let currentVal = parseInt(span.innerText);
        let newVal = currentVal + delta;
        
        if (newVal >= min && newVal <= max) {
            span.innerText = newVal;
            callback(statKey, newVal);
        }
    }

    static close() {
        document.getElementById('edit-stats-modal').classList.add('hidden');
    }
}

class ToastView {
    static show(message) {
        const toast = document.getElementById('toast');
        document.getElementById('toast-text').innerText = message;
        toast.classList.remove('translate-y-20', 'opacity-0');
        
        setTimeout(() => {
            toast.classList.add('translate-y-20', 'opacity-0');
        }, 3000);
    }
}

// ==========================================================================
// 5. CONTROLLER (CONEXÃO DIRETA COM SECURITY TOKENS DO DJANGO)
// ==========================================================================
class AppController {
    static navigateTo(screenId) {
        document.querySelectorAll('main > div > section').forEach(section => {
            section.classList.add('hidden');
        });
        
        const activeScreen = document.getElementById(`screen-${screenId}`);
        if (activeScreen) {
            activeScreen.classList.remove('hidden');
        }
        state.currentScreen = screenId;
    }

    static selectSystem(systemName) {
        state.selectedSystem = systemName;
        state.currentQuestionIndex = 0;
        state.answers = [];
        
        this.navigateTo('quiz');
        const questions = systemName === 'Ordem Paranormal' ? ordemParanormalQuestions : dndAndTormentaQuestions;
        QuizView.render(systemName, state.currentQuestionIndex, questions, (option) => this.handleOptionSelection(option));
    }

    static handleOptionSelection(option) {
        state.answers.push(option);
        const questions = state.selectedSystem === 'Ordem Paranormal' ? ordemParanormalQuestions : dndAndTormentaQuestions;
        
        if (state.currentQuestionIndex < questions.length - 1) {
            state.currentQuestionIndex++;
            QuizView.render(state.selectedSystem, state.currentQuestionIndex, questions, (opt) => this.handleOptionSelection(opt));
        } else {
            this.executeCharacterGeneration();
        }
    }

    static async executeCharacterGeneration() {
        this.navigateTo('processing');
        
        const steps = [
            "Analisando o vosso alinhamento cósmico...",
            "Distribuindo pontos de atributos...",
            "Sugerindo dicas de interpretação teatral...",
            "Empacotando a vossa ficha de personagem..."
        ];
        let currentStep = 0;
        const titleEl = document.getElementById('processing-title');
        
        const interval = setInterval(() => {
            if (currentStep < steps.length) {
                titleEl.innerText = steps[currentStep];
                currentStep++;
            }
        }, 600);

        try {
            let characterSheet;

            if (CONFIG.usarMock) {
                characterSheet = await MockApiService.processQuizResults(state.selectedSystem, state.answers);
            } else {
                // Inclusão segura do CSRFToken nativo do Django para evitar erro 403 Forbidden
                const response = await fetch(CONFIG.apiUrl, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken') 
                    },
                    body: JSON.stringify({
                        sistema: state.selectedSystem,
                        escolhas: state.answers
                    })
                });
                characterSheet = await response.json();
            }
            
            clearInterval(interval);
            state.calculatedCharacter = characterSheet;
            
            ResultView.renderCharacterSheet(characterSheet);
            this.navigateTo('result');
        } catch (error) {
            clearInterval(interval);
            ToastView.show("Erro ao obter dados do servidor.");
            this.navigateTo('home');
        }
    }

    static openStatsEditor() {
        if (!state.calculatedCharacter) return;
        state.tempStats = { ...state.calculatedCharacter.stats };
        const isOrdem = state.selectedSystem === 'Ordem Paranormal';
        
        EditStatsModalView.open(state.tempStats, isOrdem, (key, value) => {
            state.tempStats[key] = value;
        });
    }

    static async saveStats() {
        let updatedCharacter;

        try {
            if (CONFIG.usarMock) {
                updatedCharacter = await MockApiService.recalculateFromStats(
                    state.selectedSystem,
                    state.tempStats,
                    state.calculatedCharacter.traits
                );
            } else {
                const response = await fetch(CONFIG.recalcUrl, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({
                        sistema: state.selectedSystem,
                        atributos: state.tempStats,
                        tracos: state.calculatedCharacter.traits
                    })
                });
                updatedCharacter = await response.json();
            }

            state.calculatedCharacter = updatedCharacter;
            ResultView.renderCharacterSheet(updatedCharacter);
            EditStatsModalView.close();
            ToastView.show("Ficha e dicas de interpretação recalculadas!");
        } catch (error) {
            ToastView.show("Erro ao salvar alterações.");
        }
    }

    static resetQuiz() {
        this.navigateTo('home');
    }

    static copySheetText() {
        if (!state.calculatedCharacter) return;
        const char = state.calculatedCharacter;
        let statsStr = Object.keys(char.stats).map(k => `${k.toUpperCase()}: ${char.stats[k]}`).join(' | ');
        
        const rawText = `=== FICHA DE RPG GERADA NO JORNADA ===\n` +
                         `Nome Sugerido: ${char.name}\n` +
                         `Sistema: ${char.system}\n` +
                         `Classe Sugerida: ${char.classSugerida}\n` +
                         `Atributos: ${statsStr}\n` +
                         `Antecedente: ${char.background}\n` +
                         `Bordão: "${char.quote}"\n\n` +
                         `Dicas de Roleplay:\n` +
                         char.tips.map((t, i) => `${i+1}. ${t}`).join('\n') + 
                         `\n\nFicha exportada através do Jornada RPG.`;

        const textarea = document.createElement('textarea');
        textarea.value = rawText;
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            ToastView.show("Texto da ficha copiado com sucesso!");
        } catch (err) {
            ToastView.show("Não foi possível exportar automaticamente.");
        }
        document.body.removeChild(textarea);
    }
}