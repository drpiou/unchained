import { MouseEvent, useCallback, useRef, useState } from 'react';
import './App.css';

type LangCode = keyof typeof i18n_languages;
type LangPath = keyof (typeof i18n_languages)[LangCode];

const fillOpacity = 0.9;

const DEBUG = 0;
const DEBUG_CANVAS: number = 2;

const DOWNLOADABLE = isCompatible();

const UNCHAINED_CANVAS = `${import.meta.env.VITE_APP_BASE_URL}unchained.svg`;

const i18n_languages = {
  fr: {
    click: `Clique n'importe où pour créer ton fond d'écran`,
    modal_help_title: `Aide`,
    modal_help_horizontal: `Bouge le curseur à gauche ou à droite pour changer la couleur de Unchained.`,
    modal_help_vertical: `Bouge le curseur en haut ou en bas pour changer la couleur du fond.`,
    modal_help_save: `Clique pour créer et télécharger ton fond d'écran (la dimension de ton écran est automatiquement détecté).`,
    modal_help_compatibility: `Ouvrir ce site sur Chrome ou Firefox sur Desktop pour une meilleure expérience.`,
  },
  en: {
    click: `Click anywhere to download background`,
    modal_help_title: `Help`,
    modal_help_horizontal: `Move your cursor left or right to change Unchained color.`,
    modal_help_vertical: `Move your cursor up or down to change background color.`,
    modal_help_save: `Click to download your background (your screen size is automatically detected).`,
    modal_help_compatibility: `Open this website on Chrome or Firefox on Desktop for a better experience.`,
  },
}

