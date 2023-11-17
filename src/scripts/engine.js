const state = {
      score: {
            playerScore: 0,
            computerScore: 0,
            winScoreBox : document.querySelector('#score_win-points'),
            loseScoreBox: document.querySelector('#score_lose-points')
      },
      cardSprites: {
            avatar: document.querySelector('#card-image'),
            name: document.querySelector('#card-name'),
            type: document.querySelector('#card-type')
      },
      fieldCards: {
            playerCards: document.querySelector('#player-field-card'),
            computerCards: document.querySelector('#computer-field-card')
      },
      playerSides: {
            player1: 'player-cards',
            player1BOX: document.querySelector('.card-box.framed#player-cards'),
            computer: 'computer-cards',
            computerBOX: document.querySelector('.card-box.framed#computer-cards')
      },
      actions: {
            button: document.querySelector('#next-duel')
      }
}

const pathImages = './src/assets/icons/'
const cardData = [
      {
            id: 0,
            name: 'Blue Eyes White Dragon',
            type: 'paper',
            img:  `${pathImages}dragon.png`,
            WinOf: [1],
            LoseOf: [2]
      },
      {
            id: 1,
            name: 'Dark Magician',
            type: 'rock',
            img:  `${pathImages}magician.png`,
            WinOf: [2],
            LoseOf: [0]
      },
      {
            id: 2,
            name: 'Exodia',
            type: 'scissor',
            img:  `${pathImages}exodia.png`,
            WinOf: [0],
            LoseOf: [1]
      }
]

const playAudio = async status => {
      const audio = new Audio(`./src/assets/audios/${status}.wav`)

      try {
            audio.play()

      }catch(error){
            console.error(error)
      }
}

const updateScore = async () => {
      state.score.winScoreBox.innerText =  `Win: ${state.score.playerScore}`
      state.score.loseScoreBox.innerHTML = `Lose: ${state.score.computerScore}`
}


const checkDuelResults = async (playerCardId, computerCardId) => {
      let duelResults = 'Draw'
      let playerCard = cardData[playerCardId]

      if(playerCard.WinOf.includes(computerCardId)) {
            duelResults = 'Win'
            await playAudio(duelResults)
            state.score.playerScore++
      }

      if(playerCard.LoseOf.includes(computerCardId)) {
            duelResults = 'Lose'
            await playAudio(duelResults)
            state.score.computerScore++
      }

      return duelResults
}

const drawButton = async text => {
      state.actions.button.innerText = text.toUpperCase()
      state.actions.button.style.display = 'block'
}

const showHiddenCardFieldsImages = async value => {
      if(value) {
            state.fieldCards.playerCards.style.display = 'block'
            state.fieldCards.computerCards.style.display = 'block'
      } else {
            state.fieldCards.playerCards.style.display = 'none'
            state.fieldCards.computerCards.style.display = 'none'
      }
}

const getRandomCardId = async () =>{
      const randomIndex = Math.floor(Math.random() * cardData.length)
      return cardData[randomIndex].id
}

const drawCardsInfield = async (cardId, computerCardId) => {
      state.fieldCards.playerCards.src = cardData[cardId].img
      state.fieldCards.computerCards.src = cardData[computerCardId].img
}

const removeAllCardsImages = async () => {
      let { computerBOX, player1BOX } = state.playerSides
      let imgElements = computerBOX.querySelectorAll('img')
      imgElements.forEach(img => img.remove())

      imgElements = player1BOX.querySelectorAll('img')
      imgElements.forEach(img => img.remove())
}

const setCardsField = async cardId => {
      await removeAllCardsImages()
      let computerCardId = await getRandomCardId()
      
      await setCardDetails('', '', '')
      await drawCardsInfield(cardId, computerCardId)
      await showHiddenCardFieldsImages(true)

      let duelResults = await checkDuelResults(cardId, computerCardId)
      await updateScore()
      await drawButton(duelResults)

      init('reset')
}

const setCardDetails = async (source, name, type) => {
      state.cardSprites.avatar.src = source
      state.cardSprites.avatar.style.display = 'block'
      state.cardSprites.name.innerText = name
      state.cardSprites.type.innerText = type
}

const createCardImage = async (IdCard, fieldSide) => {
      const cardImage = document.createElement('img')
      cardImage.setAttribute('height', '100px')
      cardImage.setAttribute('src', './src/assets/icons/card-back.png')
      cardImage.setAttribute('data-id', IdCard)
      cardImage.classList.add('card')

      if(fieldSide === state.playerSides.player1) {
            let lastTouchTime = 0

            cardImage.addEventListener('dblclick', () => {
                  setCardsField(cardImage.getAttribute('data-id'))
            })

            cardImage.addEventListener('mouseover', () => {
                  setCardDetails(cardData[IdCard].img, cardData[IdCard].name, `Attribute: ${cardData[IdCard].type}`)
            })
            
            cardImage.addEventListener('touchstart', event => {
                  let firstTouchTime = new Date().getTime();
                  
                  if (firstTouchTime - lastTouchTime < 300) {
                        setCardsField(cardImage.getAttribute('data-id'))
                        event.preventDefault(); 
                  }
                  lastTouchTime = firstTouchTime;
            })
      }

      return cardImage
}

const shufleAndSetCards = async (cardNumbers, fieldSide) => {
      for(let i=0; i < cardNumbers; i++) {
            const randomIdCard = await getRandomCardId()
            const cardImage = await createCardImage(randomIdCard, fieldSide)
            document.querySelector(`#${fieldSide}`).appendChild(cardImage)
      }
}

const setCards = async () => {
      shufleAndSetCards(5, state.playerSides.player1)
      shufleAndSetCards(5, state.playerSides.computer)
      showHiddenCardFieldsImages(false)
}

const hideButton = async () => {
      state.actions.button.style.display = 'none'
      state.actions.button.innerText = ''
}

const resetDuel = async () => {
      hideButton()
      setCards()
      setCardDetails('', 'Selecione', 'uma carta')
}

const startGame = async () => { 
      hideButton()
      setCards()
      const bgm = document.querySelector('#bgm')
      bgm.play()
}

const callButtonAction = action => action === 'start' 
      ? (drawButton(action), showHiddenCardFieldsImages(false), startGame)
      : resetDuel
      

const init = action => {
      state.actions.button.onclick = callButtonAction(action)
}

init('start')