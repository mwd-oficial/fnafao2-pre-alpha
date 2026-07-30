pc.script.createLoadingScreen((app) => {
    const createCss = () => {
        const css = `
            body {
                background-color: #000000;
                margin: 0;
                padding: 0;
                overflow: hidden;
            }

            #application-splash-wrapper {
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
                background-color: #000000;
                /* Centraliza o texto horizontalmente e verticalmente */
                display: flex;
                justify-content: center;
                align-items: center;
            }

            #loading-text {
                color: #ffffff;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 24px;
                font-weight: 400;
                letter-spacing: 2px;
                text-align: center;
                /* Animação suave de pulsar (opcional, dá um charme!) */
                animation: pulse 1.8s infinite ease-in-out;
            }

            @keyframes pulse {
                0% { opacity: 0.4; }
                50% { opacity: 1.0; }
                100% { opacity: 0.4; }
            }
        `;

        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    };

    const showSplash = () => {
        const wrapper = document.createElement('div');
        wrapper.id = 'application-splash-wrapper';
        document.body.appendChild(wrapper);

        // Criamos um elemento de texto simples em vez de uma tag de imagem <img>
        const loadingText = document.createElement('div');
        loadingText.id = 'loading-text';
        loadingText.textContent = 'Carregando...';
        
        wrapper.appendChild(loadingText);
    };

    const hideSplash = () => {
        const splashWrapper = document.getElementById('application-splash-wrapper');
        if (splashWrapper) {
            splashWrapper.remove();
        }
        window.parent.postMessage({acao:'parte2carregada'}, '*');
    };

    createCss();
    showSplash();

    app.on('preload:end', () => {
        app.off('preload:progress');
    });
    
    app.on('start', hideSplash);
});