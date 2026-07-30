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
const bloqueioTelaInicial = document.querySelector("#bloqueio-tela-inicial")

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
                prepararParte1();
                break;
            case 'parte1carregada':
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

function prepararParte1() {
    iframe.style.opacity = 0;
    iframe.style.filter = "blur(100px)"
    bloqueioTelaInicial.style.display = "block"
    iframe.src = construirUrl("./parte1/index.html");
    setTimeout(() => {
        iframe.style.transitionDuration = "10s"
    }, 500);
}

function irParte1() {
    garantirListenerInicial();
    iframe.style.opacity = 1;
    iframe.style.filter = "blur(0px)"
    setTimeout(() => {
        bloqueioTelaInicial.style.display = "none"
        setTimeout(() => {
            iframe.style.transitionDuration = "0s"
        }, 2000 + 100);
    }, 8000 + 100);
}

function prepararParte2() {
    iframe.style.opacity = 0;
    setTimeout(() => {
        iframe.style.transitionDuration = "5s"
    }, 500);
    setTimeout(() => {
        iframe.src = construirUrl("./parte2/index.html");
    }, 6000);
}

function irParte2() {
    garantirListenerInicial();
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
        iframe.style.transitionDuration = "0s"
    }, 2000 + 100);
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
    prepararParte1();
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

bloqueioTelaInicial.addEventListener("click", function () {
    launchFullscreen(document.documentElement);
});
function anexarListenerDeClique() {
    try {
        iframe.contentWindow.document.addEventListener("click", function () {
            launchFullscreen(document.documentElement);
        });
    } catch (e) {
        console.error("Erro ao anexar listener de clique:", e);
    }
}

function garantirListenerInicial() {
    try {
        if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
            anexarListenerDeClique();
        } else {
            iframe.addEventListener('load', anexarListenerDeClique, { once: true });
        }
    } catch (e) {
        iframe.addEventListener('load', anexarListenerDeClique, { once: true });
    }
}

garantirListenerInicial();

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