function App() {
  const [dropShadow, setDropShadow] = useState(300);
  const [backgroundColor, setBackgroundColor] = useState('121212');
  const [modalVisible, setModalVisible] = useState(false);
  const [langCode, setLangCode] = useState<LangCode>('en');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const t = i18n(langCode);

  const onMouseMove = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const screenHeightHalf = screenHeight / 2;

    const pageX = event.pageX;
    const pageY = event.pageY;

    const x = ((pageX) * 360) / (screenWidth);

    const rgbThreshold = screenHeight / 3;
    const rgbThreshold2 = 2 * rgbThreshold;
    const rgbRatio = 255 / rgbThreshold;
    const rgbPage = pageY * rgbRatio;

    const r = Math.ceil(pageY < rgbThreshold ? rgbPage : 255);
    const g = Math.ceil(pageY < rgbThreshold ? 0 : pageY < rgbThreshold2 ? (rgbPage - 255) : 255);
    const b = Math.ceil(pageY < rgbThreshold2 ? 0 : (rgbPage - 511));

    const color = `${('0' + r.toString(16)).slice(-2)}${('0' + g.toString(16)).slice(-2)}${('0' + b.toString(16)).slice(-2)}`;

    setDropShadow(x);
    setBackgroundColor(color);

    document.documentElement.style.setProperty('--color', pageY > screenHeightHalf ? '#121212' : '#ffffff');
    document.documentElement.style.setProperty('--color-youtube', pageY > screenHeightHalf || pageY < 127 ? '#ff0000' : '#ffffff');
  }, []);

  const onSave = () => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    const scale = window.devicePixelRatio;

    const screenWidth = screen.width;
    const screenHeight = screen.height;

    canvas.style.width = `${screenWidth}px`;
    canvas.style.height = `${screenHeight}px`;

    if (DEBUG && DEBUG_CANVAS) {
      canvas.style.opacity = '1';
      canvas.style.transform = 'translateY(9.5%)';

      if (svgRef.current && DEBUG_CANVAS === 2) {
        svgRef.current.style.opacity = '0';
      }
    }

    const canvasWidth = Math.floor(screenWidth * scale);
    const canvasHeight = Math.floor(screenHeight * scale);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.fillStyle = `#${backgroundColor}`;
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    const img = new Image();

    img.onload = function() {
      const imgFactor = 0.8;
      const imgRatio = img.naturalWidth / img.naturalHeight;

      const dH = (canvasHeight / 2) * imgFactor;
      const dW = dH * imgRatio;

      const dX = (canvasWidth / 2) - (dW / 2);
      const dY = (canvasHeight / 2) - (dH / 2);

      context.filter = `drop-shadow(0 0 5em hsl(${dropShadow}, 100%, 60%))`;
      context.drawImage(img, dX, dY, dW, dH);

      const downloadUrl = canvas.toDataURL('image/jpeg').replace('image/jpeg', 'image/octet-stream');

      if (!DEBUG) {
        download(downloadUrl);
      }
    };

    img.src = UNCHAINED_CANVAS;
  }

  const onModalOpen = useCallback(() => {
    setModalVisible(true);
  }, []);

  const onModalClose = useCallback(() => {
    setModalVisible(false);
  }, []);

  const onLanguageChange = useCallback((language: LangCode) => {
    return () => setLangCode(language);
  }, []);

  return (
    <>
      <div id="app" style={{ backgroundColor: `#${backgroundColor}` }} onMouseMove={onMouseMove} onClick={DOWNLOADABLE ? onSave : undefined}>
        <svg ref={svgRef} style={{ filter: `drop-shadow(0 0 1.5em hsl(${dropShadow}, 100%, 60%))` }} width="255" height="399" viewBox="0 0 255 399" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M33 0H0V250.5L33 217.5V0Z" fill="white" fillOpacity={fillOpacity}/>
          <path d="M96 0H63L64 186L96 154V0Z" fill="white" fillOpacity={fillOpacity}/>
          <path d="M96 201.5L3 295L13.5 326.5L63.5 279C63.5 290.5 81 334 129 334C177 334 191 284.5 191 279V164L158 131V279C158 286.5 148.2 301 129 301C109.8 301 96 288 96 279V201.5Z" fill="white" fillOpacity={fillOpacity}/>
          <path d="M59 337L35.5 359.5C47 373 76.5 398.5 125.5 398.5C201.126 398.5 237.5 345.5 248.5 310L222.5 284.5C209.5 341.5 166 366 125.5 366C96 366 67 348 59 337Z" fill="white" fillOpacity={fillOpacity}/>
          <path d="M255 272L221.5 236V148L158 85V0H191V74.5L255 137.5V272Z" fill="white" fillOpacity={fillOpacity}/>
          <path d="M221.5 57.5L255 91.5V0H221.5V57.5Z" fill="white" fillOpacity={fillOpacity}/>
        </svg>
        <div id="links" className="font-shadow">
          <a href="https://youtube.com/@UnchainedOff" target="_blank" onClick={stopPropagation}>YouTube</a>

          {DOWNLOADABLE ? <span>{t('click')}</span> : <br />}

          <div id="help-content">
            <div id="help" className="icon" onClick={withStopPropagation(onModalOpen)}>
              <span>H</span>
            </div>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} id="canvas"></canvas>

      {modalVisible && (
        <div className="modal">
          <div className="modal-content">
            <div className="p-box">
              <p className="title">{t('modal_help_title')}</p>

              {DOWNLOADABLE ? (
                <>
                  <p>{t('modal_help_horizontal')}</p>
                  <p>{t('modal_help_vertical')}</p>
                  <p>{t('modal_help_save')}</p>
                </>
              ) :
                <p>{t('modal_help_compatibility')}</p>
              }
            </div>
            <div className="modal-close icon" onClick={onModalClose}>
              <span>&times;</span>
            </div>
            <div id="languages">
              <span className={langCode === 'fr' ? 'active' : undefined} onClick={onLanguageChange('fr')}>FR</span>
              <span> / </span>
              <span className={langCode === 'en' ? 'active' : undefined} onClick={onLanguageChange('en')}>EN</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function download(url: string) {
  const link = document.createElement('a');

  link.download = 'unchained-background.jpg';
  link.href = url;

  link.click();
}

function stopPropagation(event: MouseEvent) {
  event.stopPropagation();

  return false;
}

function withStopPropagation<Callback extends (event: MouseEvent, ...args: unknown[]) => unknown>(callback: Callback) {
  return (event: MouseEvent) => {
    callback(event);

    stopPropagation(event);
  }
}

function isCompatible() {
  const userAgent = navigator.userAgent;

  const isChrome = userAgent.match(/chrome|chromium|crios/i);
  const isSafari = userAgent.match(/safari/i);

  const isMobile = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i
  ].some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  })

  return (isChrome || !isSafari) && !isMobile;
}

function i18n(langCode: LangCode) {
  return (path: LangPath) => {
    return i18n_languages[langCode]?.[path] ?? `[${langCode}.${path}]`;
  }
}

export default App
