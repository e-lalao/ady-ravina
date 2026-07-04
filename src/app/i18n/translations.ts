export type Lang = 'mg' | 'fr' | 'en';

export interface AppTranslations {
  // Splash
  splashTap: string;
  // Hero nav
  navRules: string;
  navAbout: string;
  // Hero
  speechBubble: string;
  playBtn: string;
  rulesBtn: string;
  visitorsLabel: string;
  // Rules
  rulesTitle: string;
  rulesSub: string;
  r1q: string; r1a: string;
  r2q: string; r2a: string;
  r3q: string; r3a: string;
  // About
  aboutTitle: string;
  aboutText: string;
  contactBtn: string;
  visitBtn: string;
  contactLabel: string;
  footerLine: string;
  // Lobby
  yourName: string;
  namePlaceholder: string;
  createRoom: string;
  joinRoom: string;
  back: string;
  backHome: string;
  roomCode: string;
  roomNotFound: string;
  gameAlreadyStarted: string;
  loading: string;
  joining: string;
  joinBtn: string;
  creating: string;
  searching: string;
  // Room
  copyCode: string;
  codeCopied: string;
  players: string;
  collectionDuration: string;
  startGame: string;
  starting: string;
  waitingForHost: string;
  leave: string;
  // Collect
  collectTitle: string;
  leavesUnit: string;
  tanteQuote: string;
  tapToContinue: string;
  // Battle
  droppingIndicator: string;
  roundResult: string;
  matchedLabel: string;
  noMatchLabel: string;
  yourTurnDrop: string;
  noLeavesAnymore: string;
  waitingToDrop: string;
  droppedBy: string;
  waitingResponses: string;
  haveLeafQuestion: string;
  noLeavesInHand: string;
  dontHaveBtn: string;
  checkHaveIt: string;
  matchedResult: string;
  plusOne: string;
  dontHaveCard: string;
  waitingOthers: string;
  battleDone: string;
  waitingResults: string;
  turnPrefix: string;
  turnSuffix: string;
  // Results
  resultsTitle: string;
  resultLoading: string;
  winnerLabel: string;
  rankingLabel: string;
  leavesCollected: string;
  playAgain: string;
  waitingForHostResults: string;
  backToHome: string;
  // Join
  invitedToJoin: string;
  enterYourName: string;
  namePlaceholderJoin: string;
  joinBtnLabel: string;
  joiningLabel: string;
  roomNotFoundJoin: string;
  gameStartedJoin: string;
}

