/*
__loading__.js da parte 2
const hideSplash = () => {
    const splashWrapper = document.getElementById('application-splash-wrapper');
    if (splashWrapper) {
        splashWrapper.remove();
    }
    window.parent.postMessage({acao:'parte2carregada'}, '*');
};

__game-scripts.js
setTimeout((()=>{window.location.reload()}
para
setTimeout((()=>{window.parent.postMessage({acao:'parte1'}, '*');}
ou
setTimeout((()=>{window.parent.postMessage({acao:'parte2'}, '*');}
*/

const iframe = document.querySelector('iframe');
const cursorNoneDiv = document.querySelector("#cursor-none-div")

function pausarJogo() {
    if (iframe.src.includes("iframe/index.html")) return
    try {
        const app = iframe.contentWindow.pc.Application.getApplication();
        if (app) {
            app.timeScale = 0;
            if (app.systems && app.systems.sound && app.systems.sound.context) {
                app.systems.sound.context.suspend();
            }
        }
    } catch (e) {
        console.error("Erro ao pausar o jogo:", e);
    }
}

function retomarJogo() {
    if (iframe.src.includes("iframe/index.html")) return
    try {
        const app = iframe.contentWindow.pc.Application.getApplication();
        if (app) {
            app.timeScale = 1;
            if (app.systems && app.systems.sound && app.systems.sound.context) {
                app.systems.sound.context.resume();
            }
        }
    } catch (e) {
        console.error("Erro ao retomar o jogo:", e);
    }
}

window.addEventListener('message', function (event) {
    const dados = event.data;
    if (dados) {
        switch (dados.acao) {
            case 'parte1':
                irParte1();
                break;
            case 'parte2':
                prepararParte2();
                break;
            case 'parte2carregada':
                irParte2();
                break;
        }
    }
})

// --- Qualidade gráfica ---
let qualidadeEscolhida = null;
let parte2Carregada = false;

function construirUrl(urlBase) {
    var separador = urlBase.indexOf('?') === -1 ? '?' : '&';
    return urlBase + separador + 'quality=' + qualidadeEscolhida;
}

function irParte1() {
    iframe.style.opacity = 0;
    iframe.src = construirUrl("./parte1/index.html");
    setTimeout(() => {
        iframe.style.opacity = 1;
    }, 250);
}

function prepararParte2() {
    iframe.style.opacity = 0;
    cursorNoneDiv.style.display = "block"
    setTimeout(() => {
        iframe.style.transitionDuration = "2s"
    }, 10);
    setTimeout(() => {
        iframe.src = construirUrl("./parte2/index.html");
    }, 6000);
}

function irParte2() {
    const canvas = pegarCanvasDoIframe();
    if (canvas) {
        canvas.focus();
        canvas.requestPointerLock();
    } else {
        // fallback, caso o canvas ainda não exista nesse instante
        iframe.requestPointerLock();
    }

    iframe.style.opacity = 1;
    setTimeout(() => {
        iframe.style.transitionDuration = "0.01s"
        cursorNoneDiv.style.display = "none"
    }, 2000 + 10);
}

function pegarCanvasDoIframe() {
    try {
        return iframe.contentDocument.querySelector('canvas');
    } catch (e) {
        console.error("Erro ao acessar canvas do iframe:", e);
        return null;
    }
}

const telaQualidade = document.querySelector("#tela-qualidade");

function mostrarEscolhaQualidade() {
    telaCheiaEl.style.display = "none";
    telaQualidade.style.display = "flex";
}

function escolherQualidade(qualidade) {
    qualidadeEscolhida = qualidade;
    telaQualidade.style.display = "none";
    irParte1();
}

document.querySelector("#btn-baixa").addEventListener("click", function () {
    escolherQualidade("low");
});

document.querySelector("#btn-alta").addEventListener("click", function () {
    escolherQualidade("high");
});

// --- Tela cheia ---
const isCelular = (navigator.userAgentData !== undefined && navigator.userAgentData.mobile) || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
//isCelular = true

if (isCelular) {
    document.querySelector("#tela-cheia > p").innerHTML = "Para uma melhor experiência, <br> toque para ativar a tela cheia"
}

const telaCheiaEl = document.querySelector("#tela-cheia")
function launchFullscreen(element) {
    telaCheiaEl.style.display = "none"
    setTimeout(() => {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) { // Firefox
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) { // Chrome, Safari and Opera
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { // IE/Edge
            element.msRequestFullscreen();
        }
    }, 1);
}

iframe.addEventListener('load', () => {
    iframe.contentWindow.document.addEventListener("click", function () {
        launchFullscreen(document.documentElement); // a página inteira
    })
})

document.addEventListener("fullscreenchange", function () {
    if (document.fullscreenElement) {
        if (!qualidadeEscolhida) {
            mostrarEscolhaQualidade();
        } else {
            telaCheiaEl.style.display = "none"
            if (!algumaTelaDeOverlayVisivel()) {
                retomarJogo()
            }
        }
    } else {
        telaCheiaEl.style.display = "flex"
        telaQualidade.style.display = "none"
        pausarJogo()
    }
})

const telaViraLandscape = document.querySelector("#tela-vira-landscape")

// --- Função central: existe alguma div cobrindo o iframe agora? ---
function algumaTelaDeOverlayVisivel() {
    return (
        !document.fullscreenElement ||
        telaQualidade.style.display === "flex" ||
        telaViraLandscape.style.display === "flex"
    );
}

// --- Reforça a pausa quando a aba volta a ficar visível/focada,
// mas alguma tela de overlay ainda está cobrindo o jogo ---
function reforcarPausaSeNecessario() {
    if (algumaTelaDeOverlayVisivel()) {
        setTimeout(pausarJogo, 10);
    }
}

document.addEventListener("visibilitychange", reforcarPausaSeNecessario);
window.addEventListener("focus", reforcarPausaSeNecessario);
window.addEventListener("pageshow", reforcarPausaSeNecessario);

window.addEventListener("resize", verificaOrientacao)
window.addEventListener("orientationchange", function () {
    setTimeout(verificaOrientacao, 100);
});

function verificaOrientacao() {
    var portrait = window.innerHeight > window.innerWidth
    if (portrait) {
        telaViraLandscape.style.display = "flex"
        pausarJogo()
    } else {
        telaViraLandscape.style.display = "none"
        if (!algumaTelaDeOverlayVisivel()) {
            retomarJogo()
        }
    }
}
verificaOrientacao()