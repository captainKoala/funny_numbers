"use strict";

document.addEventListener('DOMContentLoaded', event => {
    const WINDOW_WIDTH = window.innerWidth;
    const WINDOW_HEIGHT = window.innerHeight;

    const ROWS_COUNT = 10;
    const COLUMNS_COUNT = 7;
    const STEPS_BLOCKS_ADDITION_INTERVAL = 3;
    const POINTS_STEP = 5;
    const POINTS_PENALTY = -5;

    const BLOCK_SIZE_DEFAULT = 30;

    // https://color.romanuke.com/
    const COLOR_SCHEMES = [
        {
            main_dark: '#0e1821',
            accent_dark: '#44535e',
            accent_light: '#798f8c',
            main_light: '#d9ebe9',
            accent_high: '#aa4444'
        },
        {
            main_dark: '#513e5c',
            accent_dark: '#02334a',
            accent_light: '#a9bcc6',
            main_light: '#dff2f5',
            accent_high: '#aa6666'
        },
        {
            main_dark: '#afbaa3',
            accent_dark: '#d0d0b8',
            accent_light: '#40817a',
            main_light: '#003b32',
            accent_high: '#aa4444'
        },
        {
            main_dark: '#333333',
            accent_dark: '#000000',
            accent_light: '#aaaaaa',
            main_light: '#ffffff',
            accent_high: '#aa0000'
        },
    ];
    let colorSchemeNumber = 2;

    let blockStyles = {
        width: BLOCK_SIZE_DEFAULT,
        height: BLOCK_SIZE_DEFAULT,
    };

    let colors = {
        main_dark: '#000',
        accent_dark: '#555',
        accent_light: '#aaa',
        main_light: '#fff',
        accent_high: '#a33'
    };

    let gamePosition = [];
    let exampleGamePosition = [];
    let stepsToBlocksAddition = STEPS_BLOCKS_ADDITION_INTERVAL;
    let tip, scorePenalty, scoreCoefficient, isPlayingGame;
    let score = 0;
    let steps = 0;
    let record = 0;
    let isPlayMusic = true;
    let isPlaySounds = true;

    let numBlockFontSize = 16;
    let generalFontSize = 10;

    const loading = document.querySelector('.loading');

    const screens = document.querySelectorAll('.screen');
    const startScreen = document.querySelector('.start-screen');
    const gameScreen = document.querySelector('.game-screen');
    const howToPlayScreen = document.querySelector('.how-to-play-screen');
    const settingsScreen = document.querySelector('.settings-screen');
    const aboutGameScreen = document.querySelector('.about-screen');

    const startMenuBtns = document.querySelectorAll('.startmenu-btn');
    const newGameBtn = document.querySelector('.start-game-btn');
    const howToPlayBtn = document.querySelector('.how-to-play-btn');
    const settingsBtn = document.querySelector('.settings-btn');
    const aboutGameBtn = document.querySelector('.about-btn');

    const backBtns = document.querySelectorAll('.back-btn');

    const statusBar = document.querySelector('.status-bar');
    const gameField = document.querySelector('#gamefield');
    const gameControls = document.querySelector('.game-controls');

    const addNumbersBtn = document.querySelector('.new-numbers svg');
    const tipBtn = document.querySelector('.tip-btn svg');
    const restartnBtn = document.querySelector('.restart svg');
    const menuBtn = document.querySelector('.menu-btn svg');
    const scoreBar = document.querySelector('.score');
    const stepsBar = document.querySelector('.steps');
    const recordBar = document.querySelector('.record');

    const exampleGameField = document.querySelector('#example-gamefield');
    let exampleGameSlide = 0;

    const colorSchemesDiv = document.querySelector('.color-scheme-list');
    let colorSchemeLabels = [];
    let colorSchemeRadios = [];

    let radioImgs = document.querySelectorAll('.radiobutton');
    let checkboxImgs = document.querySelectorAll('.checkbox');


    const getRandomIntInclusive = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min; //Максимум и минимум включаются
    };

    const clickStartGame = () => {
        if (sessionStorage.getItem('fnumGamePosition')) {
            loadSessionGameInfo();
            startGame(false);
            showScreen(gameScreen);
        } else if (localStorage.getItem('fnumGamePosition')) {
            showMessage('Хотите продолжить уже начатую игру?', 'Продолжить',
                () => {
                    loadGameInfo();
                    startGame(false);
                    showScreen(gameScreen);
                },'Начать заново',() => {
                clearSavings();
                startGame();
                showScreen(gameScreen);
                checkGameStatus();
                refreshBlocksStyles();
            });
        } else {
            startGame();
            showScreen(gameScreen);
        }
    };

    const showScreen = (showedScreen) => {
        for (let screen of screens) {
            screen.style.display = 'none';
            screen.style.visibility = 'hidden';
        }
        showedScreen.style.display = 'block';
        showedScreen.style.visibility = 'visible';
    };

    /*   СООБЩЕНИЕ   */
    const showMessage = (msgText, msgBtn1, msgFunction1, msgBtn2=null, msgFunction2=null) => {
        let message = document.createElement('div');
        message.classList.add('message');

        let messageText = document.createElement('div');
        messageText.classList.add('message-text');
        messageText.textContent = msgText;
        message.appendChild(messageText);

        let messageButtons = document.createElement('div');
        messageButtons.classList.add('message-btns');
        let messageBtn1 = document.createElement('div');
        messageBtn1.classList.add('message-btn');
        messageBtn1.classList.add('message-btn-1');
        messageBtn1.textContent = msgBtn1;
        messageBtn1.addEventListener('click', msgFunction1);
        messageBtn1.addEventListener('click', event => {
            message.remove();
        });
        messageButtons.appendChild(messageBtn1);

        let messageWidth = blockStyles.width * COLUMNS_COUNT;

        message.style.width = messageWidth + 'px';
        message.style.backgroundColor = colors.main_light;
        message.style.borderColor = colors.main_dark;
        messageBtn1.style.backgroundColor = colors.accent_dark;
        messageBtn1.style.color = colors.main_light;
        messageBtn1.style.width = messageWidth / 2 - 10 + 'px';

        if (msgBtn2) {
            let messageBtn2 = document.createElement('div');

            messageBtn2.addEventListener('click', event => {
                message.remove();
            });
            messageBtn2.classList.add('message-btn');
            messageBtn2.classList.add('message-btn-2');
            messageBtn2.textContent = msgBtn2;
            messageBtn2.addEventListener('click', msgFunction2);
            messageBtn2.style.backgroundColor = colors.accent_dark;
            messageBtn2.style.color = colors.main_light;
            messageBtn2.style.width = messageWidth / 2 - 10 + 'px';

            messageButtons.appendChild(messageBtn2);
        }

        message.appendChild(messageButtons);

        document.body.appendChild(message);

        message.style.marginLeft = -messageWidth / 2 + 'px';
        message.style.marginTop = -message.offsetHeight / 2 + 'px';

    };

    /*   СТИЛИ   */
    const setGameFieldStyles = () => {
        colors = COLOR_SCHEMES[colorSchemeNumber];

        document.body.style.backgroundColor = colors.accent_dark;
        document.body.style.color = colors.main_dark;
        document.body.style.fontSize = generalFontSize + 'px';

        for (let screen of screens) {
            screen.style.backgroundColor = colors.main_light;
            screen.style.borderColor = colors.main_light;
        }

        for (let btn of startMenuBtns) {
            btn.style.backgroundColor = colors.accent_dark;
            btn.style.color = colors.main_light;
        }

        statusBar.style.backgroundColor = colors.accent_dark;
        statusBar.style.color = colors.main_light;
        gameControls.style.backgroundColor = colors.accent_dark;


        addNumbersBtn.style.fill = colors.main_light;
        tipBtn.style.fill = colors.main_light;
        restartnBtn.style.fill = colors.main_light;
        menuBtn.style.fill = colors.main_light;

        blockStyles.backgroundColor = colors.main_light;
        blockStyles.backgroundColorSelected = colors.accent_dark;
        blockStyles.backgroundColorTip = colors.accent_light;

        blockStyles.borderColor = colors.main_dark;
        blockStyles.borderColorSelected = colors.accent_dark;

        blockStyles.textColor = colors.main_dark;
        blockStyles.textColorSelected = colors.main_light;
        blockStyles.textColorTip = colors.accent_dark;


        let i = 0;
        for (let label of colorSchemeLabels) {
            label.style.background = `linear-gradient(90deg, ${COLOR_SCHEMES[i].main_dark} 0%, ${COLOR_SCHEMES[i].main_dark} 24%, ${COLOR_SCHEMES[i].main_light} 25%, ${COLOR_SCHEMES[i].main_light} 49%, ${COLOR_SCHEMES[i].accent_light} 50%, ${COLOR_SCHEMES[i].accent_light} 75%, ${COLOR_SCHEMES[i].accent_dark} 76%, ${COLOR_SCHEMES[i].accent_dark} 100%)`;
            i++;
        }

        for (let radio of radioImgs) {
            radio.style.fill = colors.main_dark;
        }

        for (let checkbox of checkboxImgs) {
            checkbox.style.fill = colors.main_dark;
        }
    };

    const setNumberBlockStyles = numberBlock => {
        numberBlock.style.width = blockStyles.width + 'px';
        numberBlock.style.height = blockStyles.height + 'px';
        numberBlock.style.backgroundColor = blockStyles.backgroundColor;
        numberBlock.style.borderColor = blockStyles.borderColor;
        numberBlock.style.fontSize = numBlockFontSize + 'px';
    };

    const chooseColorScheme = (schemeNumber) => {
        colorSchemeNumber = schemeNumber;
        colors = COLOR_SCHEMES[colorSchemeNumber];
        setGameFieldStyles();
        saveSettings();
    };

    const calcGameElementsSizes = () => {
        /* вычисление размеров элементов игры  */

        // по 1,5х высоты блока оставляем на панели сверху и снизу (3х)
        let blockSize = Math.min(Math.floor(WINDOW_HEIGHT / (ROWS_COUNT + 3)),
            Math.floor(WINDOW_WIDTH / COLUMNS_COUNT));

        let baseWidth = blockSize * COLUMNS_COUNT + 1;
        let baseHeight = blockSize * (ROWS_COUNT + 3);

        // размеры числового блока
        blockStyles.width = blockSize - 1;
        blockStyles.height = blockSize - 1;

        // размеры верхней панели
        statusBar.style.width = baseWidth + 2 + 'px';
        statusBar.style.height = 1.25 * blockSize + 'px';
        statusBar.style.fontSize = 0.8 * blockSize + 'px';

        // размеры игрового поля
        gameField.style.width = baseWidth + 2 + 'px';
        gameField.style.height = baseHeight - 2.5 * blockSize + 'px';

        // размеры нижней панели
        gameControls.style.width = baseWidth + 2 + 'px';
        gameControls.style.height = WINDOW_HEIGHT - (1.25 * blockSize) - (baseHeight - 2.5 * blockSize)  + 'px';

        // размеры игрового поля - примера игры
        exampleGameField.style.width = baseWidth + 2 + 'px';
        exampleGameField.style.height = 4.5 * blockSize +'px';

        // размеры шрифтов
        numBlockFontSize = 0.8 * blockSize;
        generalFontSize = 0.4 * blockSize;

        // размеры всех экранов
        for (let screen of screens) {
            screen.style.width = baseWidth + 4 + 'px';
            screen.style.height = WINDOW_HEIGHT  + 'px';
        }

        // размеры кнопок в главном меню
        for (let btn of startMenuBtns) {
            btn.style.height = blockStyles.height + 'px';
            btn.style.lineHeight = blockStyles.height + 'px';
            btn.style.fontSize = 0.5 * blockSize + 'px';
        }
    };

    /*   ИГРА   */
    const calcScoreCoefficient = (blocksCount) => {
        if (blocksCount <=2 ) return 1;
        if (blocksCount <= 4) return 1.1;
        if (blocksCount <= 6) return 1.3;
        if (blocksCount <= 8) return 1.5;
        return 2;
    };

    const deleteNumberBlock = (numberBlock, position) => {
        let numberBlocksParent = numberBlock.parentElement;
        numberBlock.classList.remove('selected');
        numberBlock.classList.add('removing');
        numberBlock.style.height = 0;

        position[numberBlock.getAttribute('data-colnumber')].splice(numberBlock.getAttribute('data-elemnumber'), 1);


        refreshBlocksStyles();

        let i = 0;
        for (let number of numberBlocksParent.children) {
            if (!number.classList.contains('removing')) {
                number.setAttribute('data-elemnumber', i);
                i++;
            } else {
                number.setAttribute('data-elemnumber', 'null')
            }
        }
        numberBlocksParent.setAttribute('data-elemscount', i);

        let tipBlocks = gameField.querySelectorAll('.tip');
        for (let tipBlock of tipBlocks) {
                tipBlock.classList.remove('tip');
        }

        setTimeout(() => numberBlock.remove(), 1000);
    };

    const isMutualsValues = (value1, value2) => {
        /* проверяет, являются ли числа value1, value2 равными или дающими в сумме 10 */
        value1 = +value1;
        value2 = +value2;
        return (value1 + value2) === 10 || value1 === value2;
    };

    const isMutualSequence = (sequence) => {
        let opened = [];
        for (let number of sequence) {
            if (opened.length === 0 || !isMutualsValues(opened[opened.length - 1], number)) {
                opened.push(number);
            } else {
                opened.pop();
            }
        }
        return opened.length === 0
    };

    const clearMutuals = (blocks) => {
        /* удаление блоков из массива blocks */

        for (let block of blocks) {
            deleteNumberBlock(block, gamePosition);
        }

        scoreCoefficient = calcScoreCoefficient(blocks.length);
        score += scoreCoefficient * POINTS_STEP * blocks.length + scorePenalty;
        scoreCoefficient = 1;
        scorePenalty = 0;

        // до следующего падения блоков
        stepsToBlocksAddition--;
    };

    const isMutuals = (block1, block2, clear=false) => {
        /* проверяет является ли последовательность блоков между block1 и block2 подходящей под сокращение
           если clear = true, то блоки удаляются
         */

        // если один из блоков null или ссылка на один и тот же блок
        if (!block1 || !block2 || block1 === block2) return false;

        // определяем номер колонки и строки блока
        let block1ColNumber = +block1.getAttribute('data-colnumber');
        let block1ElemNumber = +block1.getAttribute('data-elemnumber');
        let block2ColNumber = +block2.getAttribute('data-colnumber');
        let block2ElemNumber = +block2.getAttribute('data-elemnumber');
        let blocks = [];
        let numbers = [];

        // если блоки не в одной строке и не в одном столбце
        if (block1ColNumber !== block2ColNumber && block1ElemNumber !== block2ElemNumber) return false;

        // проходим по всем блокам между block1 block2 и добавляем их в blocks, а числа из них в numbers
        for (let i = Math.min(block1ElemNumber, block2ElemNumber); i <= Math.max(block1ElemNumber, block2ElemNumber); i++) {
            for (let j = Math.min(block1ColNumber, block2ColNumber); j <= Math.max(block1ColNumber, block2ColNumber); j++) {
                let blockNumber = gameField.querySelector(`.number[data-elemnumber="${i}"][data-colnumber="${j}"]`);
                if (blockNumber) {
                    blocks.push(blockNumber);
                    numbers.push(+blockNumber.textContent);
                }
            }
        }

        // проверяем, следует ли последовательность чисел сокращать
        if (isMutualSequence(numbers)) {
            // удаляем блоки при необходимости
            if (clear) {
                clearMutuals(blocks);
                steps++;
            }
            return true;
        }

        return false;
    };

    const isGameStepExist = () => {
        /* проверка на существование хода */
        tip = [];
        for (let i = 0; i < COLUMNS_COUNT; i++) {
            let currentCol = gameField.querySelector('.column-' + i);
            for (let j = 0; j < currentCol.getAttribute('data-elemscount'); j++) {
                let currentElem = gameField.querySelector(`.number[data-elemnumber="${j}"][data-colnumber="${i}"]`);
                let nextElem = gameField.querySelector(`.number[data-elemnumber="${j + 1}"][data-colnumber="${i}"]`);
                if (isMutuals(currentElem, nextElem)) {
                    tip.push([i, j]);
                    tip.push([i, j + 1]);
                    return true;
                }

                for (let k = i + 1; k < COLUMNS_COUNT; k++) {
                    nextElem = gameField.querySelector(`.number[data-elemnumber="${j}"][data-colnumber="${k}"]`);
                    if (!nextElem) continue;
                    if (isMutuals(currentElem, nextElem)) {
                        tip.push([i, j]);
                        tip.push([k, j]);
                        return true
                    } else break;
                }
            }
        }
        return false;
    };

    const addRandomNumbers = (field, position, saving=true) => {
        let columns = field.querySelectorAll('.column');

        for (let i = 0; i < columns.length; i++) {
            let newNumber = getRandomIntInclusive(1, 9);
            createNumberBlock(position[i].length, i, columns[i], newNumber);
            position[i].push(newNumber);
        }

        if (saving) saveGameInfo();
    };

    const checkGameStatus = () => {
        let lastRowBlocks = gameField.querySelectorAll(`.number[data-elemnumber="${ROWS_COUNT}"]`);
        if (lastRowBlocks.length) {
            if (record < score) {
                record = score;
                saveGameInfo();
            }

            showMessage(`Игра окончена! За ${steps} ходов набрано ${score} очков.\nНачать заново?`,
                'Да', () => {
                startGame();
                },
                'Отмена', () => {
                clickMenuBtn();
                clearSavings();
            });
            isPlayingGame = false;
            return;
        }

        // подсвечиваем кнопку добавления новых чисел, если больше нет ходов
        if (isGameStepExist()) {
            addNumbersBtn.classList.remove('attention')
        } else {
            addNumbersBtn.classList.add('attention')
        }
        refreshBlocksStyles();
    };

    const refreshBlocksStyles = () => {
        const blocks = document.querySelectorAll('.number');
        const selectedBlocks = document.querySelectorAll('.selected');
        const tipBlocks = document.querySelectorAll('.tip');

        for (let block of blocks) {
            block.style.backgroundColor = blockStyles.backgroundColor;
            block.style.borderColor = blockStyles.borderColor;
            block.style.color = blockStyles.textColor;
        }

        for (let block of tipBlocks) {
            block.style.backgroundColor = blockStyles.backgroundColorTip;
            block.style.color = blockStyles.textColorTip
        }

        for (let block of selectedBlocks) {
            block.style.borderColor = blockStyles.borderColorSelected;
            block.style.backgroundColor = blockStyles.backgroundColorSelected;
            block.style.color = blockStyles.textColorSelected;
        }

        addNumbersBtn.style.fill = addNumbersBtn.classList.contains('attention') ? colors.accent_high : colors.main_light;
    };

    const clearGameField = (field) => {
        while (field.children.length) {
            field.lastElementChild.remove();
        }
    };

    const generateGamePosition = () => {
        gamePosition = [];
        for (let i = 0; i < COLUMNS_COUNT; i++) {
            let col = [];
            for (let j = 0; j < Math.abs(i - COLUMNS_COUNT / 2 + 0.5) ; j++) {
                col.push(getRandomIntInclusive(1, 9));
            }
            gamePosition.push(col);
        }
    };

    const createNumberBlock = (elemNumber, dataColnumber, col, value, example=false) => {
        /* добавление числового блока со значением value в указанную колонку dataColnumber */

        let divNumber = document.createElement('div');
        divNumber.classList.add('number');

        divNumber.classList.add('new-block');

        divNumber.textContent = value;
        if (!example) divNumber.addEventListener('click', clickNumber);

        divNumber.setAttribute('data-colnumber', dataColnumber);

        divNumber.setAttribute('data-elemnumber', elemNumber);

        // добавляем стили блоку
        setNumberBlockStyles(divNumber);

        col.setAttribute('data-elemscount', +col.getAttribute('data-elemscount') + 1);

        col.appendChild(divNumber);
        setTimeout(() => {
            divNumber.classList.remove('new-block');
        }, 50);
    };

    const createGameLevel = (field, position, example=false) => {
        /* создание игрового уровня */

        // создание колонок
        for (let i = 0; i < COLUMNS_COUNT; i++) {
            let col = document.createElement('div');
            col.classList.add('column');
            col.classList.add('column-' + i);
            col.setAttribute('data-elemscount', position[i].length);

            col.style.width = blockStyles.width + 1 + 'px';

            field.appendChild(col);

            // создание цифровых блоков
            for (let j = 0; j < position[i].length; j++) {
                createNumberBlock(j, i, col, position[i][j], example)
            }
        }
    };

    const createExampleGameLevel = () => {
        let exampleText = document.querySelector('.how-to-play-message');
        const exampleMessages = [
            'Выделяйте стоящие подряд на одной линии блоки с одинаковыми цифрами, либо с цифрами в сумме дающими 10',
            'Можно убирать целые последовательности',
            'Каждые ' + STEPS_BLOCKS_ADDITION_INTERVAL + ' хода добавляется новый ряд цифровых блоков',
            'Игра закончится, если высота одного из столбиков достигнет верхнего края'
        ];

        let startExampleGamePosition = [
            [4, 9, 1],
            [2],
            [3, 2],
            [3],
            [6, 8, 3]
        ];
        while (startExampleGamePosition.length < COLUMNS_COUNT) {
            startExampleGamePosition.push([getRandomIntInclusive(1, 9)]);
        }

        exampleGameSlide = 1;

        const selectBlockPromise = (colNumber, elemNumber, delay) => {
            return new Promise((resolve, reject) => {
                let block = exampleGameField.querySelector(`[data-colnumber="${colNumber}"][data-elemnumber="${elemNumber}"]`);
                setTimeout(() => {
                    block.classList.add('selected');
                    refreshBlocksStyles();
                    resolve();
                }, delay);
            })
        };

        const deleteBlockPromise = (blocks, delay) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    for (let blockCoords of blocks) {
                        let block = exampleGameField.querySelector(`[data-colnumber="${blockCoords[0]}"][data-elemnumber="${blockCoords[1]}"]`);
                        deleteNumberBlock(block, exampleGamePosition);
                    }
                    resolve();
                }, delay)
            })
        };


        let timer = setTimeout(function tick() {
            new Promise((resolve, reject) => {
                exampleGamePosition = startExampleGamePosition.map(elem => elem.slice());

                clearGameField(exampleGameField);
                createGameLevel(exampleGameField, exampleGamePosition, true);
                exampleText.textContent = exampleMessages[exampleGameSlide - 1];
                resolve();
            })
                .then(() => {
                    return selectBlockPromise(2, 0, 2000)
                })
                .then((deleteBlocks) => {
                    return selectBlockPromise(3, 0, 500)
                })
                .then(() => {
                    return deleteBlockPromise([[2, 0], [3, 0]], 500)
                })
                .then(() => {
                    return selectBlockPromise(0, 1, 1000)
                })
                .then((deleteBlocks) => {
                    return selectBlockPromise(0, 2, 500)
                })
                .then(() => {
                    return deleteBlockPromise([[0, 2], [0, 1]], 500)
                })
                .then(() => {
                    return new Promise((resolve, reject) => {
                        exampleText.textContent = exampleMessages[1];
                        resolve();
                    })
                })
                .then(() => {
                    return selectBlockPromise(0, 0, 1500)
                })
                .then((deleteBlocks) => {
                    return selectBlockPromise(4, 0, 500)
                })
                .then(() => {
                    return selectBlockPromise(1, 0, 10)
                })
                .then((deleteBlocks) => {
                    return selectBlockPromise(2, 0, 0)
                })
                .then(() => {
                    return deleteBlockPromise([[0, 0], [1, 0], [2, 0], [4,0]], 500)
                })
                .then(() => {
                    return new Promise((resolve, reject) => {
                        exampleText.textContent = exampleMessages[2];
                        resolve();
                    })
                })
                .then(() => {
                    return new Promise((resolve, reject) => {
                        setTimeout(() => {
                            addRandomNumbers(exampleGameField, exampleGamePosition, false);
                            resolve()
                        }, 2500)
                    })
                })
                .then(() => {
                    return new Promise((resolve, reject) => {
                        setTimeout(() => {
                            addRandomNumbers(exampleGameField, exampleGamePosition, false);
                            resolve()
                        }, 750)
                    })
                })
                .then(() => {
                    return new Promise((resolve, reject) => {
                        setTimeout(() => {
                            addRandomNumbers(exampleGameField, exampleGamePosition, false);
                            resolve()
                        }, 750)
                    })
                })
                .then(() => {
                    return new Promise((resolve, reject) => {
                        exampleText.textContent = exampleMessages[3];
                        resolve();
                    })
                })
                .then(() => {
                    if (exampleGameSlide != 0) timer = setTimeout(tick, 3000);
                })
        }, 0);



    };

    const saveGameInfo = () => {
        localStorage.setItem('fnumGamePosition', JSON.stringify(gamePosition));
        localStorage.setItem('fnumScore', score);
        localStorage.setItem('fnumSteps', steps);
        localStorage.setItem('fnumStepsToAddition', stepsToBlocksAddition);
        localStorage.setItem('fnumRecord', record);

        sessionStorage.setItem('fnumGamePosition', JSON.stringify(gamePosition));
        sessionStorage.setItem('fnumScore', score);
        sessionStorage.setItem('fnumSteps', steps);
        sessionStorage.setItem('fnumStepsToAddition', stepsToBlocksAddition);
    };

    const loadGameInfo = () => {
        gamePosition = JSON.parse(localStorage.getItem('fnumGamePosition')) || [];
        score = +localStorage.getItem('fnumScore') || 0;
        steps = +localStorage.getItem('fnumSteps') || 0;
        stepsToBlocksAddition = +localStorage.getItem('fnumStepsToAddition') || STEPS_BLOCKS_ADDITION_INTERVAL;
        record = +localStorage.getItem('fnumRecord') || 0;
    };

    const loadSessionGameInfo = () => {
        gamePosition = JSON.parse(sessionStorage.getItem('fnumGamePosition')) || [];
        score = +sessionStorage.getItem('fnumScore') || 0;
        steps = +sessionStorage.getItem('fnumSteps') || 0;
        stepsToBlocksAddition = +sessionStorage.getItem('fnumStepsToAddition') || STEPS_BLOCKS_ADDITION_INTERVAL;
    };

    const saveSettings = () => {
        localStorage.setItem('fnumColorScheme', colorSchemeNumber);
        localStorage.setItem('fnumIsPlayMusic', isPlayMusic);
        localStorage.setItem('fnumIsPlaySounds', isPlaySounds);
    };

    const loadSettings = () => {
        colorSchemeNumber = +localStorage.getItem('fnumColorScheme') || colorSchemeNumber;
        isPlayMusic = localStorage.getItem('fnumIsPlayMusic') || isPlayMusic;
        isPlaySounds = localStorage.getItem('fnumIsPlaySounds') || isPlaySounds;
    };

    const clearSavings = () => {
        localStorage.removeItem('fnumGamePosition');
        localStorage.removeItem('fnumScore');
        localStorage.removeItem('fnumSteps');
        localStorage.removeItem('fnumStepsToAddition');
    };

    const clickNumber = event => {
        /* клик на цифровом блоке */

        if (!isPlayingGame) return;

        // ищем ужевыделенный блок
        let selectedNumber = gameField.querySelector('.selected');
        let clickedNumber = event.target;

        // добавляем выделение блоку, на котором был клик
        clickedNumber.classList.toggle('selected');

        // если ход не делается, снятие выделение блока
        if (!isMutuals(selectedNumber, clickedNumber, true) && selectedNumber) {
            selectedNumber.classList.remove('selected');
        }

        // проверка, не пора ли добавить новые блоки
        if (!stepsToBlocksAddition) {
            addRandomNumbers(gameField, gamePosition);
            stepsToBlocksAddition = STEPS_BLOCKS_ADDITION_INTERVAL;
        }

        // проверка окончания игры
        checkGameStatus();
        // обновление стилей блоков
        refreshBlocksStyles();

        // вывод счета и количества ходов до обновления
        scoreBar.textContent = score;
        stepsBar.textContent = steps;

        saveGameInfo();
    };

    const clickAddNumbersBtn = event => {
        if (!isPlayingGame) return;
        addRandomNumbers(gameField, gamePosition);
        checkGameStatus();
        refreshBlocksStyles();

        stepsToBlocksAddition = STEPS_BLOCKS_ADDITION_INTERVAL;
    };

    const clickTip = event => {
        if (!isPlayingGame) return;

        if (!tip.length) return;
        scorePenalty = POINTS_PENALTY;
        let tipElem = gameField.querySelector(`.number[data-elemnumber="${tip[0][1]}"][data-colnumber="${tip[0][0]}"]`);
        tipElem.classList.add('tip');
        tipElem = gameField.querySelector(`.number[data-elemnumber="${tip[1][1]}"][data-colnumber="${tip[1][0]}"]`);
        tipElem.classList.add('tip');

        refreshBlocksStyles();
    };

    const clickRestart = () => {
        showMessage('Вы действительно хотите начать игру заново?', 'Да',
            () => {
                startGame();
            }, 'Нет',() => null);
    };

    const clickMenuBtn = () => {
        saveGameInfo();
        showScreen(startScreen);
    };

    const startGame = (isNewGame=true) => {

        isPlayingGame = true;
        tip = [];
        scorePenalty = 0;
        scoreCoefficient = 1;

        clearGameField(gameField);


        if (isNewGame) {
            clearSavings();
            generateGamePosition();
            score = 0;
            steps = 0;
            stepsToBlocksAddition = STEPS_BLOCKS_ADDITION_INTERVAL;
        }

        scoreBar.textContent = score;
        stepsBar.textContent = steps;
        recordBar.textContent = record;

        createGameLevel(gameField, gamePosition);
        checkGameStatus();
    };

    /* ЭКРАН НАСТРОЕК */
    const createColorSchemes = () => {
        colorSchemeLabels = [];
        colorSchemeRadios = [];

        for (let i = 0; i < COLOR_SCHEMES.length; i++) {
            let labelCol = document.createElement('label');
            labelCol.setAttribute('for', `color-scheme-${i}`);

            let inputCol = document.createElement('input');
            inputCol.setAttribute('type', 'radio');
            inputCol.setAttribute('id', `color-scheme-${i}`);
            inputCol.setAttribute('value', i);
            inputCol.setAttribute('name', 'color-scheme');
            if (colorSchemeNumber == i) inputCol.setAttribute('checked', '');
            inputCol.addEventListener('change', (e) => {
                chooseColorScheme(e.target.value)
            });

            let ns = 'http://www.w3.org/2000/svg';
            let svg1 = document.createElementNS(ns, 'svg');
            svg1.setAttributeNS(null,'width', '24');
            svg1.setAttributeNS(null,'height', '24');
            svg1.classList.add('radiobutton');
            svg1.classList.add('radiobutton-selected');
            let path1 = document.createElementNS(ns,'path');
            path1.setAttributeNS(null,'d', 'M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 6c-3.313 0-6 2.687-6 6s2.687 6 6 6c3.314 0 6-2.687 6-6s-2.686-6-6-6z');
            svg1.appendChild(path1);

            let svg2 = document.createElementNS(ns, 'svg');
            svg2.setAttributeNS(null,'width', '24');
            svg2.setAttributeNS(null,'height', '24');
            svg2.classList.add('radiobutton');
            svg2.classList.add('radiobutton-unselected');
            let path2 = document.createElementNS(ns,'path');
            path2.setAttributeNS(null,'d', 'M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12z');
            svg2.appendChild(path2);


            let spanCol = document.createElement('span');
            spanCol.classList.add('color-scheme');

            labelCol.appendChild(inputCol);
            labelCol.appendChild(svg1);
            labelCol.appendChild(svg2);
            labelCol.appendChild(spanCol);

            if (i + 1 !== COLOR_SCHEMES.length) {
                let br = document.createElement('br');
                labelCol.appendChild(br);
            }

            colorSchemesDiv.appendChild(labelCol);

            colorSchemeLabels.push(spanCol);
            // colorSchemeRadios.push(inputCol);
        }
        radioImgs = document.querySelectorAll('.radiobutton');
    };

    const init = () => {
        /* инициализация приложения */
        new Promise((resolve, reject) => {
            calcGameElementsSizes();
            resolve();
        })
            .then(() => {
                return new Promise((resolve, reject) => {
                    loadSettings();
                    resolve();
                })
            })
            .then(() => {
                return new Promise((resolve, reject) => {
                    createColorSchemes();
                    resolve();
                })
            })
            .then(() => {
                return new Promise((resolve, reject) => {
                    setGameFieldStyles();
                    resolve();
                })
            })
            .then(() => {
                return new Promise((resolve, reject) => {
                    loading.style.display = 'none';
                    showScreen(startScreen);
                    resolve();
                })
            });

    };

    // нажатие на кнопки в стартовом меню
    newGameBtn.addEventListener('click', clickStartGame);
    howToPlayBtn.addEventListener('click', () => {
        createExampleGameLevel();
        showScreen(howToPlayScreen)
    });
    settingsBtn.addEventListener('click', () => {showScreen(settingsScreen)});
    aboutGameBtn.addEventListener('click', () => {showScreen(aboutGameScreen)});

    // нажатие на кнопки на экране игры
    addNumbersBtn.addEventListener('click', clickAddNumbersBtn);
    tipBtn.addEventListener('click', clickTip);
    restartnBtn.addEventListener('click', clickRestart);
    menuBtn.addEventListener('click', clickMenuBtn);

    for (let btn of backBtns) {
        btn.addEventListener('click', () => {
            showScreen(startScreen);
        });
        if (btn.classList.contains('how-to-play-back-btn')) btn.addEventListener('click', () => {
            exampleGameSlide = 0;
        })
    }

    init();
});