export const TRANSLATIONS: Record<Lang, AppTranslations> = {
  mg: {
    splashTap: '▶ Tsindrio eto raha hanomboka',
    navRules: '🌿 Ny fitsipika',
    navAbout: '🌿 e-lalao',
    speechBubble: 'Andao<br>hampiady<br>ravina ô!',
    playBtn: 'Hilalao',
    rulesBtn: 'Ny fitsipika',
    visitorsLabel: 'Mpitsidika',
    rulesTitle: 'Ny Ady Ravina',
    rulesSub: "Kilalao fanaon'ny ankizy malagasy",
    r1q: "Inona moa ny ady ravina?",
    r1a: "Kilalao fanaon'ny ankizy malagasy ny ady ravina. Rehefa ilay miala sasatra any ambanivohitra na monina amin'ny toerana feno zava-maitso iny no tena fampiadiana ravina. Ravin-kazo matetika no fampiadiana — bedin'ny olon-dehibe manko raha tratra mitango anana na voninkazo nambolena!",
    r2q: "Ahoana no filalaovana azy?",
    r2a: "Miparitaka ny rehetra ka miezaka manangona karazan-dravina isan-karazany. Misy iray mandatsaka ravina iray eo amin'ny tany (ohatra: ravi-manga), dia mandatsaka ravina mitovy karazana aminy avokoa ny rehetra(Izany hoe ravi-manga koa). Resy izay tsy manana an'ilay ravina alatsaka. Mitohy hatrany ny lalao mandrapahalany ny ravina eny an-tananan'ny rehetra. Atambatra ny isa ka izay be isa indrindra no mandresy!",
    r3q: "Amin'ity kilalao ity mba ahoana?",
    r3a: "Omena 4 segondra farafahakeliny ary 7 segondra farafahabeny ny mpilalao rehetra isafidianana ravina haingana. Mety tsy hitovy karazana ary tsy mitovy isa araka izany ny ravin'ny mpilalao tsirairay. Azo atao tsara ny maka ravina mitovy karazana maromaro (ohatra: maka ravi-manga 3). Avy eo manomboka ny ady ravina!",
    aboutTitle: "Momba ny e-lalao",
    aboutText: "Ny e-lalao dia tetikasa iezahana hanandratana ny fiteny sy ny kolontsaina malagasy amin'ny alalan'ny teknolojia avo lenta. Misokatra amin'ny fiaraha-miasa sy torohevitra ary ny famatsiana rehetra izahay. Ny hevitrao dia sarobidy aminay — aza misalasala mifandray aminay raha misy tianao zaraina.",
    contactBtn: 'Te hifandray aminay',
    visitBtn: 'Hitsidika ny tranokala e-lalao',
    contactLabel: 'Alefaso ny hevitrao',
    footerLine: 'Natao am-pitiavana hanandratana ny kolontsaina malagasy',
    yourName: 'Anaranao:',
    namePlaceholder: 'Anarana...',
    createRoom: 'Hamorona vondrona',
    joinRoom: 'Hanatevin-daharana',
    back: '← Hiverina',
    backHome: "← Hiverina any amin'ny pejy voalohany",
    roomCode: "Teny miafinan'ny vondrona",
    roomNotFound: 'Tsy hita ilay vondrona. Jereo ny teny miafina.',
    gameAlreadyStarted: 'Efa nanomboka ny lalao ao.',
    loading: 'Miandry...',
    joining: 'Miditra...',
    joinBtn: 'Hiditra',
    creating: 'Mamorona vondrona...',
    searching: 'Mitady efitra...',
    copyCode: 'Handika ny teny miafina',
    codeCopied: 'Teny miafina voadika!',
    players: 'Mpilalao',
    collectionDuration: "Faharetan'ny angon-dravina :",
    startGame: 'Hanangona',
    starting: 'Manomboka...',
    waitingForHost: "Miandry ny tompon'ny vondrona...",
    leave: '← Hiala',
    collectTitle: 'Hanangona ravina!',
    leavesUnit: 'ravina',
    tanteQuote: "Rankizy a!<br>Aza tangosanareo ny ananako.",
    tapToContinue: 'Tsindrio hanohy',
    droppingIndicator: '▲ mandatsaka',
    roundResult: 'Vokatry ny famolavolana:',
    matchedLabel: '✓ Mitovy (+1)',
    noMatchLabel: '✗ Tsy mitovy',
    yourTurnDrop: 'Anjara-manao! Safidio ny ravina hatatsahana:',
    noLeavesAnymore: 'Tsy misy ravina intsony.',
    waitingToDrop: 'misafidy ravina hatatsahana...',
    droppedBy: 'nandatsaka:',
    waitingResponses: "Miandry ny valim-balin'ny mpilalao...",
    haveLeafQuestion: 'Manana ravina mitovy? Safidio na tsindrio "Tsy manana":',
    noLeavesInHand: 'Tsy misy ravina eo aminao.',
    dontHaveBtn: 'Tsy manana 🚫',
    checkHaveIt: '👀 Jereo tsara fa manana ianao!',
    matchedResult: 'Mitovy!',
    plusOne: '+1 azo',
    dontHaveCard: 'Tsy manana',
    waitingOthers: 'Miandry ny hafa...',
    battleDone: 'Vita ny Ady Ravina!',
    waitingResults: 'Miandry ny vokatra...',
    turnPrefix: "Anjaran'i",
    turnSuffix: '',
    resultsTitle: 'Vokatry ny lalao',
    resultLoading: 'Miandry...',
    winnerLabel: 'Mandresy!',
    rankingLabel: 'Laharana',
    leavesCollected: 'ravina angona',
    playAgain: 'Hilalao indray',
    waitingForHostResults: "Miandry ny tompon'ny vondrona...",
    backToHome: "Hiverina any amin'ny pejy voalohany",
    invitedToJoin: "Voaasa handray anjara amin'ny",
    enterYourName: 'Ny anaranao :',
    namePlaceholderJoin: 'Ohatra: Rakoto',
    joinBtnLabel: 'Miditra ▶',
    joiningLabel: 'Miditra...',
    roomNotFoundJoin: 'Tsy hita ity efitra ity. Manamarina ny teny miafina azafady.',
    gameStartedJoin: 'Efa nanomboka ny lalao. Teneno ny namanao hametraka teny miafina vaovao.',
  },

  fr: {
    splashTap: '▶ Appuyez pour commencer',
    navRules: '🌿 Les règles',
    navAbout: '🌿 e-lalao',
    speechBubble: "Jouons à<br>l'Ady<br>Ravina !",
    playBtn: 'Jouer',
    rulesBtn: 'Les règles',
    visitorsLabel: 'Visiteurs',
    rulesTitle: "L'Ady Ravina",
    rulesSub: 'La bataille des feuilles — jeu traditionnel malagasy',
    r1q: "Qu'est-ce que l'ady ravina ?",
    r1a: "L'ady ravina est un jeu traditionnel pratiqué par les enfants malgaches à la campagne ou dans les zones verdoyantes. On se bat avec des feuilles ramassées dans la nature. Les adultes grondent souvent ceux qui se font attraper à cueillir les feuilles de leurs légumes ou les herbes et fleurs de leurs jardins !",
    r2q: 'Comment y jouer ?',
    r2a: "Tout le monde se disperse et ramasse le plus de variétés de feuilles possible. Ensuite, un joueur pose une feuille au sol (ex. : feuille de manguier) — tous ceux qui en ont une pareille la posent aussi. Celui qui n'en a pas perd ce tour. On continue jusqu'à ce que plus personne n'ait de feuilles, puis on compte les points. Celui qui en a le plus gagne !",
    r3q: 'Dans ce jeu ?',
    r3a: "Chaque joueur dispose de 4 à 7 secondes pour collecter le plus de feuilles possible. Les collections peuvent varier d'un joueur à l'autre. Il est possible de sélectionner le même type de feuille plusieurs fois (ex. : 3 feuilles de manguier). Ensuite commence le vrai affrontement !",
    aboutTitle: "À propos d'e-lalao",
    aboutText: "e-lalao est un projet dédié à la valorisation de la langue et de la culture malgaches à travers la technologie moderne. Nous sommes ouverts à toute collaboration, conseil ou soutien. Vos idées nous sont précieuses — n'hésitez pas à nous écrire.",
    contactBtn: 'Nous contacter',
    visitBtn: 'Visiter le site e-lalao',
    contactLabel: 'Envoyez-nous vos idées et suggestions',
    footerLine: 'Fait avec amour pour la culture malgache',
    yourName: 'Votre prénom :',
    namePlaceholder: 'Prénom...',
    createRoom: 'Créer une partie',
    joinRoom: 'Rejoindre une partie',
    back: '← Retour',
    backHome: "← Retour à l'accueil",
    roomCode: 'Code secret',
    roomNotFound: 'Partie introuvable. Vérifiez le code.',
    gameAlreadyStarted: 'La partie a déjà commencé.',
    loading: 'Chargement...',
    joining: 'Connexion...',
    joinBtn: 'Rejoindre',
    creating: 'Création...',
    searching: 'Recherche...',
    copyCode: 'Copier le code',
    codeCopied: 'Code copié !',
    players: 'Joueurs',
    collectionDuration: 'Durée de collecte :',
    startGame: 'Commencer',
    starting: 'Démarrage...',
    waitingForHost: "En attente de l'hôte...",
    leave: '← Quitter',
    collectTitle: 'Collectez les feuilles !',
    leavesUnit: 'feuilles',
    tanteQuote: "Attention !<br>Ne prenez pas mes légumes !",
    tapToContinue: 'Appuyez pour continuer',
    droppingIndicator: '▲ joue',
    roundResult: 'Résultat du tour :',
    matchedLabel: '✓ Identique (+1)',
    noMatchLabel: '✗ Différent',
    yourTurnDrop: 'À toi ! Choisis une feuille à poser :',
    noLeavesAnymore: 'Plus de feuilles.',
    waitingToDrop: 'choisit une feuille...',
    droppedBy: 'a posé :',
    waitingResponses: 'En attente des réponses...',
    haveLeafQuestion: 'Tu as cette feuille ? Choisis-en une ou clique ci-dessous :',
    noLeavesInHand: "Plus de feuilles en main.",
    dontHaveBtn: "Je n'ai pas 🚫",
    checkHaveIt: '👀 Attention, tu as cette feuille !',
    matchedResult: 'Identique !',
    plusOne: '+1 gagné',
    dontHaveCard: "Je n'ai pas",
    waitingOthers: 'En attente...',
    battleDone: "Fin de l'Ady Ravina !",
    waitingResults: 'Chargement des résultats...',
    turnPrefix: 'Tour de',
    turnSuffix: '',
    resultsTitle: 'Résultats',
    resultLoading: 'Chargement...',
    winnerLabel: 'Vainqueur !',
    rankingLabel: 'Classement',
    leavesCollected: 'feuilles collectées',
    playAgain: 'Rejouer',
    waitingForHostResults: "En attente de l'hôte...",
    backToHome: "Retour à l'accueil",
    invitedToJoin: 'Invité à rejoindre',
    enterYourName: 'Votre prénom :',
    namePlaceholderJoin: 'Ex. : Rakoto',
    joinBtnLabel: 'Rejoindre ▶',
    joiningLabel: 'Connexion...',
    roomNotFoundJoin: 'Partie introuvable. Vérifiez le code.',
    gameStartedJoin: "La partie est déjà en cours. Demandez à votre ami de créer une nouvelle partie.",
  },

  en: {
    splashTap: '▶ Tap to start',
    navRules: '🌿 The rules',
    navAbout: '🌿 e-lalao',
    speechBubble: "Let's play<br>Ady<br>Ravina!",
    playBtn: 'Play',
    rulesBtn: 'The rules',
    visitorsLabel: 'Visitors',
    rulesTitle: 'Ady Ravina',
    rulesSub: 'The traditional Malagasy leaf-fighting game',
    r1q: 'What is ady ravina?',
    r1a: "Ady ravina is a traditional game played by Malagasy children in the countryside or in lush green areas. Players battle it out using leaves collected from nature. Adults often scold anyone caught picking their vegetables or planted flowers!",
    r2q: 'How to play?',
    r2a: "Everyone spreads out and collects as many different types of leaves as possible. Then one player drops a leaf (e.g. mango leaf) — everyone who has the same one drops it too. Those who don't have it lose that round. The game continues until everyone runs out of leaves, then points are tallied. Highest score wins!",
    r3q: 'In this game?',
    r3a: "Each player gets between 4 and 7 seconds to collect as many leaves as they can. Collections may differ between players. You can collect the same type of leaf multiple times (e.g. take 3 mango leaves). Then the real battle begins!",
    aboutTitle: 'About e-lalao',
    aboutText: "e-lalao is a project dedicated to promoting the Malagasy language and culture through modern technology. We are open to all collaborations, advice and support. Your ideas matter to us — feel free to reach out.",
    contactBtn: 'Contact us',
    visitBtn: 'Visit the e-lalao website',
    contactLabel: 'Send us your ideas and feedback',
    footerLine: 'Made with love for Malagasy culture',
    yourName: 'Your name:',
    namePlaceholder: 'Name...',
    createRoom: 'Create a game',
    joinRoom: 'Join a game',
    back: '← Back',
    backHome: '← Back to home',
    roomCode: 'Room code',
    roomNotFound: 'Room not found. Check the code.',
    gameAlreadyStarted: 'The game has already started.',
    loading: 'Loading...',
    joining: 'Joining...',
    joinBtn: 'Join',
    creating: 'Creating...',
    searching: 'Searching...',
    copyCode: 'Copy the code',
    codeCopied: 'Code copied!',
    players: 'Players',
    collectionDuration: 'Collection duration:',
    startGame: 'Start',
    starting: 'Starting...',
    waitingForHost: 'Waiting for the host...',
    leave: '← Leave',
    collectTitle: 'Collect leaves!',
    leavesUnit: 'leaves',
    tanteQuote: "Hey kids!<br>Don't take my veggies!",
    tapToContinue: 'Tap to continue',
    droppingIndicator: '▲ dropping',
    roundResult: 'Round result:',
    matchedLabel: '✓ Matched (+1)',
    noMatchLabel: '✗ No match',
    yourTurnDrop: 'Your turn! Choose a leaf to drop:',
    noLeavesAnymore: 'No more leaves.',
    waitingToDrop: 'choosing a leaf...',
    droppedBy: 'dropped:',
    waitingResponses: 'Waiting for responses...',
    haveLeafQuestion: "Have this leaf? Pick one or click the button below:",
    noLeavesInHand: 'No leaves in hand.',
    dontHaveBtn: "Don't have it 🚫",
    checkHaveIt: '👀 Wait, you have this leaf!',
    matchedResult: 'Matched!',
    plusOne: '+1 scored',
    dontHaveCard: "Don't have it",
    waitingOthers: 'Waiting...',
    battleDone: 'Ady Ravina is over!',
    waitingResults: 'Loading results...',
    turnPrefix: '',
    turnSuffix: "'s turn",
    resultsTitle: 'Results',
    resultLoading: 'Loading...',
    winnerLabel: 'Winner!',
    rankingLabel: 'Rankings',
    leavesCollected: 'leaves collected',
    playAgain: 'Play again',
    waitingForHostResults: 'Waiting for the host...',
    backToHome: 'Back to home',
    invitedToJoin: 'Invited to join',
    enterYourName: 'Your name:',
    namePlaceholderJoin: 'E.g.: Rakoto',
    joinBtnLabel: 'Join ▶',
    joiningLabel: 'Joining...',
    roomNotFoundJoin: 'Room not found. Check the code.',
    gameStartedJoin: "Game already in progress. Ask your friend to create a new room.",
  },
};
